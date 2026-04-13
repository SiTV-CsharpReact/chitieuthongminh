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

            foreach (var node in doc.DocumentNode.Descendants())
            {
                // Track headings
                if (node.Name == "h1" || node.Name == "h2" || node.Name == "h3" || node.Name == "h4" || node.Name == "h5")
                {
                    string title = HttpUtility.HtmlDecode(node.InnerText.Trim());
                    title = Regex.Replace(title, @"\s+", " ");
                    if (title.Length > 3 && title.Length < 100)
                    {
                        string lowerTitle = title.ToLower();
                        string domain = uriResult.Host.Replace("www.", "").Split('.')[0].ToLower(); // e.g. 'vib'
                        
                        if (lowerTitle.Contains(domain) || lowerTitle.Contains("thẻ"))
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
