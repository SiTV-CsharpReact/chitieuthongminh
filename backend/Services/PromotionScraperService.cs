using backend.Controllers;
using backend.Models;
using backend.Services;
using HtmlAgilityPack;
using System.Text.RegularExpressions;
using System.Web;
using MongoDB.Driver;
using Microsoft.Playwright;

namespace backend.Services;

public class PromotionScraperService
{
    private readonly IConfiguration _config;
    private readonly ScraperStatusService _statusService;
    private readonly HttpClient _httpClient;

    public PromotionScraperService(IConfiguration config, ScraperStatusService statusService)
    {
        _config = config;
        _statusService = statusService;
        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
        };
        _httpClient = new HttpClient(handler);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        _httpClient.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<int> ScrapePromotionsAsync(IServiceProvider serviceProvider)
    {
        var urls = _config.GetSection("BankScraperUrls").Get<List<BankScraperUrlModel>>();
        if (urls == null || !urls.Any()) return 0;

        var banksWithPromo = urls.Where(u => !string.IsNullOrWhiteSpace(u.PromotionUrl)).ToList();
        if (!banksWithPromo.Any()) return 0;

        _statusService.Reset(banksWithPromo.Count);

        using var scope = serviceProvider.CreateScope();
        var promotionService = scope.ServiceProvider.GetRequiredService<PromotionService>();
        var mongoClient = scope.ServiceProvider.GetRequiredService<IMongoClient>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var database = mongoClient.GetDatabase(configuration["DatabaseName"]);
        var draftsCollection = database.GetCollection<PromoScraperDraft>("PromoScraperDrafts");

        // Lấy promotions hiện có để kiểm tra trùng
        var existingPromotions = await promotionService.GetAsync();
        var existingTitles = new HashSet<string>(
            existingPromotions.Select(p => (p.Title ?? "").Trim().ToLower()),
            StringComparer.OrdinalIgnoreCase
        );
        
        var existingDrafts = await draftsCollection.Find(_ => true).ToListAsync();
        foreach (var d in existingDrafts) {
            existingTitles.Add((d.Title ?? "").Trim().ToLower());
        }

        int newPromotionsCreated = 0;

        try
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions 
            { 
                Headless = true,
                Args = new[] { "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage" }
            });

            foreach (var bankUrl in banksWithPromo)
            {
                var context = await browser.NewContextAsync(new BrowserNewContextOptions
                {
                    UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    ViewportSize = new ViewportSize { Width = 1366, Height = 768 }
                });
                await context.AddInitScriptAsync("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");
                var page = await context.NewPageAsync();
                
                _statusService.CurrentBank = bankUrl.BankName + " (Ưu đãi)";
                try
                {
                    var urlsToScrape = new List<string>();
                    if (bankUrl.ScrapingMethod == "Paginated" && bankUrl.PromotionUrl != null && bankUrl.PromotionUrl.Contains("page=1"))
                    {
                        for (int p = 1; p <= 5; p++)
                        {
                            urlsToScrape.Add(bankUrl.PromotionUrl.Replace("page=1", $"page={p}"));
                        }
                    }
                    else
                    {
                        urlsToScrape.Add(bankUrl.PromotionUrl ?? "");
                    }

                    int pageIndex = 1;
                    foreach (var u in urlsToScrape)
                    {
                        if (string.IsNullOrWhiteSpace(u)) continue;
                        
                        if (urlsToScrape.Count > 1)
                        {
                            _statusService.CurrentBank = $"{bankUrl.BankName} (Đang cào trang {pageIndex}/{urlsToScrape.Count})";
                        }
                        else
                        {
                            _statusService.CurrentBank = $"{bankUrl.BankName} (Đang quét dữ liệu...)";
                        }
                        pageIndex++;
                        
                        var promotions = await ScrapePromotionsFromUrl(u, bankUrl.BankName, bankUrl.ScrapingMethod ?? "Standard", page);
                        if (promotions.Count == 0 && urlsToScrape.Count > 1) break; // If no promotions on this page and we are paginating, stop paginating
                        
                        foreach (var promo in promotions)
                        {
                            var titleKey = (promo.Title ?? "").Trim().ToLower();
                            if (string.IsNullOrWhiteSpace(titleKey)) continue;
                            if (existingTitles.Contains(titleKey)) continue;

                            // Fetch detail from sourceUrl for new promotions
                            if (!string.IsNullOrWhiteSpace(promo.SourceUrl))
                            {
                                var detailHtml = await ScrapePromotionDetailAsync(promo.SourceUrl, page);
                                if (!string.IsNullOrWhiteSpace(detailHtml))
                                {
                                    // Merge or replace description
                                    promo.Description = detailHtml;
                                    
                                    // Parse dates from detail page if missing
                                    if (string.IsNullOrWhiteSpace(promo.StartDate) && string.IsNullOrWhiteSpace(promo.ValidUntil))
                                    {
                                        var detailText = System.Net.WebUtility.HtmlDecode(Regex.Replace(detailHtml, "<.*?>", " "));
                                        var dateMatches = Regex.Matches(detailText, @"(0[1-9]|[12][0-9]|3[01])[/\-\.](0[1-9]|1[012])[/\-\.](\d{4}|\d{2})");
                                        if (dateMatches.Count == 1)
                                        {
                                            promo.ValidUntil = dateMatches[0].Value;
                                        }
                                        else if (dateMatches.Count >= 2)
                                        {
                                            promo.StartDate = dateMatches[0].Value;
                                            promo.ValidUntil = dateMatches[dateMatches.Count - 1].Value;
                                        }
                                    }
                                }
                            }

                            var promoDraft = new PromoScraperDraft
                            {
                                Title = promo.Title!,
                                Description = promo.Description,
                                ImageUrl = promo.ImageUrl,
                                SourceUrl = promo.SourceUrl,
                                BankName = promo.BankName,
                                DiscountRate = promo.DiscountRate,
                                StartDate = promo.StartDate,
                                ValidUntil = promo.ValidUntil,
                                CategoryTab = promo.CategoryTab
                            };

                            await draftsCollection.InsertOneAsync(promoDraft);
                            existingTitles.Add(titleKey);
                            newPromotionsCreated++;
                            _statusService.NewDraftsFound = newPromotionsCreated;
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PromotionScraper] Error scraping {bankUrl.BankName}: {ex.Message}");
                }
                finally
                {
                    await page.CloseAsync();
                    await context.CloseAsync();
                }

                _statusService.ProcessedBanks++;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PromotionScraper] Playwright critical error: {ex.Message}");
        }

