using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AutoScraperController : ControllerBase
{
    private readonly ScraperDraftService _draftService;
    private readonly CreditCardService _creditCardService;
    private readonly AutoScraperService _autoScraperService;

    private readonly PromoScraperDraftService _promoDraftService;
    private readonly PromotionService _promotionService;
    private readonly ScraperStatusService _statusService;
    private readonly IServiceScopeFactory _scopeFactory;

    public AutoScraperController(ScraperDraftService draftService, CreditCardService creditCardService, AutoScraperService autoScraperService, PromoScraperDraftService promoDraftService, PromotionService promotionService, ScraperStatusService statusService, IServiceScopeFactory scopeFactory)
    {
        _draftService = draftService;
        _creditCardService = creditCardService;
        _autoScraperService = autoScraperService;
        _promoDraftService = promoDraftService;
        _promotionService = promotionService;
        _statusService = statusService;
        _scopeFactory = scopeFactory;
    }

    [HttpGet("drafts")]
    public async Task<ActionResult<List<ScraperDraft>>> GetDrafts()
    {
        var drafts = await _draftService.GetAsync();
        return Ok(drafts.OrderByDescending(d => d.CreatedAt));
    }

    [HttpGet("promo-drafts")]
    public async Task<ActionResult<List<PromoScraperDraft>>> GetPromoDrafts()
    {
        var drafts = await _promoDraftService.GetAsync();
        return Ok(drafts.OrderByDescending(d => d.CreatedAt));
    }

    [HttpPost("trigger")]
    public IActionResult TriggerScraper()
    {
        if (_statusService.IsRunning)
        {
            return BadRequest(new { message = "Bot đang chạy, vui lòng chờ." });
        }

        // Chạy background task thay vì await, sử dụng scope riêng để tránh lỗi disposed
        Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedScraperService = scope.ServiceProvider.GetRequiredService<AutoScraperService>();
                await scopedScraperService.RunScraperAsync();
            }
            catch (Exception ex)
            {
                _statusService.Fail(ex.Message);
            }
        });
        
        return Ok(new { message = "Bot đã bắt đầu chạy ngầm." });
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        return Ok(new
        {
            isRunning = _statusService.IsRunning,
            totalBanks = _statusService.TotalBanks,
            processedBanks = _statusService.ProcessedBanks,
            currentBank = _statusService.CurrentBank,
            newDraftsFound = _statusService.NewDraftsFound,
            errorMessage = _statusService.ErrorMessage
        });
    }

    [HttpPost("trigger-promotions")]
    public IActionResult TriggerPromotionScraper()
    {
        if (_statusService.IsRunning)
        {
            return BadRequest(new { message = "Bot đang chạy, vui lòng chờ." });
        }

        Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var promoScraper = scope.ServiceProvider.GetRequiredService<PromotionScraperService>();
                await promoScraper.ScrapePromotionsAsync(scope.ServiceProvider);
            }
            catch (Exception ex)
            {
                _statusService.Fail(ex.Message);
            }
        });

        return Ok(new { message = "Bot cào ưu đãi đã bắt đầu chạy ngầm." });
    }

    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveDraft(string id)
    {
        var draft = await _draftService.GetAsync(id);
        if (draft == null) return NotFound("Không tìm thấy thẻ nháp");

        var creditCard = new CreditCard
        {
            Name = draft.Name,
            Bank = draft.Bank,
            BankName = draft.BankName,
            BankLogo = draft.BankLogo,
            ImageUrl = draft.ImageUrl,
            Link = draft.Link,
            RegisterUrl = draft.RegisterUrl,
            AnnualFee = draft.AnnualFee,
            CashbackRules = draft.CashbackRules,
            MinSalary = draft.MinSalary,
            Requirement = draft.Requirement,
            WelcomeOffer = draft.WelcomeOffer,
            MaxCashbackPerMonth = draft.MaxCashbackPerMonth,
            MinSpendForCashback = draft.MinSpendForCashback,
            Description = draft.Description,
            Benefits = draft.Benefits,
            Pros = draft.Pros,
            Cons = draft.Cons,
            Tags = draft.Tags,
            CreditLimit = draft.CreditLimit,
            InterestRate = draft.InterestRate,
            TermsPdfUrl = draft.TermsPdfUrl,
            Ratings = draft.Ratings ?? new CardRatings(),
            Status = "Active"
        };

        if (!string.IsNullOrEmpty(draft.ExistingCardId))
        {
            // Cập nhật thẻ cũ
            var existing = await _creditCardService.GetAsync(draft.ExistingCardId);
            if (existing != null)
            {
                creditCard.Id = existing.Id; // Keep same ID
                // Copy over fields that shouldn't be overwritten by scraper
                creditCard.Description = existing.Description;
                creditCard.Benefits = existing.Benefits;
                creditCard.Pros = existing.Pros;
                creditCard.Cons = existing.Cons;
                creditCard.Ratings = existing.Ratings;
                creditCard.CashbackRules = existing.CashbackRules; // Scraper's cashback is basic, keep the manual one
                
                await _creditCardService.UpdateAsync(existing.Id!, creditCard);
            }
            else
            {
                await _creditCardService.CreateAsync(creditCard);
            }
        }
        else
        {
            // Tạo mới
            await _creditCardService.CreateAsync(creditCard);
        }

        // Xóa draft sau khi duyệt -> Đổi sang Cập nhật trạng thái
        draft.Status = "Approved";
        await _draftService.UpdateAsync(id, draft);

        return Ok(new { message = "Đã duyệt thẻ và cập nhật vào hệ thống chính." });
    }

    [HttpDelete("draft/{id}")]
    public async Task<IActionResult> RejectDraft(string id)
    {
        var draft = await _draftService.GetAsync(id);
        if (draft == null) return NotFound("Không tìm thấy thẻ nháp");

        draft.Status = "Rejected";
        await _draftService.UpdateAsync(id, draft);
        return Ok(new { message = "Đã từ chối bản nháp." });
    }

    [HttpDelete("drafts/all")]
    public async Task<IActionResult> ClearAllDrafts()
    {
        var drafts = await _draftService.GetAsync();
        var pendingDrafts = drafts.Where(d => d.Status == "Pending" || string.IsNullOrEmpty(d.Status)).ToList();
        int count = pendingDrafts.Count;
        foreach (var d in pendingDrafts)
        {
            if (d.Id != null) 
            {
                d.Status = "Rejected";
                await _draftService.UpdateAsync(d.Id, d);
            }
        }
        return Ok(new { message = $"Đã từ chối toàn bộ {count} bản nháp đang chờ duyệt." });
    }

    [HttpPost("promo-drafts/{id}/approve")]
    public async Task<IActionResult> ApprovePromoDraft(string id)
    {
        var draft = await _promoDraftService.GetAsync(id);
        if (draft == null) return NotFound("Không tìm thấy nháp ưu đãi");

        var promotion = new CardPromotion
        {
            Title = draft.Title,
            Description = draft.Description,
            ImageUrl = draft.ImageUrl,
            SourceUrl = draft.SourceUrl,
            BankName = draft.BankName,
            DiscountRate = draft.DiscountRate,
            ValidUntil = draft.ValidUntil,
            CategoryTab = draft.CategoryTab,
            ApplicableCards = draft.ApplicableCards,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _promotionService.CreateAsync(promotion);

        draft.Status = "Approved";
        await _promoDraftService.UpdateAsync(id, draft);

        return Ok(new { message = "Đã duyệt ưu đãi và cập nhật vào hệ thống chính." });
    }

    [HttpPost("promo-drafts/approve-all")]
    public async Task<IActionResult> ApproveAllPromoDrafts()
    {
        var drafts = await _promoDraftService.GetAsync();
        var pendingDrafts = drafts.Where(d => d.Status == "Pending" || string.IsNullOrEmpty(d.Status)).ToList();
        int count = 0;
        foreach (var draft in pendingDrafts)
        {
            if (draft.Id == null) continue;
            var promotion = new CardPromotion
            {
                Title = draft.Title,
                Description = draft.Description,
                ImageUrl = draft.ImageUrl,
                SourceUrl = draft.SourceUrl,
                BankName = draft.BankName,
                DiscountRate = draft.DiscountRate,
                ValidUntil = draft.ValidUntil,
                CategoryTab = draft.CategoryTab,
                ApplicableCards = draft.ApplicableCards,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _promotionService.CreateAsync(promotion);

            draft.Status = "Approved";
            await _promoDraftService.UpdateAsync(draft.Id, draft);
            count++;
        }

        return Ok(new { message = $"Đã duyệt thành công {count} ưu đãi và cập nhật vào hệ thống chính." });
    }

    [HttpDelete("promo-drafts/{id}/reject")]
    public async Task<IActionResult> RejectPromoDraft(string id)
    {
        var draft = await _promoDraftService.GetAsync(id);
        if (draft == null) return NotFound("Không tìm thấy nháp ưu đãi");

        draft.Status = "Rejected";
        await _promoDraftService.UpdateAsync(id, draft);
        return Ok(new { message = "Đã từ chối ưu đãi." });
    }

    [HttpDelete("promo-drafts/clear")]
    public async Task<IActionResult> ClearAllPromoDrafts()
    {
        var drafts = await _promoDraftService.GetAsync();
        var pendingDrafts = drafts.Where(d => d.Status == "Pending" || string.IsNullOrEmpty(d.Status)).ToList();
        int count = pendingDrafts.Count;
        
        await _promoDraftService.DeleteAllPendingAsync();
        
        return Ok(new { message = $"Đã xóa/từ chối toàn bộ {count} bản nháp ưu đãi đang chờ duyệt." });
    }

    [HttpDelete("promo-drafts/{id}")]
    public async Task<IActionResult> DeletePromoDraft(string id)
    {
        var draft = await _promoDraftService.GetAsync(id);
        if (draft == null) return NotFound("Không tìm thấy nháp ưu đãi");

        await _promoDraftService.DeleteAsync(id);
        return Ok(new { message = "Đã xoá bản nháp ưu đãi." });
    }

    [HttpDelete("promo-drafts/clear-history")]
    public async Task<IActionResult> ClearHistoryPromoDrafts()
    {
        var drafts = await _promoDraftService.GetAsync();
        var historyDrafts = drafts.Where(d => d.Status == "Approved" || d.Status == "Rejected").ToList();
        int count = historyDrafts.Count;
        
        await _promoDraftService.DeleteAllHistoryAsync();
        
        return Ok(new { message = $"Đã xóa toàn bộ {count} bản nháp trong lịch sử." });
    }
}
