using Microsoft.Playwright;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using backend.Models;
using backend.Controllers;
using System.Text.RegularExpressions;
using HtmlAgilityPack;

namespace backend.Services;

public class CardScraperService
{
    private readonly IConfiguration _config;
    private readonly CardScraperStatusService _statusService;

    public CardScraperService(IConfiguration config, CardScraperStatusService statusService)
    {
        _config = config;
        _statusService = statusService;
    }

    public async Task<int> ScrapeCardsAsync(IServiceProvider serviceProvider)
    {
        var urls = _config.GetSection("BankScraperUrls").Get<List<BankScraperUrlModel>>();
        if (urls == null || !urls.Any()) return 0;

        // Bỏ qua các bank không có Url (hoặc rỗng)
        var banksWithCardUrl = urls.Where(u => !string.IsNullOrWhiteSpace(u.Url)).ToList();
        if (!banksWithCardUrl.Any()) return 0;

        _statusService.Reset(banksWithCardUrl.Count);

        using var scope = serviceProvider.CreateScope();
        var mongoClient = scope.ServiceProvider.GetRequiredService<IMongoClient>();
        var database = mongoClient.GetDatabase(_config["DatabaseName"]);
        var draftsCollection = database.GetCollection<CardScraperDraft>("CardScraperDrafts");
        var existingCardsCollection = database.GetCollection<CreditCard>("CreditCards");

        var existingCards = await existingCardsCollection.Find(_ => true).ToListAsync();
        var existingDrafts = await draftsCollection.Find(_ => true).ToListAsync();

        var seenTitles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var c in existingCards) seenTitles.Add(c.Name.Trim());
        foreach (var d in existingDrafts) seenTitles.Add(d.Title.Trim());

        int newCardsCreated = 0;

