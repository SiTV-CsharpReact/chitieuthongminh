using Microsoft.AspNetCore.Mvc;
using backend.Controllers;
using backend.Models;
using System.Text.Json;

namespace backend.Services;

public class AutoScraperService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _config;
    private readonly ScraperStatusService _statusService;

    // Noise keywords - tên chứa những từ này sẽ bị loại
    private static readonly string[] NoiseKeywords = new[]
    {
        "mạng lưới", "chi nhánh", "atm", "ưu đãi mở thẻ", "ưu đãi giới thiệu",
        "chào mừng", "lợi ích khi sử dụng", "dịch vụ thẻ", "dịch vụ khác",
        "mở thẻ tín dụng online", "thẻ so sánh", "thẻ ghi nợ", "tài khoản arrow_forward",
        "arrow_forward", "đăng ký ngay", "liên hệ", "hotline", "tổng đài",
        "câu hỏi thường gặp", "faq", "điều khoản", "chính sách",
        "khuyến mãi", "tin tức", "sự kiện", "download", "tải app",
        "internet banking", "mobile banking", "ebanking",
        "tiện ích thẻ", "hỗ trợ thẻ", "các loại thẻ", "so sánh thẻ",
        "quyền lợi thẻ", "ưu đãi thẻ", "phí và lãi suất",
        "thanh toán trực tuyến", "chuyển khoản", "vay tín chấp",
        "bảo hiểm", "tiết kiệm", "đầu tư", "tuyển dụng",
        "biểu phí", "lãi suất cho vay", "hướng dẫn"
    };

    // Tên chính xác bị loại (so khớp chính xác sau khi trim + lowercase)
    private static readonly string[] ExactBlacklistNames = new[]
    {
        "thẻ tín dụng", "thẻ tín dụng ngân hàng", "credit card", "credit cards",
        "thẻ", "the tin dung", "card", "cards",
        "tiện ích thẻ", "hỗ trợ thẻ tín dụng", "các loại thẻ tín dụng",
        "sản phẩm thẻ", "dịch vụ thẻ tín dụng", "thẻ ngân hàng",
        "danh sách thẻ", "thẻ quốc tế", "thẻ nội địa"
    };

    public AutoScraperService(IServiceProvider serviceProvider, IConfiguration config, ScraperStatusService statusService)
    {
        _serviceProvider = serviceProvider;
        _config = config;
        _statusService = statusService;
    }

    /// <summary>
    /// Kiểm tra tên thẻ có phải rác hay không
    /// </summary>
    private bool IsNoiseName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return true;
        if (name.Length < 5 || name.Length > 120) return true;

        var lower = name.ToLower().Trim();

        // Loại tên chính xác là tiêu đề/section
        foreach (var exact in ExactBlacklistNames)
        {
            if (lower == exact) return true;
        }

        // Tên quá ngắn + chỉ chứa "thẻ tín dụng" + tên ngân hàng → không đủ cụ thể
        // VD: "Thẻ tín dụng ngân hàng HSBC" → rác (không có tên thẻ cụ thể)
        var cleaned = lower
            .Replace("thẻ tín dụng", "").Replace("thẻ", "")
            .Replace("credit card", "").Replace("ngân hàng", "")
            .Replace("bank", "").Trim();
        if (cleaned.Length < 3) return true;

        // Chứa từ khóa nhiễu
        foreach (var kw in NoiseKeywords)
        {
            if (lower.Contains(kw)) return true;
        }

        // Phải chứa ít nhất 1 từ khóa liên quan thẻ tín dụng
        bool looksLikeCard = lower.Contains("thẻ") || lower.Contains("card") ||
                              lower.Contains("visa") || lower.Contains("master") ||
                              lower.Contains("jcb") || lower.Contains("amex") ||
                              lower.Contains("platinum") || lower.Contains("gold") ||
                              lower.Contains("signature") || lower.Contains("cashback") ||
                              lower.Contains("credit") || lower.Contains("tín dụng") ||
                              lower.Contains("classic") || lower.Contains("standard") ||
                              lower.Contains("infinite") || lower.Contains("world") ||
                              lower.Contains("reward") || lower.Contains("travel") ||
                              lower.Contains("titanium") || lower.Contains("diamond");
        if (!looksLikeCard) return true;

        return false;
    }

    /// <summary>
    /// Chuẩn hoá phí thường niên.
    /// Trên thực tế phí thường niên tối thiểu là ~100,000đ đến hàng triệu đ, hoặc miễn phí (0đ).
    /// Nếu scraper trả về 399, 299, 199... đó là lỗi parse dấu chấm (399.000 → 399.0).
    /// </summary>
    private decimal NormalizeAnnualFee(decimal? rawFee)
    {
        if (!rawFee.HasValue || rawFee.Value <= 0) return 0;

        var fee = rawFee.Value;

        // Nếu phí < 10,000đ → gần như chắc chắn bị parse sai (399.000 → 399)
        // → nhân lại 1000
        if (fee > 0 && fee < 10000)
        {
            fee = fee * 1000;
        }

        return fee;
    }

    /// <summary>
    /// Kiểm tra thẻ có đủ dữ liệu tối thiểu hay không
    /// </summary>
    private bool HasMinimumData(CardScrapedDto scraped)
    {
        // Phải có ít nhất 1 trong các thông tin quan trọng
        bool hasAnyUsefulData =
            (scraped.AnnualFee.HasValue && scraped.AnnualFee > 0) ||
            (scraped.MinSalary.HasValue && scraped.MinSalary > 0) ||
            !string.IsNullOrWhiteSpace(scraped.CreditLimit) ||
            !string.IsNullOrWhiteSpace(scraped.InterestRate) ||
            (scraped.CashbackInfos != null && scraped.CashbackInfos.Any(c => c.SuggestedPercentage > 0));

        return hasAnyUsefulData;
    }

    public async Task<int> RunScraperAsync()
    {
        int newDraftsCreated = 0;
        var urls = _config.GetSection("BankScraperUrls").Get<List<BankScraperUrlModel>>();
        if (urls == null || !urls.Any()) return 0;

        _statusService.Reset(urls.Count);

        using var scope = _serviceProvider.CreateScope();
        var scraperController = scope.ServiceProvider.GetRequiredService<ScraperController>();
        var creditCardService = scope.ServiceProvider.GetRequiredService<CreditCardService>();
        var draftService = scope.ServiceProvider.GetRequiredService<ScraperDraftService>();
        var pdfExtractor = scope.ServiceProvider.GetRequiredService<PdfExtractorService>();

        var existingCards = await creditCardService.GetAsync();

        // Xóa toàn bộ drafts cũ trước khi chạy lại (tránh trùng lặp)
        var oldDrafts = await draftService.GetAsync();
        foreach (var old in oldDrafts)
        {
            if (old.Id != null) await draftService.RemoveAsync(old.Id);
        }

        // Track tên thẻ đã tạo draft trong lần chạy này (chống trùng)
        var draftedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var bankUrl in urls)
        {
            _statusService.CurrentBank = bankUrl.BankName;
            try
            {
                var request = new ScraperExtractionRequest { Url = bankUrl.Url };
                var response = await scraperController.ExtractCardDetails(request);

                if (response is OkObjectResult okResult && okResult.Value != null)
                {
                    var json = JsonSerializer.Serialize(okResult.Value);
                    using var doc = JsonDocument.Parse(json);
                    
                    if (doc.RootElement.TryGetProperty("Cards", out var cardsElement))
                    {
                        var scrapedCards = JsonSerializer.Deserialize<List<CardScrapedDto>>(cardsElement.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        
                        if (scrapedCards != null)
                        {
                            foreach (var scraped in scrapedCards)
                            {
                                // ===== FILTER 1: Loại tên rác =====
                                if (IsNoiseName(scraped.CardName))
                                {
                                    Console.WriteLine($"[AutoScraper] SKIPPED (noise name): {scraped.CardName}");
                                    continue;
                                }

                                // ===== FILTER 2: Loại thẻ không có dữ liệu hữu ích =====
                                if (!HasMinimumData(scraped))
                                {
                                    Console.WriteLine($"[AutoScraper] SKIPPED (empty data): {scraped.CardName}");
                                    continue;
                                }

                                // ===== FILTER 3: Chống trùng lặp trong cùng 1 lần chạy =====
                                if (draftedNames.Contains(scraped.CardName))
                                {
                                    Console.WriteLine($"[AutoScraper] SKIPPED (duplicate): {scraped.CardName}");
                                    continue;
                                }

                                // Check if card already exists in main DB
                                var existing = existingCards.FirstOrDefault(c => 
                                    c.Name.Equals(scraped.CardName, StringComparison.OrdinalIgnoreCase) ||
                                    c.Name.Contains(scraped.CardName, StringComparison.OrdinalIgnoreCase) ||
                                    scraped.CardName.Contains(c.Name, StringComparison.OrdinalIgnoreCase));

                                if (existing == null)
                                {
                                    // New card
                                    var draft = new ScraperDraft
                                    {
                                        Name = scraped.CardName.Trim(),
                                        Bank = bankUrl.BankName.ToLower().Replace(" ", ""),
                                        BankName = bankUrl.BankName,
                                        ImageUrl = scraped.ImageUrl,
                                        RegisterUrl = scraped.RegisterUrl,
                                        Link = scraped.DetailUrl ?? bankUrl.Url,
                                        AnnualFee = NormalizeAnnualFee(scraped.AnnualFee),
                                        MinSalary = NormalizeAnnualFee(scraped.MinSalary),
                                        CreditLimit = scraped.CreditLimit,
                                        InterestRate = scraped.InterestRate,
                                        TermsPdfUrl = scraped.TermsPdfUrl,
                                        Reason = "Phát hiện thẻ mới",
                                        CreatedAt = DateTime.UtcNow
                                    };
                                    
                                    // Map cashback rules (chỉ giữ rules có percentage > 0)
                                    if (scraped.CashbackInfos != null)
                                    {
                                        foreach(var cb in scraped.CashbackInfos)
                                        {
                                            if (cb.SuggestedPercentage.HasValue && cb.SuggestedPercentage > 0)
                                            {
                                                draft.CashbackRules.Add(new CashbackRule
                                                {
                                                    Category = "Tổng hợp",
                                                    Percentage = cb.SuggestedPercentage.Value,
                                                    CapAmount = cb.SuggestedCap
                                                });
                                            }
                                        }
                                    }

                                    await MergePdfInfoToDraftAsync(draft, pdfExtractor);
                                    await draftService.CreateAsync(draft);
                                    draftedNames.Add(scraped.CardName);
                                    newDraftsCreated++;
                                    _statusService.NewDraftsFound = newDraftsCreated;
                                }
                                else
                                {
                                    // Existing card - check if anything major changed
                                    bool hasChanges = false;
                                    string reason = "";

                                    var normalizedFee = NormalizeAnnualFee(scraped.AnnualFee);
                                    var normalizedSalary = NormalizeAnnualFee(scraped.MinSalary);

                                    if (normalizedFee > 0 && normalizedFee != existing.AnnualFee)
                                    {
                                        hasChanges = true;
                                        reason += $"Phí thường niên: {existing.AnnualFee:N0}đ → {normalizedFee:N0}đ. ";
                                    }

                                    if (normalizedSalary > 0 && normalizedSalary != existing.MinSalary)
                                    {
                                        hasChanges = true;
                                        reason += $"Lương tối thiểu: {existing.MinSalary:N0}đ → {normalizedSalary:N0}đ. ";
                                    }

                                    if (hasChanges && !draftedNames.Contains(scraped.CardName))
                                    {
                                        var draft = new ScraperDraft
                                        {
                                            Name = scraped.CardName.Trim(),
                                            Bank = existing.Bank,
                                            BankName = existing.BankName,
                                            ImageUrl = scraped.ImageUrl ?? existing.ImageUrl,
                                            RegisterUrl = scraped.RegisterUrl ?? existing.RegisterUrl,
                                            Link = scraped.DetailUrl ?? existing.Link,
                                            AnnualFee = normalizedFee > 0 ? normalizedFee : existing.AnnualFee,
                                            MinSalary = normalizedSalary > 0 ? normalizedSalary : existing.MinSalary,
                                            CreditLimit = scraped.CreditLimit ?? existing.CreditLimit,
                                            InterestRate = scraped.InterestRate ?? existing.InterestRate,
                                            TermsPdfUrl = scraped.TermsPdfUrl ?? existing.TermsPdfUrl,
                                            Reason = reason.Trim(),
                                            ExistingCardId = existing.Id,
                                            CreatedAt = DateTime.UtcNow
                                        };
                                        await MergePdfInfoToDraftAsync(draft, pdfExtractor);
                                        await draftService.CreateAsync(draft);
                                        draftedNames.Add(scraped.CardName);
                                        newDraftsCreated++;
                                        _statusService.NewDraftsFound = newDraftsCreated;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AutoScraper] Error scraping {bankUrl.BankName}: {ex.Message}");
            }
            
            _statusService.ProcessedBanks++;
        }

        _statusService.Complete();
        return newDraftsCreated;
    }

    private async Task MergePdfInfoToDraftAsync(ScraperDraft draft, PdfExtractorService pdfExtractor)
    {
        if (string.IsNullOrWhiteSpace(draft.TermsPdfUrl)) return;
        
        var pdfInfo = await pdfExtractor.ExtractInfoFromPdfAsync(draft.TermsPdfUrl);
        if (pdfInfo == null) return;

        bool updated = false;

        if (pdfInfo.AnnualFee.HasValue && (draft.AnnualFee == 0 || pdfInfo.AnnualFee > draft.AnnualFee))
        {
            draft.AnnualFee = pdfInfo.AnnualFee.Value;
            updated = true;
        }

        if (pdfInfo.MinSalary.HasValue && (draft.MinSalary == 0 || pdfInfo.MinSalary > draft.MinSalary))
        {
            draft.MinSalary = pdfInfo.MinSalary.Value;
            updated = true;
        }

        if (pdfInfo.MaxCashbackPerMonth.HasValue && (draft.MaxCashbackPerMonth == 0 || draft.MaxCashbackPerMonth == null))
        {
            draft.MaxCashbackPerMonth = pdfInfo.MaxCashbackPerMonth.Value;
            updated = true;
        }

        if (pdfInfo.CashbackRules.Any())
        {
            if (draft.CashbackRules.Count <= 1)
            {
                draft.CashbackRules = pdfInfo.CashbackRules;
                updated = true;
            }
            else
            {
                foreach(var rule in pdfInfo.CashbackRules)
                {
                    if (!draft.CashbackRules.Any(r => r.Percentage == rule.Percentage && r.Category == rule.Category))
                    {
                        draft.CashbackRules.Add(rule);
                        updated = true;
                    }
                }
            }
        }

        if (updated)
        {
            draft.Reason += " (Bổ sung dữ liệu từ PDF)";
        }
    }
}