        _statusService.Complete();
        return newPromotionsCreated;
    }

    private async Task<List<CardPromotion>> ScrapePromotionsFromUrl(string url, string bankName, string scrapingMethod, IPage page)
    {
        var promotions = new List<CardPromotion>();

        try
        {
            Console.WriteLine($"[PromotionScraper] Navigating to {url} (Method: {scrapingMethod})");
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle, Timeout = 30000 });
            await page.WaitForTimeoutAsync(5000); // Wait for React/Angular to render data

            // Auto-click "Xem thêm" and scroll to load more (only for banks that need it)
            if (scrapingMethod == "ScrollAndClick")
            {
                for (int i = 0; i < 3; i++)
                {
                    try
                    {
                        var buttons = await page.Locator("button:has-text('Xem thêm'), button:has-text('Hiển thị thêm'), a:has-text('Xem thêm')").AllAsync();
                        foreach (var btn in buttons)
                        {
                            if (await btn.IsVisibleAsync())
                            {
                                await btn.ClickAsync();
                                await page.WaitForTimeoutAsync(2000);
                            }
                        }
                    }
                    catch (Exception) { /* ignore button click errors */ }
                    
                    // Always scroll to trigger lazy loading
                    await page.EvaluateAsync("window.scrollTo(0, document.body.scrollHeight)");
                    await page.WaitForTimeoutAsync(2000);
                }
            }

            var html = await page.ContentAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

        Uri baseUri = new Uri(url);

        // Strategy 1: Look for structured promo blocks (common patterns)
        var promoBlocks = FindPromoBlocks(doc);
        
        foreach (var block in promoBlocks)
        {
            var promo = ExtractPromoFromBlock(block, baseUri, bankName);
            if (promo != null && !string.IsNullOrWhiteSpace(promo.Title) && promo.Title.Length > 5)
            {
                promotions.Add(promo);
            }
        }

        // Fallback: If no structured blocks found, try link-based extraction
        if (promotions.Count == 0)
        {
            promotions = ExtractPromosFromLinks(doc, baseUri, bankName);
        }
        
        Console.WriteLine($"[PromotionScraper] {bankName} (Page): Found {promotions.Count} promotions.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PromotionScraper] Timeout or error loading {bankName} page: {ex.Message}");
        }

        return promotions;
    }

    private async Task<string?> ScrapePromotionDetailAsync(string url, IPage page)
    {
        try
        {
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle, Timeout = 20000 });
            await page.WaitForTimeoutAsync(2000);

            var html = await page.ContentAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            string[] detailSelectors = new[]
            {
                "//div[contains(@class, 'article-content')]",
                "//div[contains(@class, 'detail-content')]",
                "//div[contains(@class, 'post-content')]",
                "//div[contains(@class, 'content-detail')]",
                "//div[contains(@class, 'promotion-detail')]",
                "//div[contains(@class, 'news-detail')]",
                "//div[contains(@class, 'entry-content')]",
                "//article",
                "//main"
            };

            foreach (var selector in detailSelectors)
            {
                var node = doc.DocumentNode.SelectSingleNode(selector);
                if (node != null && node.InnerText.Trim().Length > 200)
                {
                    var scripts = node.SelectNodes(".//script");
                    if (scripts != null)
                    {
                        foreach (var script in scripts) script.Remove();
                    }
                    var styles = node.SelectNodes(".//style");
                    if (styles != null)
                    {
                        foreach (var style in styles) style.Remove();
                    }
                    
                    // Remove "Ưu đãi khác" (Other promotions) blocks
                    var redundantElements = node.SelectNodes(".//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'ưu đãi khác') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'bài viết liên quan')]");
                    if (redundantElements != null)
                    {
                        foreach (var el in redundantElements)
                        {
                            var parentToDrop = el.ParentNode;
                            while (parentToDrop != null && parentToDrop.Name != "div" && parentToDrop.Name != "section" && parentToDrop != node)
                            {
                                parentToDrop = parentToDrop.ParentNode;
                            }
                            if (parentToDrop != null && parentToDrop != node)
                            {
                                parentToDrop.Remove();
                            }
                            else
                            {
                                el.Remove();
                            }
                        }
                    }
                    
                    return node.InnerHtml.Trim();
                }
            }
            
            // Fallback: Find parent with most <p> tags
            var paragraphs = doc.DocumentNode.SelectNodes("//p");
            if (paragraphs != null && paragraphs.Count > 0)
            {
                var parentWithMostText = paragraphs
                    .GroupBy(p => p.ParentNode)
                    .OrderByDescending(g => g.Sum(p => p.InnerText.Length))
                    .FirstOrDefault();

                if (parentWithMostText != null && parentWithMostText.Key.InnerText.Trim().Length > 200)
                {
                    var node = parentWithMostText.Key;
                    var scripts = node.SelectNodes(".//script");
                    if (scripts != null)
                    {
                        foreach (var script in scripts) script.Remove();
                    }
                    var styles = node.SelectNodes(".//style");
                    if (styles != null)
                    {
                        foreach (var style in styles) style.Remove();
                    }
                    return node.InnerHtml.Trim();
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PromotionScraper] Error scraping detail from {url}: {ex.Message}");
        }

        return null;
    }

    private List<HtmlNode> FindPromoBlocks(HtmlDocument doc)
    {
        var blocks = new List<HtmlNode>();

        // Common CSS class patterns for promotion blocks
        string[] promoSelectors = new[]
        {
            "//div[contains(@class, 'promo')]",
            "//div[contains(@class, 'offer')]",
            "//div[contains(@class, 'deal')]",
            "//div[contains(@class, 'uu-dai')]",
            "//div[contains(@class, 'uudai')]",
            "//div[contains(@class, 'khuyen-mai')]",
            "//div[contains(@class, 'khuyenmai')]",
            "//div[contains(@class, 'campaign')]",
            "//div[contains(@class, 'card-item')]",
            "//div[contains(@class, 'card-offer')]",
            "//div[contains(@class, 'news-item')]",
            "//article[contains(@class, 'promo')]",
            "//article[contains(@class, 'post')]",
            "//li[contains(@class, 'promo')]",
            "//li[contains(@class, 'offer')]",
            "//a[contains(@class, 'promo')]",
            "//a[contains(@class, 'offer')]",
            "//div[contains(@class, 'promotion')]",
            "//div[contains(@class, 'category-item')]",
            "//div[contains(@class, 'col-')]//a[.//img]",
        };

        foreach (var selector in promoSelectors)
        {
            var nodes = doc.DocumentNode.SelectNodes(selector);
            if (nodes != null && nodes.Count >= 2) // At least 2 blocks → likely a promo listing
            {
                blocks.AddRange(nodes);
                break;
            }
        }

        return blocks;
    }

    private CardPromotion? ExtractPromoFromBlock(HtmlNode block, Uri baseUri, string bankName)
    {
        // Extract title
        string? title = null;
        var titleNode = block.SelectSingleNode(".//h2 | .//h3 | .//h4 | .//h5 | .//strong | .//b | .//span[contains(@class,'title')] | .//div[contains(@class,'title')] | .//p[contains(@class,'title')]");
        if (titleNode != null)
        {
            title = CleanText(titleNode.InnerText);
        }
        
        // Fallback: use alt text from image
        if (string.IsNullOrWhiteSpace(title))
        {
            var imgNode = block.SelectSingleNode(".//img");
            if (imgNode != null)
            {
                title = imgNode.GetAttributeValue("alt", "").Trim();
            }
        }

        // Fallback: use link title/text
        if (string.IsNullOrWhiteSpace(title))
        {
            var linkNode = block.SelectSingleNode(".//a[@title]") ?? block.SelectSingleNode(".//a");
            if (linkNode != null)
            {
                title = linkNode.GetAttributeValue("title", "").Trim();
                if (string.IsNullOrWhiteSpace(title))
                {
                    title = CleanText(linkNode.InnerText);
                }
            }
        }

        if (string.IsNullOrWhiteSpace(title)) return null;
        var lowerTitle = title.ToLower();
        if (lowerTitle.Contains("tìm hiểu thêm") || lowerTitle.Contains("xem chi tiết") || lowerTitle == "tại đây" || lowerTitle.Contains("khám phá")) return null;
        if (title.Length < 10 && !title.Contains("%") && !Regex.IsMatch(lowerTitle, "(giảm|hoàn|tặng|voucher|ưu đãi)")) return null;

        // Extract image
        string? imageUrl = ExtractImageUrl(block, baseUri);
        if (imageUrl != null && (imageUrl.EndsWith(".svg", StringComparison.OrdinalIgnoreCase) || imageUrl.Contains("icon", StringComparison.OrdinalIgnoreCase)))
        {
            imageUrl = null; // Ignore SVG icons
        }

        // Extract link
        string? sourceUrl = null;
        var link = block.Name == "a" ? block : block.SelectSingleNode(".//a[@href]");
        if (link != null)
        {
            sourceUrl = ResolveUrl(link.GetAttributeValue("href", ""), baseUri);
        }
        
        if (string.IsNullOrWhiteSpace(sourceUrl)) return null; // Must have a source link

        // Extract description
        string? description = null;
        var descNode = block.SelectSingleNode(".//p[not(contains(@class,'title'))] | .//div[contains(@class,'desc')] | .//span[contains(@class,'desc')]");
        if (descNode != null)
        {
            description = descNode.InnerHtml.Trim();
        }

        // Extract discount/percentage info
        string? discountRate = null;
        var fullText = CleanText(block.InnerText);
        var discountMatch = Regex.Match(fullText, @"(\d+%|giảm\s+\d+|hoàn\s+\d+|cashback\s+\d+)", RegexOptions.IgnoreCase);
        if (discountMatch.Success)
        {
            discountRate = discountMatch.Value;
        }

        // Extract start date and valid until
        string? startDate = null;
        string? validUntil = null;
        var dateMatches = Regex.Matches(fullText, @"\b(\d{1,2}[/.-]\d{1,2}(?:[/.-]\d{2,4})?)\b", RegexOptions.IgnoreCase);
        
        if (dateMatches.Count == 1)
        {
            var idx = dateMatches[0].Index;
            var prefix = fullText.Substring(Math.Max(0, idx - 10), Math.Min(10, idx)).ToLower();
            if (prefix.Contains("từ") && !prefix.Contains("đến") && !prefix.Contains("tới") && !prefix.Contains("-"))
            {
                startDate = dateMatches[0].Value;
            }
            else
            {
                validUntil = dateMatches[0].Value;
            }
        }
        else if (dateMatches.Count >= 2)
        {
            startDate = dateMatches[0].Value;
            validUntil = dateMatches[dateMatches.Count - 1].Value;
        }

        if (string.IsNullOrWhiteSpace(imageUrl)) return null; // Must have a banner image

        return new CardPromotion
        {
            Title = title,
            Description = description,
            ImageUrl = imageUrl,
            SourceUrl = sourceUrl,
            BankName = bankName,
            DiscountRate = discountRate,
            StartDate = startDate,
            ValidUntil = validUntil,
            CategoryTab = "Chung"
        };
    }

    private List<CardPromotion> ExtractPromosFromLinks(HtmlDocument doc, Uri baseUri, string bankName)
    {
        var promotions = new List<CardPromotion>();
        var seenTitles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Find all links that contain images or background images (typically promo cards)
        var linkNodes = doc.DocumentNode.SelectNodes("//a[.//img] | //a[.//div[contains(@style, 'background-image')]] | //a[.//div[contains(@class, 'backgroundImgOnContainingDiv')]]");
        if (linkNodes == null) return promotions;

        foreach (var link in linkNodes)
        {
            var href = link.GetAttributeValue("href", "");
            if (string.IsNullOrWhiteSpace(href) || href == "#" || href == "/") continue;

            // Filter: must look like a promotion/offer URL
            var lowerHref = href.ToLower();
            bool looksLikePromo = lowerHref.Contains("promo") || lowerHref.Contains("uu-dai") ||
                                   lowerHref.Contains("uudai") || lowerHref.Contains("khuyen-mai") ||
                                   lowerHref.Contains("khuyenmai") || lowerHref.Contains("offer") ||
                                   lowerHref.Contains("deal") || lowerHref.Contains("campaign");
            
            if (!looksLikePromo) continue;

            var img = link.SelectSingleNode(".//img");
            string? title = link.GetAttributeValue("title", "").Trim();
            if (string.IsNullOrWhiteSpace(title) && img != null)
            {
                title = img.GetAttributeValue("alt", "").Trim();
            }
            if (string.IsNullOrWhiteSpace(title))
            {
                title = CleanText(link.InnerText);
            }

            if (string.IsNullOrWhiteSpace(title)) continue;
            var lowerTitle = title.ToLower();
            if (lowerTitle.Contains("tìm hiểu thêm") || lowerTitle.Contains("xem chi tiết") || lowerTitle == "tại đây" || lowerTitle.Contains("khám phá")) continue;
            if (title.Length < 10 && !title.Contains("%") && !Regex.IsMatch(lowerTitle, "(giảm|hoàn|tặng|voucher|ưu đãi)")) continue;
            
            if (seenTitles.Contains(title)) continue;
            seenTitles.Add(title);

            string? imageUrl = ExtractImageUrl(link, baseUri);
            if (imageUrl == null || imageUrl.EndsWith(".svg", StringComparison.OrdinalIgnoreCase) || imageUrl.Contains("icon", StringComparison.OrdinalIgnoreCase))
            {
                continue; // Ignore links without proper images or just SVG icons
            }

            string? sourceUrl = ResolveUrl(href, baseUri);
            if (string.IsNullOrWhiteSpace(sourceUrl)) continue;

            promotions.Add(new CardPromotion
            {
                Title = title,
                ImageUrl = imageUrl,
                SourceUrl = sourceUrl,
                BankName = bankName,
                CategoryTab = "Chung"
            });
        }

        return promotions;
    }

    private string CleanText(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        text = HttpUtility.HtmlDecode(text);
        text = Regex.Replace(text, @"\s+", " ");
        return text.Trim();
    }

    private string? ResolveUrl(string? url, Uri baseUri)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        if (url.StartsWith("data:")) return null;
        if (url.StartsWith("//")) return "https:" + url;
        if (url.StartsWith("/")) return baseUri.Scheme + "://" + baseUri.Host + url;
        if (url.StartsWith("http")) return url;
        try {
            return new Uri(baseUri, url).ToString();
        } catch {
            return null;
        }
    }

    private string? ExtractImageUrl(HtmlNode block, Uri baseUri)
    {
        string? imageUrl = null;
        var img = block.SelectSingleNode(".//img[not(starts-with(@src, 'data:'))]") ?? block.SelectSingleNode(".//img");
        if (img != null)
        {
            string[] attrs = { "data-src", "data-original", "data-lazy-src", "data-lazy", "src" };
            foreach (var attr in attrs)
            {
                var val = img.GetAttributeValue(attr, "");
                if (!string.IsNullOrWhiteSpace(val) && val != "#")
                {
                    imageUrl = val;
                    break;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            var bgNode = block.SelectSingleNode(".//*[@style]");
            if (bgNode != null)
            {
                var style = bgNode.GetAttributeValue("style", "");
                var match = Regex.Match(style, @"background(?:-image)?\s*:\s*url\s*\(\s*['""]?(.*?)['""]?\s*\)", RegexOptions.IgnoreCase);
                if (match.Success) imageUrl = match.Groups[1].Value;
            }
        }
        
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            var style = block.GetAttributeValue("style", "");
            var match = Regex.Match(style, @"background(?:-image)?\s*:\s*url\s*\(\s*['""]?(.*?)['""]?\s*\)", RegexOptions.IgnoreCase);
            if (match.Success) imageUrl = match.Groups[1].Value;
        }

        if (!string.IsNullOrWhiteSpace(imageUrl))
        {
            return ResolveUrl(imageUrl, baseUri);
        }

        return null;
    }
}
