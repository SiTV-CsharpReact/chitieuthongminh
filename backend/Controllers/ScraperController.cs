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
    public string? PromotionUrl { get; set; }
    public string? ScrapingMethod { get; set; }
}

public class CardScrapedDto
{
    public string CardName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? RegisterUrl { get; set; }
    public string? DetailUrl { get; set; }
    public decimal? AnnualFee { get; set; }
    public decimal? MinSalary { get; set; }
    public string? CreditLimit { get; set; }
    public string? InterestRate { get; set; }
    public string? TermsPdfUrl { get; set; }
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

            // Try multiple selectors to find card images
            var cardNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'img-card1')]//img")
                ?? doc.DocumentNode.SelectNodes("//div[contains(@class, 'card')]//img")
                ?? doc.DocumentNode.SelectNodes("//div[contains(@class, 'product')]//img");
            
            if (cardNodes == null || cardNodes.Count == 0)
            {
                return Ok(new List<object>());
            }

            var result = new List<object>();
            var seenNames = new HashSet<string>();

            foreach (var node in cardNodes)
            {
                var src = node.GetAttributeValue("src", string.Empty);
                var dataSrc = node.GetAttributeValue("data-src", string.Empty);
                var alt = node.GetAttributeValue("alt", string.Empty);

                // Prefer data-src (lazy-loaded real image) over src (placeholder/QR)
                var imgUrl = !string.IsNullOrWhiteSpace(dataSrc) ? dataSrc : src;
                if (string.IsNullOrEmpty(imgUrl)) continue;

                // Resolve relative URLs
                if (imgUrl.StartsWith("/")) imgUrl = "https://www.vib.com.vn" + imgUrl;
                else if (imgUrl.StartsWith("//")) imgUrl = "https:" + imgUrl;

                string lowerUrl = imgUrl.ToLower();

                // FILTER OUT: QR codes, logos, icons, SVGs, data URIs, tiny images
                if (lowerUrl.Contains("qr") || lowerUrl.Contains("barcode")) continue;
                if (lowerUrl.EndsWith(".svg") || lowerUrl.EndsWith(".gif")) continue;
                if (lowerUrl.Contains("logo") || lowerUrl.Contains("icon") || lowerUrl.Contains("favicon")) continue;
                if (lowerUrl.StartsWith("data:")) continue;
                if (lowerUrl.Contains("1x1") || lowerUrl.Contains("pixel") || lowerUrl.Contains("spacer")) continue;

                // Require wps/wcm path (VIB CMS) OR common image extensions
                bool isVibCms = lowerUrl.Contains("wps/wcm");
                bool isImage = lowerUrl.EndsWith(".png") || lowerUrl.EndsWith(".jpg") || lowerUrl.EndsWith(".jpeg") || lowerUrl.EndsWith(".webp");
                if (!isVibCms && !isImage) continue;

                string cardName = string.IsNullOrEmpty(alt) ? "Thẻ VIB" : alt.Trim();
                if (seenNames.Contains(cardName)) continue;
                seenNames.Add(cardName);

                result.Add(new
                {
                    Name = cardName,
                    ImageUrl = imgUrl
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

            // === PRE-SCAN: Try to extract card data from embedded JSON (Next.js __NEXT_DATA__, etc.) ===
            var scriptNodes = doc.DocumentNode.SelectNodes("//script");
            if (scriptNodes != null)
            {
                foreach (var script in scriptNodes)
                {
                    string scriptContent = script.InnerText;
                    if (string.IsNullOrWhiteSpace(scriptContent)) continue;

                    // Try __NEXT_DATA__ (Next.js SSR)
                    var nextDataMatch = Regex.Match(scriptContent, @"__NEXT_DATA__\s*=\s*(\{.+?\})\s*;?\s*</", RegexOptions.Singleline);
                    if (!nextDataMatch.Success)
                        nextDataMatch = Regex.Match(scriptContent, @"^(\{.*""props"".*\})$", RegexOptions.Singleline);

                    if (nextDataMatch.Success)
                    {
                        try
                        {
                            using var jsonDoc = JsonDocument.Parse(nextDataMatch.Groups[1].Value);
                            ExtractCardsFromJson(jsonDoc.RootElement, cardsDict, uriResult);
                        }
                        catch { /* ignore malformed JSON */ }
                    }
                }
            }

            // === PRE-SCAN 2: Fallback for SPA hidden links (like VPBank "Xem thêm") ===
            // Look for any links in the raw HTML that look like detail pages under the current directory
            string basePath = uriResult.AbsolutePath.TrimEnd('/');
            if (basePath.Length > 1)
            {
                var hiddenLinkMatches = Regex.Matches(html, @"href=\""(" + Regex.Escape(basePath) + @"/[a-zA-Z0-9-]+)\""");
                foreach (Match m in hiddenLinkMatches)
                {
                    string href = m.Groups[1].Value;
                    string slug = href.Substring(href.LastIndexOf('/') + 1);
                    string lowerSlug = slug.ToLower();
                    // Exclude generic/pagination/news/feature links
                    if (lowerSlug.Length > 3 && 
                        lowerSlug != "the-tin-dung" &&
                        !lowerSlug.Contains("page") && 
                        !lowerSlug.Contains("compare") && 
                        !lowerSlug.Contains("rut-tien") && 
                        !lowerSlug.Contains("tra-gop") && 
                        !lowerSlug.Contains("tin-tuc") && 
                        !lowerSlug.Contains("so-sanh") && 
                        !lowerSlug.Contains("uu-dai") && 
                        !lowerSlug.Contains("khuyen-mai") &&
                        !lowerSlug.Contains("cc-01") && 
                        !lowerSlug.Contains("commcredit"))
                    {
                        string dummyName = "Thẻ " + slug.Replace("-", " ");
                        if (!cardsDict.Values.Any(c => c.DetailUrl != null && c.DetailUrl.EndsWith(href)))
                        {
                            string fullUrl = uriResult.Scheme + "://" + uriResult.Host + href;
                            cardsDict[dummyName] = new CardScrapedDto { CardName = dummyName, DetailUrl = fullUrl };
                        }
                    }
                }
            }

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
                        
                        bool isNewsOrGuide = lowerTitle.Contains("có nên") || 
                                             lowerTitle.Contains("?") || 
                                             lowerTitle.Contains("hướng dẫn") || 
                                             lowerTitle.Contains("cách") ||
                                             lowerTitle.Contains("an toàn") ||
                                             lowerTitle.Contains("giải đáp") ||
                                             lowerTitle.Contains("mất thẻ") ||
                                             lowerTitle.Contains("danh sách thẻ");

                        // Intelligent check: Domain name, "thẻ", or major card brands
                        bool isCardTitle = !isNewsOrGuide && (lowerTitle.Contains(domain) || 
                                           lowerTitle.Contains("thẻ") || 
                                           lowerTitle.Contains("visa") || 
                                           lowerTitle.Contains("mastercard") || 
                                           lowerTitle.Contains("jcb") || 
                                           lowerTitle.Contains("american express") ||
                                           lowerTitle.Contains("napas"));

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
                // Also collect card DETAIL links (same-host links to individual card pages)
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
                        else if (hrefLower.EndsWith(".pdf") || (hrefLower.Contains("pdf") && (linkText.Contains("điều khoản") || linkText.Contains("biểu phí") || linkText.Contains("thể lệ") || linkText.Contains("terms") || linkText.Contains("fee"))))
                        {
                            if (string.IsNullOrEmpty(cardsDict[currentCardName].TermsPdfUrl))
                                cardsDict[currentCardName].TermsPdfUrl = href;
                        }
                        else if (href.Contains(uriResult.Host))
                        {
                            // Detect card detail links: same host, longer path than listing page, contains card keywords
                            string listingPath = uriResult.AbsolutePath.TrimEnd('/');
                            Uri? hrefUri;
                            if (Uri.TryCreate(href, UriKind.Absolute, out hrefUri))
                            {
                                string hrefPath = hrefUri.AbsolutePath.TrimEnd('/');
                                bool isDetailLink =
                                    hrefPath.Length > listingPath.Length + 3 &&
                                    hrefPath.StartsWith(listingPath) &&
                                    !hrefPath.Contains("#") &&
                                    (hrefPath.Contains("-the-") || hrefPath.Contains("credit") ||
                                     hrefPath.Contains("-card") || hrefPath.Contains("the-tin-dung") ||
                                     hrefPath.Contains("the-"));

                                if (isDetailLink && string.IsNullOrEmpty(cardsDict[currentCardName].DetailUrl))
                                {
                                    cardsDict[currentCardName].DetailUrl = href;
                                }
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

                    // --- Extract MinSalary from listing text ---
                    if (cardsDict[currentCardName].MinSalary == null)
                    {
                        var salaryMatch = Regex.Match(lowerText, @"(thu nhập|lương|salary|income)[^\d]{0,40}?(\d[\d.,]*)\s*(triệu|tr|nghìn|k)", RegexOptions.IgnoreCase);
                        if (salaryMatch.Success)
                        {
                            cardsDict[currentCardName].MinSalary = ParseAmount(salaryMatch.Groups[2].Value, salaryMatch.Groups[3].Value);
                        }
                    }

                    // --- Extract CreditLimit from listing text ---
                    if (cardsDict[currentCardName].CreditLimit == null)
                    {
                        var limitMatch = Regex.Match(lowerText, @"(hạn mức|credit limit|limit)[^\d]{0,40}?(\d[\d.,]*)\s*(tỷ|triệu|tr|nghìn)", RegexOptions.IgnoreCase);
                        if (limitMatch.Success)
                        {
                            string unit = limitMatch.Groups[3].Value.ToLower();
                            string val = limitMatch.Groups[2].Value;
                            cardsDict[currentCardName].CreditLimit = val + " " + limitMatch.Groups[3].Value;
                        }
                    }

                    // --- Extract InterestRate from listing text ---
                    if (cardsDict[currentCardName].InterestRate == null)
                    {
                        var rateMatch = Regex.Match(lowerText, @"(lãi suất|interest rate|interest)[^\d]{0,30}?(\d[\d.,]*)\s*%", RegexOptions.IgnoreCase);
                        if (rateMatch.Success)
                        {
                            cardsDict[currentCardName].InterestRate = rateMatch.Groups[2].Value + "%";
                        }
                    }

                    // --- Extract AnnualFee from listing text ---
                    if (cardsDict[currentCardName].AnnualFee == null)
                    {
                        if (Regex.IsMatch(lowerText, @"miễn phí thường niên|phí thường niên[:\s]*miễn phí|free annual"))
                        {
                            cardsDict[currentCardName].AnnualFee = 0;
                        }
                        else
                        {
                            var feeMatch = Regex.Match(lowerText, @"phí thường niên[^\d]{0,40}?(\d[\d.,]*)\s*(triệu|tr|nghìn|k|đồng|vnd|vnđ)", RegexOptions.IgnoreCase);
                            if (feeMatch.Success)
                                cardsDict[currentCardName].AnnualFee = ParseAmount(feeMatch.Groups[1].Value, feeMatch.Groups[2].Value);
                        }
                    }

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

            // If no cards found at all, this is likely a JavaScript-rendered page
            if (finalCards.Count == 0)
            {
                return BadRequest(new
                {
                    message = $"⚠️ Không phát hiện được thẻ nào từ trang này. " +
                              $"Trang web của {uriResult.Host} có thể sử dụng JavaScript để render danh sách thẻ — " +
                              $"scraper chỉ đọc HTML tĩnh nên không thấy nội dung. " +
                              $"Gợi ý: Hãy thử dán link trang chi tiết của một thẻ cụ thể thay vì trang danh sách.",
                    host = uriResult.Host,
                    isJsRendered = true
                });
            }

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

            // === PHASE 2: Enrich cards from their detail pages ===
            // Step 1: Resolve detail URLs (from soi param in register URL, or from listing page links)
            foreach (var card in finalCards)
            {
                if (string.IsNullOrEmpty(card.DetailUrl) && !string.IsNullOrEmpty(card.RegisterUrl))
                {
                    // Try to decode 'soi' param from register URL (VPBank pattern)
                    var soiMatch = Regex.Match(card.RegisterUrl, @"soi=([^&]+)", RegexOptions.IgnoreCase);
                    if (soiMatch.Success)
                    {
                        string detailPath = Uri.UnescapeDataString(soiMatch.Groups[1].Value);
                        if (detailPath.StartsWith("/"))
                            card.DetailUrl = uriResult.Scheme + "://" + uriResult.Host + detailPath;
                    }
                }
            }

            // Step 2: Parallel fetch detail pages (max 3 concurrent to avoid rate-limiting)
            var cardsWithDetail = finalCards.Where(c => !string.IsNullOrEmpty(c.DetailUrl)).ToList();
            if (cardsWithDetail.Count > 0)
            {
                var semaphore = new SemaphoreSlim(3, 3);
                var enrichTasks = cardsWithDetail.Select(async card =>
                {
                    await semaphore.WaitAsync();
                    try { await EnrichFromDetailPage(card, card.DetailUrl!, _httpClient); }
                    finally { semaphore.Release(); }
                });
                await Task.WhenAll(enrichTasks);
            }

            var filteredCards = finalCards
                .Where(c => c.CardName != "Thẻ chung" && c.CardName.Length < 100)
                .Where(c => !string.IsNullOrEmpty(c.ImageUrl))
                .Where(c => {
                    string lowerName = c.CardName.ToLower();
                    bool isNews = lowerName.Contains("?") || lowerName.Contains("có nên") || lowerName.Contains("hướng dẫn") || lowerName.Contains("cách") || lowerName.Contains("an toàn") || lowerName.Contains("giải đáp") || lowerName.Contains("mất thẻ") || lowerName.Contains("danh sách thẻ");
                    return !isNews;
                })
                .ToList();

            return Ok(new
            {
                Host = uriResult.Host,
                TotalFound = filteredCards.Count,
                Cards = filteredCards
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi trích xuất dữ liệu: {ex.Message}" });
        }
    }

    // ===== DETAIL PAGE ENRICHMENT =====
    private async Task EnrichFromDetailPage(CardScrapedDto card, string detailUrl, HttpClient http)
    {
        try
        {
            var resp = await http.GetAsync(detailUrl);
            if (!resp.IsSuccessStatusCode) return;

            var html = await resp.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Flatten all text for regex matching
            string allText = HttpUtility.HtmlDecode(doc.DocumentNode.InnerText);
            allText = Regex.Replace(allText, @"\s+", " ");

            // --- Extract Title if missing or dummy ---
            if (card.CardName.StartsWith("Thẻ ") && card.CardName.Contains("-"))
            {
                var titleMatch = Regex.Match(allText, @"\\""title\\"":\{\""text\"":\""([^\""]+)\""");
                if (titleMatch.Success)
                {
                    card.CardName = Regex.Unescape(titleMatch.Groups[1].Value);
                }
                else
                {
                    var h1 = doc.DocumentNode.SelectSingleNode("//h1");
                    if (h1 == null) h1 = doc.DocumentNode.SelectSingleNode("//h2");
                    if (h1 != null)
                    {
                        string h1Text = HttpUtility.HtmlDecode(h1.InnerText.Trim());
                        if (h1Text.Length > 3 && h1Text.Length < 100) card.CardName = h1Text;
                    }
                }
            }

            // --- Extract Image if missing ---
            if (string.IsNullOrEmpty(card.ImageUrl))
            {
                var imgNode = doc.DocumentNode.SelectSingleNode("//img[contains(@src, 'cards') or contains(@src, 'the-tin-dung')]");
                if (imgNode == null) imgNode = doc.DocumentNode.SelectSingleNode("//main//img[not(contains(@src, 'logo')) and not(contains(@src, 'icon'))]");
                if (imgNode != null)
                {
                    var src = imgNode.GetAttributeValue("src", "");
                    if (!string.IsNullOrEmpty(src))
                    {
                        if (src.StartsWith("//")) src = "https:" + src;
                        else if (src.StartsWith("/")) { var u = new Uri(detailUrl); src = u.Scheme + "://" + u.Host + src; }
                        card.ImageUrl = src;
                    }
                }
            }
            string allTextLower = allText.ToLower();

            // --- Extract Annual Fee ---
            if (card.AnnualFee == null)
            {
                // "Miễn phí thường niên" (without explicit amount) = 0
                if (Regex.IsMatch(allTextLower, @"miễn phí thường niên|annual fee[:\s]*free|fee[:\s]*0"))
                {
                    card.AnnualFee = 0;
                }
                else
                {
                    // Try pattern: "phí thường niên ... X triệu/nghìn"
                    var feeMatch = Regex.Match(allTextLower,
                        @"phí thường niên[^.\n]{0,60}?(\d[\d.,]*)\s*(triệu|tr\b|nghìn|k\b|đồng|vnd|vnđ)",
                        RegexOptions.IgnoreCase);
                    if (feeMatch.Success)
                        card.AnnualFee = ParseAmount(feeMatch.Groups[1].Value, feeMatch.Groups[2].Value);
                }
            }

            // --- Extract Min Salary ---
            if (card.MinSalary == null)
            {
                var salaryPatterns = new[]
                {
                    @"(thu nhập|lương)[^.\n]{0,60}?(\d[\d.,]*)\s*(triệu|tr\b|nghìn)",
                    @"income[^.\n]{0,60}?(\d[\d.,]*)\s*(million|thousand|vnd)"
                };
                foreach (var pattern in salaryPatterns)
                {
                    var m = Regex.Match(allTextLower, pattern, RegexOptions.IgnoreCase);
                    if (m.Success)
                    {
                        int numGroup = m.Groups.Count >= 3 ? 2 : 1;
                        int unitGroup = m.Groups.Count >= 4 ? 3 : 2;
                        card.MinSalary = ParseAmount(m.Groups[numGroup].Value, m.Groups[unitGroup].Value);
                        break;
                    }
                }
            }

            // --- Extract CreditLimit from detail ---
            if (card.CreditLimit == null)
            {
                var limitMatch = Regex.Match(allTextLower, @"(hạn mức|credit limit)[^\d]{0,60}?(\d[\d.,]*)\s*(tỷ|triệu|tr\b|nghìn)", RegexOptions.IgnoreCase);
                if (limitMatch.Success)
                    card.CreditLimit = limitMatch.Groups[2].Value + " " + limitMatch.Groups[3].Value;
            }

            // --- Extract InterestRate from detail ---
            if (card.InterestRate == null)
            {
                var rateMatch = Regex.Match(allTextLower, @"(lãi suất|interest rate)[^\d]{0,30}?(\d[\d.,]*)\s*%", RegexOptions.IgnoreCase);
                if (rateMatch.Success)
                    card.InterestRate = rateMatch.Groups[2].Value + "%";
            }

            // --- Extract additional cashback infos from detail page ---
            var detailKeywords = new[] { "hoàn tiền", "cashback", "tích điểm", "điểm thưởng", "ưu đãi", "miễn phí", "trả góp" };
            var seenTexts = new HashSet<string>(card.CashbackInfos.Select(c => c.Text));

            foreach (var node in doc.DocumentNode.Descendants())
            {
                if (node.Name != "p" && node.Name != "li" && node.Name != "div" && node.Name != "span") continue;
                if (node.HasChildNodes && node.ChildNodes.Any(c => c.Name == "div" || c.Name == "p" || c.Name == "ul" || c.Name == "li")) continue;

                string text = HttpUtility.HtmlDecode(node.InnerText.Trim());
                text = Regex.Replace(text, @"\s+", " ");

                if (text.Length < 10 || text.Length > 300) continue;
                if (seenTexts.Contains(text)) continue;

                string lowerText = text.ToLower();
                if (!detailKeywords.Any(k => lowerText.Contains(k))) continue;

                seenTexts.Add(text);

                var pctMatch = Regex.Match(text, @"(\d+(?:[.,]\d+)?)\s*%");
                decimal? pctFound = null;
                if (pctMatch.Success && decimal.TryParse(pctMatch.Groups[1].Value.Replace(',', '.'), out decimal pctVal))
                    pctFound = pctVal;

                var capMatch = Regex.Match(text, @"(\d+(?:[.,]\d+)?)\s*(triệu|tr|nghìn|k|đ|vnđ)");
                decimal? capFound = null;
                if (capMatch.Success && decimal.TryParse(capMatch.Groups[1].Value.Replace(',', '.'), out decimal capVal))
                {
                    string unit = capMatch.Groups[2].Value.ToLower();
                    capFound = unit is "triệu" or "tr" ? capVal * 1000000 : unit is "nghìn" or "k" ? capVal * 1000 : capVal;
                }

                card.CashbackInfos.Add(new CashbackInfoObj { Text = text, SuggestedPercentage = pctFound, SuggestedCap = capFound });
            }

            // --- Fallback for Next.js embedded data strings (like VPBank "Tính năng nổi bật") ---
            var scriptNodes = doc.DocumentNode.SelectNodes("//script");
            if (scriptNodes != null)
            {
                foreach (var script in scriptNodes)
                {
                    string scriptContent = script.InnerText;
                    if (string.IsNullOrWhiteSpace(scriptContent)) continue;

                    // Decode unicode HTML entities commonly used in JS frameworks
                    string decodedContent = scriptContent
                        .Replace("\\u003c", "<")
                        .Replace("\\u003e", ">")
                        .Replace("\\u0026", "&")
                        .Replace("\\\"", "\"");

                    var matches = Regex.Matches(decodedContent, @">([^<]{10,300})<");
                    foreach (Match m in matches)
                    {
                        string text = HttpUtility.HtmlDecode(m.Groups[1].Value.Trim());
                        text = Regex.Replace(text, @"\s+", " ");

                        if (text.Length < 10 || text.Length > 300) continue;
                        if (seenTexts.Contains(text)) continue;

                        string lowerText = text.ToLower();
                        if (!detailKeywords.Any(k => lowerText.Contains(k))) continue;

                        seenTexts.Add(text);

                        var pctMatch = Regex.Match(text, @"(\d+(?:[.,]\d+)?)\s*%");
                        decimal? pctFound = null;
                        if (pctMatch.Success && decimal.TryParse(pctMatch.Groups[1].Value.Replace(',', '.'), out decimal pctVal))
                            pctFound = pctVal;

                        var capMatch = Regex.Match(text, @"(\d+(?:[.,]\d+)?)\s*(triệu|tr|nghìn|k|đ|vnđ)");
                        decimal? capFound = null;
                        if (capMatch.Success && decimal.TryParse(capMatch.Groups[1].Value.Replace(',', '.'), out decimal capVal))
                        {
                            string unit = capMatch.Groups[2].Value.ToLower();
                            capFound = unit is "triệu" or "tr" ? capVal * 1000000 : unit is "nghìn" or "k" ? capVal * 1000 : capVal;
                        }

                        card.CashbackInfos.Add(new CashbackInfoObj { Text = text, SuggestedPercentage = pctFound, SuggestedCap = capFound });
                    }
                }
            }

            // --- Extract PDF from detail page ---
            if (card.TermsPdfUrl == null)
            {
                var pdfLinks = doc.DocumentNode.SelectNodes("//a");
                if (pdfLinks != null)
                {
                    foreach (var link in pdfLinks)
                    {
                        var href = link.GetAttributeValue("href", "");
                        var linkText = HttpUtility.HtmlDecode(link.InnerText.Trim()).ToLower();
                        var hrefLower = href.ToLower();
                        if (hrefLower.EndsWith(".pdf") || (hrefLower.Contains("pdf") && (linkText.Contains("điều khoản") || linkText.Contains("biểu phí") || linkText.Contains("thể lệ") || linkText.Contains("terms") || linkText.Contains("fee"))))
                        {
                            if (href.StartsWith("//")) href = "https:" + href;
                            else if (href.StartsWith("/"))
                            {
                                var uri = new Uri(detailUrl);
                                href = uri.Scheme + "://" + uri.Host + href;
                            }
                            card.TermsPdfUrl = href;
                            break;
                        }
                    }
                }
            }

            // Fallback for Next.js / SPAs where PDF links are hidden in JS chunks
            if (card.TermsPdfUrl == null)
            {
                var pdfMatch = Regex.Match(html, @"https?:\/\/[^\s""']+?\.pdf", RegexOptions.IgnoreCase);
                if (!pdfMatch.Success)
                    pdfMatch = Regex.Match(html, @"\/[^\s""']+?\.pdf", RegexOptions.IgnoreCase);

                if (pdfMatch.Success)
                {
                    var href = pdfMatch.Value;
                    if (href.StartsWith("//")) href = "https:" + href;
                    else if (href.StartsWith("/"))
                    {
                        var uri = new Uri(detailUrl);
                        href = uri.Scheme + "://" + uri.Host + href;
                    }
                    card.TermsPdfUrl = href;
                }
            }
        }
        catch { /* Ignore individual detail page errors silently */ }
    }

    // === JSON Script Extraction (Next.js __NEXT_DATA__, embedded state) ===
    private static void ExtractCardsFromJson(JsonElement root, Dictionary<string, CardScrapedDto> cardsDict, Uri baseUri)
    {
        try
        {
            // Recursively search for objects that look like card data
            SearchJsonElement(root, cardsDict, baseUri, 0);
        }
        catch { /* ignore */ }
    }

    private static void SearchJsonElement(JsonElement element, Dictionary<string, CardScrapedDto> cardsDict, Uri baseUri, int depth)
    {
        if (depth > 12) return; // Prevent infinite recursion on deep structures

        if (element.ValueKind == JsonValueKind.Object)
        {
            // Check if this object looks like a card
            string? cardName = null;
            string? imageUrl = null;
            string? registerUrl = null;

            foreach (var prop in element.EnumerateObject())
            {
                string propNameLower = prop.Name.ToLower();

                // Try to detect card name field
                if (cardName == null && (propNameLower is "cardname" or "name" or "title" or "productname" or "tenthe" or "ten"))
                {
                    if (prop.Value.ValueKind == JsonValueKind.String)
                    {
                        string val = prop.Value.GetString() ?? "";
                        string valLower = val.ToLower();
                        if (val.Length > 5 && val.Length < 150 &&
                            (valLower.Contains("thẻ") || valLower.Contains("visa") ||
                             valLower.Contains("mastercard") || valLower.Contains("jcb") ||
                             valLower.Contains("platinum") || valLower.Contains("credit")))
                        {
                            cardName = val;
                        }
                    }
                }

                // Try to detect image URL
                if (imageUrl == null && (propNameLower is "imageurl" or "image" or "img" or "thumbnail" or "photo" or "picture" or "avatar"))
                {
                    if (prop.Value.ValueKind == JsonValueKind.String)
                    {
                        string val = prop.Value.GetString() ?? "";
                        if (val.StartsWith("http") || val.StartsWith("/"))
                            imageUrl = val;
                    }
                }

                // Try to detect register URL
                if (registerUrl == null && (propNameLower is "registerurl" or "applyurl" or "link" or "url" or "href" or "dangkyurl"))
                {
                    if (prop.Value.ValueKind == JsonValueKind.String)
                    {
                        string val = prop.Value.GetString() ?? "";
                        if (val.StartsWith("http") || val.StartsWith("/"))
                            registerUrl = val;
                    }
                }
            }

            if (cardName != null && !cardsDict.ContainsKey(cardName))
            {
                // Resolve relative URLs
                if (imageUrl != null && imageUrl.StartsWith("/"))
                    imageUrl = baseUri.Scheme + "://" + baseUri.Host + imageUrl;
                if (registerUrl != null && registerUrl.StartsWith("/"))
                    registerUrl = baseUri.Scheme + "://" + baseUri.Host + registerUrl;

                cardsDict[cardName] = new CardScrapedDto
                {
                    CardName = cardName,
                    ImageUrl = imageUrl,
                    RegisterUrl = registerUrl
                };
            }

            // Recurse into all properties
            foreach (var prop in element.EnumerateObject())
                SearchJsonElement(prop.Value, cardsDict, baseUri, depth + 1);
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
                SearchJsonElement(item, cardsDict, baseUri, depth + 1);
        }
    }

    private static decimal ParseAmount(string rawValue, string unit)

    {
        string cleaned = rawValue.Replace(',', '.').Replace(".", "");
        // Handle Vietnamese number format: 1.200.000 or 1,200,000
        if (rawValue.Contains('.') && rawValue.IndexOf('.') < rawValue.LastIndexOf('.'))
            cleaned = rawValue.Replace(".", ""); // thousands separator
        else if (rawValue.Contains(',') && rawValue.IndexOf(',') < rawValue.LastIndexOf(','))
            cleaned = rawValue.Replace(",", "");
        else
            cleaned = rawValue.Replace(',', '.'); // decimal separator

        if (!decimal.TryParse(cleaned, out decimal val)) return 0;

        return unit.ToLower() switch
        {
            "triệu" or "tr" or "million" => val * 1_000_000,
            "nghìn" or "k" or "thousand" => val * 1_000,
            _ => val
        };
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

    // ===== IMAGE DOWNLOAD API =====
    public class DownloadImageRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string CardName { get; set; } = string.Empty;
    }

    [HttpPost("download-image")]
    public async Task<IActionResult> DownloadImage([FromBody] DownloadImageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ImageUrl) || string.IsNullOrWhiteSpace(request.BankName))
            return BadRequest(new { message = "ImageUrl and BankName are required" });

        try
        {
            var localPath = await DownloadAndSaveFileInternal(request.ImageUrl, request.BankName, request.CardName);
            if (localPath == null)
                return BadRequest(new { message = "Failed to download image" });

            return Ok(new { localPath });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi tải ảnh: {ex.Message}" });
        }
    }

    /// <summary>
    /// Downloads a file from URL and saves to upload/image/{bankName}/{slug}/{filename}
    /// Returns the absolute local URL like http://localhost:5000/upload/image/VIB/the-vib-cashback/the-vib-cashback.png
    /// </summary>
    public async Task<string?> DownloadAndSaveFileInternal(string fileUrl, string bankName, string? cardName = null, string? baseUrl = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl) || !fileUrl.StartsWith("http"))
                return null;

            // Sanitize bank name for folder
            string safeBankName = Regex.Replace(bankName.Trim(), @"[^\w\s-]", "").Replace(" ", "-");
            if (string.IsNullOrWhiteSpace(safeBankName)) safeBankName = "unknown";

            // Build slug from card name or URL
            string slug;
            if (!string.IsNullOrWhiteSpace(cardName))
            {
                slug = Regex.Replace(cardName.ToLower().Trim(), @"[^\w\s-]", "");
                slug = Regex.Replace(slug, @"\s+", "-");
                slug = Regex.Replace(slug, @"-+", "-").Trim('-');
            }
            else
            {
                slug = Path.GetFileNameWithoutExtension(new Uri(fileUrl).AbsolutePath);
                slug = Regex.Replace(slug, @"[^\w-]", "-");
            }
            if (string.IsNullOrWhiteSpace(slug)) slug = "card-" + Guid.NewGuid().ToString("N")[..8];

            // Create directory: upload/image/{safeBankName}/{slug}
            string uploadDir = Path.Combine(_env.ContentRootPath, "upload", "image", safeBankName, slug);
            Directory.CreateDirectory(uploadDir);

            // Get extension from URL or default to .png if it's an image
            string ext = Path.GetExtension(new Uri(fileUrl).AbsolutePath).ToLower();
            if (string.IsNullOrEmpty(ext) || ext.Length > 5)
                ext = fileUrl.Contains(".pdf") ? ".pdf" : ".png";

            string fileName = slug + ext;
            string filePath = Path.Combine(uploadDir, fileName);

            if (string.IsNullOrEmpty(baseUrl))
            {
                try { baseUrl = $"{this.Request.Scheme}://{this.Request.Host}"; }
                catch { baseUrl = "http://localhost:5000"; }
            }

            string relativeUrl = $"/upload/image/{safeBankName}/{slug}/{fileName}";
            string absoluteUrl = baseUrl + relativeUrl;

            // Skip if already downloaded
            if (System.IO.File.Exists(filePath))
                return absoluteUrl;

            // Download
            var response = await _httpClient.GetAsync(fileUrl);
            if (!response.IsSuccessStatusCode) return null;

            var bytes = await response.Content.ReadAsByteArrayAsync();
            if (bytes.Length < 500) return null; // Too small, likely invalid

            await System.IO.File.WriteAllBytesAsync(filePath, bytes);

            return absoluteUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DownloadAndSaveFile error: {ex.Message}");
            return null;
        }
    }
}
