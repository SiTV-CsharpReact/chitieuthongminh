using Microsoft.AspNetCore.Mvc;
using HtmlAgilityPack;
using System.Text.RegularExpressions;
using System.Web;
using System.Diagnostics;
using System.Text.Json;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace backend.Controllers;

public class ScraperExtractionRequest
{
    public string Url { get; set; } = string.Empty;
}

public class BankScraperUrlModel
{
    public string BankName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public class CardScrapedDto
{
    public string CardName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? RegisterUrl { get; set; }
    public List<CashbackInfoObj> CashbackInfos { get; set; } = new List<CashbackInfoObj>();
}

public class CashbackInfoObj
{
    public string Text { get; set; } = string.Empty;
    public decimal? SuggestedPercentage { get; set; }
    public decimal? SuggestedCap { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class ScraperController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public ScraperController(IWebHostEnvironment env, IConfiguration config)
    {
        _env = env;
        _config = config;
        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
        };
        _httpClient = new HttpClient(handler);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "curl/8.7.1");
        _httpClient.DefaultRequestHeaders.Add("Accept", "*/*");
    }

    [HttpGet("supported-banks")]
    public IActionResult GetSupportedBanks()
    {
        try
        {
            var banks = _config.GetSection("BankScraperUrls").Get<List<BankScraperUrlModel>>();
            if (banks == null) return Ok(new List<BankScraperUrlModel>());
            return Ok(banks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpGet("vib-cards")]
    public async Task<IActionResult> GetVibCards()
    {
        try
        {
            var url = "https://www.vib.com.vn/vn/the-tin-dung";
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = "Failed to fetch data from VIB Bank." });
            }

            var html = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var cardNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'img-card1')]//img");
            if (cardNodes == null || cardNodes.Count == 0)
            {
                return Ok(new List<object>());
            }

            var result = new List<object>();

            foreach (var node in cardNodes)
            {
                var src = node.GetAttributeValue("src", string.Empty);
                var alt = node.GetAttributeValue("alt", string.Empty);

                if (string.IsNullOrEmpty(src)) continue;

                if (src.StartsWith("/"))
                {
                    src = "https://www.vib.com.vn" + src;
                }

                if (!src.Contains("wps/wcm")) continue;

                result.Add(new
                {
                    Name = string.IsNullOrEmpty(alt) ? "Thẻ VIB" : alt,
                    ImageUrl = src
                });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPost("extract-card-details")]
    public async Task<IActionResult> ExtractCardDetails([FromBody] ScraperExtractionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return BadRequest(new { message = "URL is required" });
        }

        try
        {
            Uri uriResult;
            bool result = Uri.TryCreate(request.Url, UriKind.Absolute, out uriResult)
                && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);

            if (!result)
            {
                return BadRequest(new { message = "Invalid URL format" });
            }

            var response = await _httpClient.GetAsync(request.Url);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = $"Failed to fetch data from {uriResult.Host}" });
            }

            var html = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var cardsDict = new Dictionary<string, CardScrapedDto>();
            string currentCardName = "Thẻ chung";
            cardsDict[currentCardName] = new CardScrapedDto { CardName = currentCardName };

            var keywords = new[] { "hoàn tiền", "cashback", "chi tiêu", "hoàn", "tặng", "điểm", "rút", "miễn phí", "lãi suất", "ưu đãi", "trả góp" };
            var seenTexts = new HashSet<string>();
            // Collect ALL register links in order (for positional/keyword fallback)
            var allRegisterLinks = new List<string>();
            var seenLinks = new HashSet<string>();

            foreach (var node in doc.DocumentNode.Descendants())
            {
                // Track headings for card naming
                if (node.Name == "h1" || node.Name == "h2" || node.Name == "h3" || node.Name == "h4" || node.Name == "h5" || 
                   (node.Name == "div" && node.GetAttributeValue("class", "").Contains("title")))
                {
                    string title = HttpUtility.HtmlDecode(node.InnerText.Trim());
                    title = Regex.Replace(title, @"\s+", " ");
                    
                    if (title.Length > 3 && title.Length < 120)
                    {
                        string lowerTitle = title.ToLower();
                        string domain = uriResult.Host.Replace("www.", "").Split('.')[0].ToLower();
                        
                        // Intelligent check: Domain name, "thẻ", or major card brands
                        bool isCardTitle = lowerTitle.Contains(domain) || 
                                           lowerTitle.Contains("thẻ") || 
                                           lowerTitle.Contains("visa") || 
                                           lowerTitle.Contains("mastercard") || 
                                           lowerTitle.Contains("jcb") || 
                                           lowerTitle.Contains("american express") ||
                                           lowerTitle.Contains("napas");

                        if (isCardTitle)
                        {
                            currentCardName = title;
                            if (!cardsDict.ContainsKey(currentCardName))
                            {
                                cardsDict[currentCardName] = new CardScrapedDto { CardName = currentCardName };
                            }
                        }
                    }
                }

                // Extract Images
                if (node.Name == "img")
                {
                    string src = node.GetAttributeValue("src", "");
                    if (!string.IsNullOrWhiteSpace(src))
                    {
                        string lowerSrc = src.ToLower();
                        if (!lowerSrc.EndsWith(".svg") && !lowerSrc.EndsWith(".gif") && !lowerSrc.Contains("logo") && !lowerSrc.Contains("icon"))
                        {
                            if (src.StartsWith("//")) src = uriResult.Scheme + ":" + src;
                            else if (src.StartsWith("/")) src = uriResult.Scheme + "://" + uriResult.Host + src;
                            else if (!src.StartsWith("http")) src = request.Url.Substring(0, request.Url.LastIndexOf('/') + 1) + src;

                            if (string.IsNullOrEmpty(cardsDict[currentCardName].ImageUrl))
                            {
                                cardsDict[currentCardName].ImageUrl = src;
                            }
                        }
                    }
                }

                // Extract anchor links — collect ALL register links globally + try adjacent assignment
                if (node.Name == "a")
                {
                    string href = node.GetAttributeValue("href", "").Trim();
                    if (!string.IsNullOrEmpty(href) && !href.StartsWith("#") && !href.StartsWith("javascript"))
                    {
                        // Resolve relative URL
                        if (href.StartsWith("//")) href = uriResult.Scheme + ":" + href;
                        else if (href.StartsWith("/")) href = uriResult.Scheme + "://" + uriResult.Host + href;
                        else if (!href.StartsWith("http")) href = request.Url.Substring(0, request.Url.LastIndexOf('/') + 1) + href;

                        string linkText = HttpUtility.HtmlDecode(node.InnerText.Trim()).ToLower();
                        string hrefLower = href.ToLower();

                        // Check if this looks like a register/apply link
                        bool isRegisterLink =
                            linkText.Contains("đăng ký") || linkText.Contains("dang ky") ||
                            linkText.Contains("mở thẻ") || linkText.Contains("mo the") ||
                            linkText.Contains("apply") || linkText.Contains("register") ||
                            linkText.Contains("mở ngay") || linkText.Contains("đăng ký ngay") ||
                            hrefLower.Contains("register") || hrefLower.Contains("dang-ky") ||
                            hrefLower.Contains("apply") || hrefLower.Contains("mo-the") ||
                            hrefLower.Contains("open-card") || hrefLower.Contains("basic-details") ||
                            hrefLower.Contains("cards.") && (hrefLower.Contains("confirm") || hrefLower.Contains("apply"));

                        if (isRegisterLink)
                        {
                            // Try adjacent assignment (works when button is next to card heading)
                            if (string.IsNullOrEmpty(cardsDict[currentCardName].RegisterUrl))
                                cardsDict[currentCardName].RegisterUrl = href;

                            // Always collect globally for post-processing fallback
                            if (!seenLinks.Contains(href))
                            {
                                seenLinks.Add(href);
                                allRegisterLinks.Add(href);
                            }
                        }
                    }
                }

                // Extract text from leaf structural elements
                if (node.Name == "p" || node.Name == "li" || node.Name == "div" || node.Name == "span")
                {
                    // Skip if the node has structural children
                    if (node.HasChildNodes && node.ChildNodes.Any(c => c.Name == "div" || c.Name == "p" || c.Name == "ul" || c.Name == "li")) continue;

                    string text = HttpUtility.HtmlDecode(node.InnerText.Trim());
                    text = Regex.Replace(text, @"\s+", " ");

                    if (text.Length < 10 || text.Length > 250) continue; 
                    if (seenTexts.Contains(text)) continue;

                    string lowerText = text.ToLower();
                    if (keywords.Any(k => lowerText.Contains(k)))
                    {
                        seenTexts.Add(text);

                        var pctMatch = Regex.Match(text, @"(\d+(?:[\.,]\d+)?)\s*%");
                        decimal? pctFound = null;

                        if (pctMatch.Success)
                        {
                            string rawVal = pctMatch.Groups[1].Value.Replace(',', '.');
                            if (decimal.TryParse(rawVal, out decimal val)) pctFound = val;
                        }

                        var capMatch = Regex.Match(text, @"(\d+(?:[\.,]\d+)?)\s*(triệu|tr|nghìn|k|đ|vnđ)");
                        decimal? capFound = null;

                        if (capMatch.Success)
                        {
                            string rawVal = capMatch.Groups[1].Value.Replace(',', '.');
                            string unit = capMatch.Groups[2].Value.ToLower();

                            if (decimal.TryParse(rawVal, out decimal val))
                            {
                                if (unit == "triệu" || unit == "tr") capFound = val * 1000000;
                                else if (unit == "nghìn" || unit == "k") capFound = val * 1000;
                                else capFound = val; 
                            }
                        }

                        cardsDict[currentCardName].CashbackInfos.Add(new CashbackInfoObj
                        {
                            Text = text,
                            SuggestedPercentage = pctFound,
                            SuggestedCap = capFound
                        });
                    }
                }
            }

            var finalCards = cardsDict.Values.Where(c => !string.IsNullOrEmpty(c.ImageUrl) || c.CashbackInfos.Any()).ToList();

            // === POST-PROCESS: Match register links to cards that still lack one ===
            // Needed when banks list all "Dăng ký" buttons in a block AFTER the cards (e.g. VPBank)
            var cardsWithoutReg = finalCards.Where(c => string.IsNullOrEmpty(c.RegisterUrl)).ToList();
            if (cardsWithoutReg.Count > 0 && allRegisterLinks.Count > 0)
            {
                var remainingLinks = new List<string>(allRegisterLinks);

                // Strategy 1: URL slug/keyword match — try to find link whose URL contains keywords from card name
                foreach (var card in cardsWithoutReg.ToList())
                {
                    // Build keyword list from card name (keep English product names: gameon, shopee, flex, world, etc.)
                    string nameLower = card.CardName.ToLower();
                    var nameKeywords = Regex.Matches(nameLower, @"[a-z0-9]{3,}")
                        .Cast<Match>()
                        .Select(m => m.Value)
                        .Where(w => w.Length >= 4 && w != "bank" && w != "card" && w != "tin" && w != "dung" && w != "the")
                        .ToList();

                    string? matched = remainingLinks.FirstOrDefault(link =>
                        nameKeywords.Any(kw => link.ToLower().Contains(kw)));

                    if (matched != null)
                    {
                        card.RegisterUrl = matched;
                        remainingLinks.Remove(matched);
                    }
                }

                // Strategy 2: utm_content match — parse utm_content param and compare to card name
                var stillNoReg2 = finalCards.Where(c => string.IsNullOrEmpty(c.RegisterUrl)).ToList();
                foreach (var card in stillNoReg2.ToList())
                {
                    string nameLower = card.CardName.ToLower();
                    string? matched = remainingLinks.FirstOrDefault(link =>
                    {
                        var utmMatch = Regex.Match(link, @"utm_content=([^&]+)", RegexOptions.IgnoreCase);
                        if (!utmMatch.Success) return false;
                        string utmVal = Uri.UnescapeDataString(utmMatch.Groups[1].Value).ToLower();
                        return nameLower.Contains(utmVal) || utmVal.Split(new[]{'-','_',' '}).Any(w => w.Length > 3 && nameLower.Contains(w));
                    });

                    if (matched != null)
                    {
                        card.RegisterUrl = matched;
                        remainingLinks.Remove(matched);
                    }
                }

                // Strategy 3: Positional fallback — N-th card without URL gets N-th remaining link
                var stillNoReg3 = finalCards.Where(c => string.IsNullOrEmpty(c.RegisterUrl)).ToList();
                for (int i = 0; i < Math.Min(stillNoReg3.Count, remainingLinks.Count); i++)
                {
                    stillNoReg3[i].RegisterUrl = remainingLinks[i];
                }
            }

            return Ok(new
            {
                Host = uriResult.Host,
                Cards = finalCards
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi trích xuất dữ liệu: {ex.Message}" });
        }
    }

    [HttpPost("extract-promotions")]
    public async Task<IActionResult> ExtractPromotions([FromBody] ScraperExtractionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return BadRequest(new { message = "URL is required" });
        }

        try
        {
            Uri uriResult;
            bool result = Uri.TryCreate(request.Url, UriKind.Absolute, out uriResult)
                && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);

            if (!result)
            {
                return BadRequest(new { message = "Invalid URL format" });
            }

            if (request.Url.Contains("vib.com.vn"))
            {
                try {
                    var vibPromos = await ScrapeVibPromotionsApi();
                    if (vibPromos.Any())
                    {
                        return Ok(new {
                            Host = uriResult.Host,
                            TotalFound = vibPromos.Count,
                            Promotions = vibPromos
                        });
                    }
                } catch { /* fallback to general scraper */ }
            }

            var response = await _httpClient.GetAsync(request.Url);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = $"Failed to fetch data from {uriResult.Host}" });
            }

            var html = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var extractedPromotions = new List<object>();
            var seenTitles = new HashSet<string>();

            // Scrape logic for VIB Promotions or general
            // Tìm các item khối (thường có class item, box, card, promotion...)
            var itemNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'item') or contains(@class, 'box') or contains(@class, 'card') or contains(@class, 'promo')]");

            if (itemNodes != null)
            {
                foreach (var node in itemNodes)
                {
                    var imgNode = node.SelectSingleNode(".//img");
                    var titleNode = node.SelectSingleNode(".//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or contains(@class, 'title') or contains(@class, 'name')]");
                    
                    if (imgNode == null || titleNode == null) continue;

                    string title = HttpUtility.HtmlDecode(titleNode.InnerText.Trim());
                    title = Regex.Replace(title, @"\s+", " ");
                    
                    if (string.IsNullOrWhiteSpace(title) || title.Length < 5) continue;
                    if (seenTitles.Contains(title)) continue;

                    string src = imgNode.GetAttributeValue("src", "");
                    if (string.IsNullOrWhiteSpace(src)) src = imgNode.GetAttributeValue("data-src", "");
                    
                    if (string.IsNullOrWhiteSpace(src) || src.EndsWith(".svg") || src.Contains("logo")) continue;

                    // Absolute Path resolve
                    if (src.StartsWith("//"))
                    {
                        src = uriResult.Scheme + ":" + src;
                    }
                    else if (src.StartsWith("/"))
                    {
                        src = uriResult.Scheme + "://" + uriResult.Host + src;
                    }
                    else if (!src.StartsWith("http"))
                    {
                        var basePath = request.Url.Substring(0, request.Url.LastIndexOf('/') + 1);
                        src = basePath + src;
                    }

                    // Thử tìm text xem có chứa % hay VND không, làm discount
                    var allText = HttpUtility.HtmlDecode(node.InnerText);
                    var pctMatch = Regex.Match(allText, @"(\d+(?:[\.,]\d+)?)\s*%");
                    string discount = "";
                    if (pctMatch.Success) discount = pctMatch.Value;
                    else 
                    {
                        var crMatch = Regex.Match(allText, @"\d+\s*(triệu|tr|nghìn|k|đ|vnđ|vnd)", RegexOptions.IgnoreCase);
                        if (crMatch.Success) discount = "Giảm " + crMatch.Value;
                    }

                    // Thử tìm ngày hết hạn
                    var dateMatch = Regex.Match(allText, @"(\d{2}/\d{2}/\d{4})");
                    string validUntil = "";
                    if (dateMatch.Success) validUntil = dateMatch.Value;

                    extractedPromotions.Add(new
                    {
                        Title = title,
                        ImageUrl = src,
                        DiscountRate = discount,
                        ValidUntil = validUntil,
                        SourceUrl = request.Url,
                        CategoryTab = "Khác"
                    });
                    
                    seenTitles.Add(title);
                }
            }

            return Ok(new
            {
                Host = uriResult.Host,
                TotalFound = extractedPromotions.Count,
                Promotions = extractedPromotions
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi trích xuất ưu đãi: {ex.Message}" });
        }
    }

    private async Task<List<object>> ScrapeVibPromotionsApi()
    {
        try 
        {
            var jsonPath = Path.Combine(_env.ContentRootPath, "..", "vib_promotions_scraped.json");
            
            if (System.IO.File.Exists(jsonPath)) 
            {
                var content = await System.IO.File.ReadAllTextAsync(jsonPath);
                return JsonSerializer.Deserialize<List<object>>(content) ?? new List<object>();
            }
        } 
        catch (Exception ex)
        {
            Console.WriteLine($"Mock ScrapeVib error: {ex.Message}");
        }

        return new List<object>();
    }
}