        try
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions 
            { 
                Headless = true,
                Args = new[] { "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage" }
            });

            foreach (var bankUrl in banksWithCardUrl)
            {
                var context = await browser.NewContextAsync(new BrowserNewContextOptions
                {
                    UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    ViewportSize = new ViewportSize { Width = 1366, Height = 768 }
                });
                await context.AddInitScriptAsync("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");
                var page = await context.NewPageAsync();
                
                _statusService.CurrentBank = bankUrl.BankName + " (Thẻ tín dụng)";
                var cardsToInsert = new List<CardScraperDraft>();

                try
                {
                    Console.WriteLine($"[CardScraper] Vô {bankUrl.BankName}: {bankUrl.Url}");
                    var cardsFound = await ExtractCardsFromUrl(bankUrl.Url, bankUrl.BankName, bankUrl.ScrapingMethod ?? "Standard", page);
                    
                    foreach (var card in cardsFound)
                    {
                        var titleKey = card.Title.Trim();
                        if (string.IsNullOrWhiteSpace(titleKey) || seenTitles.Contains(titleKey)) continue;

                        // Deep crawl to find PDF
                        if (!string.IsNullOrWhiteSpace(card.SourceUrl))
                        {
                            try {
                                card.TermsPdfUrl = await FindPdfUrlInDetail(card.SourceUrl, page);
                            } catch (Exception ex) {
                                Console.WriteLine($"[CardScraper] Lỗi đọc PDF cho {titleKey}: {ex.Message}");
                            }
                        }

                        cardsToInsert.Add(card);
                        seenTitles.Add(titleKey);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[CardScraper] Error scraping cards for {bankUrl.BankName}: {ex.Message}");
                }
                finally
                {
                    await page.CloseAsync();
                    await context.CloseAsync();
                }

                if (cardsToInsert.Any())
                {
                    await draftsCollection.InsertManyAsync(cardsToInsert);
                    newCardsCreated += cardsToInsert.Count;
                    _statusService.NewCardsFound += cardsToInsert.Count;
                }
                
                _statusService.IncrementProcessed();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CardScraper] Fatal error: {ex.Message}");
        }
        finally
        {
            _statusService.Finish();
        }

        return newCardsCreated;
    }

    private async Task<List<CardScraperDraft>> ExtractCardsFromUrl(string url, string bankName, string method, IPage page)
    {
        var cards = new List<CardScraperDraft>();
        if (string.IsNullOrWhiteSpace(url)) return cards;

        try
        {
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle, Timeout = 30000 });
            await Task.Delay(3000); // Allow JS rendering

            if (method == "ScrollAndClick")
            {
                for (int i = 0; i < 2; i++)
                {
                    try
                    {
                        var buttons = await page.Locator("button:has-text('Xem thêm'), button:has-text('Hiển thị thêm'), a:has-text('Xem thêm')").AllAsync();
                        foreach (var btn in buttons)
                        {
                            if (await btn.IsVisibleAsync())
                            {
                                await btn.ClickAsync();
                                await Task.Delay(2000);
                            }
                        }
                    }
                    catch (Exception) { }
                    await page.EvaluateAsync("window.scrollTo(0, document.body.scrollHeight)");
                    await Task.Delay(2000);
                }
            }
            else
            {
                await page.EvaluateAsync("window.scrollTo(0, document.body.scrollHeight)");
                await Task.Delay(2000);
            }

            var html = await page.ContentAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var baseUri = new Uri(url);
            
            // Tìm các link chứa ảnh
            var linkNodes = doc.DocumentNode.SelectNodes("//a[@href]");
            if (linkNodes == null) return cards;

            var seenUrls = new HashSet<string>();

            foreach (var link in linkNodes)
            {
                var href = link.GetAttributeValue("href", "");
                if (string.IsNullOrWhiteSpace(href) || href.Contains("javascript:") || href == "#") continue;
                
                // Heuristic: Credit card links often have 'the-tin-dung', 'credit-card', 'cards', or specific IDs
                var lowerHref = href.ToLower();
                if (!lowerHref.Contains("the") && !lowerHref.Contains("card") && !lowerHref.Contains("chi-tiet")) 
                {
                    // Lỏng tay hơn với thẻ tín dụng
                    if (!link.InnerHtml.ToLower().Contains("thẻ") && !link.InnerHtml.ToLower().Contains("card")) continue;
                }

                string? sourceUrl = ResolveUrl(href, baseUri);
                if (sourceUrl == null || seenUrls.Contains(sourceUrl)) continue;

                var imgNode = link.SelectSingleNode(".//img");
                var bgNode = link.SelectSingleNode(".//div[contains(@style, 'background-image')]") ?? link.SelectSingleNode(".//*[@class and contains(@class, 'image')]");
                
                if (imgNode == null && bgNode == null) continue;

                string? imageUrl = ExtractImageUrl(link, baseUri);
                if (string.IsNullOrWhiteSpace(imageUrl) || imageUrl.EndsWith(".svg", StringComparison.OrdinalIgnoreCase)) continue;

                string title = CleanText(link.InnerText);
                if (string.IsNullOrWhiteSpace(title) || title.Length < 5)
                {
                    var parentNode = link.ParentNode;
                    if (parentNode != null) title = CleanText(parentNode.InnerText);
                }
                if (string.IsNullOrWhiteSpace(title)) continue;
                
                if (title.ToLower().Contains("tìm hiểu thêm") || title.ToLower().Contains("chi tiết")) {
                    // Try to find a heading
                    var heading = link.ParentNode?.ParentNode?.SelectSingleNode(".//h2 | .//h3 | .//h4 | .//div[contains(@class, 'title')]");
                    if (heading != null) title = CleanText(heading.InnerText);
                }

                if (string.IsNullOrWhiteSpace(title) || title.Length < 6) continue;

                cards.Add(new CardScraperDraft
                {
                    Title = title,
                    BankName = bankName,
                    SourceUrl = sourceUrl,
                    ImageUrl = imageUrl
                });
                seenUrls.Add(sourceUrl);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CardScraper] Error {url}: {ex.Message}");
        }

        return cards;
    }

    private async Task<string?> FindPdfUrlInDetail(string url, IPage page)
    {
        try {
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded, Timeout = 15000 });
            var html = await page.ContentAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            var baseUri = new Uri(url);

            var links = doc.DocumentNode.SelectNodes("//a[@href]");
            if (links != null)
            {
                foreach (var link in links)
                {
                    var href = link.GetAttributeValue("href", "");
                    var lowerHref = href.ToLower();
                    var innerText = CleanText(link.InnerText).ToLower();

                    // Tìm PDF hoặc Thể lệ/Điều khoản
                    if (lowerHref.EndsWith(".pdf") || 
                        lowerHref.Contains("dieukhoan") || 
                        lowerHref.Contains("the-le") ||
                        lowerHref.Contains("terms") ||
                        lowerHref.Contains("dieu-khoan") ||
                        innerText.Contains("điều khoản") || 
                        innerText.Contains("thể lệ") ||
                        innerText.Contains("hợp đồng"))
                    {
                        var resolved = ResolveUrl(href, baseUri);
                        if (resolved != null) return resolved;
                    }
                }
            }
        } catch { }
        return null;
    }

    private string? ExtractImageUrl(HtmlNode node, Uri baseUri)
    {
        var imgNode = node.Name == "img" ? node : node.SelectSingleNode(".//img");
        if (imgNode != null)
        {
            var src = imgNode.GetAttributeValue("src", "");
            if (string.IsNullOrWhiteSpace(src) || src.StartsWith("data:")) src = imgNode.GetAttributeValue("data-src", "");
            if (!string.IsNullOrWhiteSpace(src) && !src.StartsWith("data:")) return ResolveUrl(src, baseUri);
        }

        var bgNode = node.SelectSingleNode(".//*[@style]");
        if (bgNode != null)
        {
            var style = bgNode.GetAttributeValue("style", "");
            var match = Regex.Match(style, @"background(?:-image)?\s*:\s*url\s*\(\s*['""]?(.*?)['""]?\s*\)", RegexOptions.IgnoreCase);
            if (match.Success) return ResolveUrl(match.Groups[1].Value, baseUri);
        }

        return null;
    }

    private string CleanText(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        text = System.Net.WebUtility.HtmlDecode(text);
        text = Regex.Replace(text, @"\s+", " ");
        return text.Trim();
    }

    private string? ResolveUrl(string path, Uri baseUri)
    {
        if (string.IsNullOrWhiteSpace(path) || path.StartsWith("javascript:") || path == "#") return null;
        if (Uri.TryCreate(baseUri, path, out var resolved))
        {
            return resolved.ToString();
        }
        return path;
    }
}
