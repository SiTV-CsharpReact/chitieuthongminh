using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly PromotionService _promotionsService;
    private readonly PromotionAlertService _alertService;

    public PromotionsController(PromotionService promotionsService, PromotionAlertService alertService)
    {
        _promotionsService = promotionsService;
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<List<CardPromotion>> Get() =>
        await _promotionsService.GetAsync();

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<CardPromotion>> Get(string id)
    {
        var promotion = await _promotionsService.GetAsync(id);

        if (promotion is null)
        {
            return NotFound();
        }

        return promotion;
    }

    [HttpPost]
    public async Task<IActionResult> Post(CardPromotion newPromotion)
    {
        newPromotion.CreatedAt = DateTime.UtcNow;
        newPromotion.UpdatedAt = DateTime.UtcNow;
        await _promotionsService.CreateAsync(newPromotion);

        // Notify VIP users
        _alertService.NotifyVipUsersAsync(new List<CardPromotion> { newPromotion });

        return CreatedAtAction(nameof(Get), new { id = newPromotion.Id }, newPromotion);
    }

    [HttpPost("batch")]
    public async Task<IActionResult> PostBatch(List<CardPromotion> rules)
    {
        foreach (var p in rules)
        {
            p.CreatedAt = DateTime.UtcNow;
            p.UpdatedAt = DateTime.UtcNow;
            await _promotionsService.CreateAsync(p);
        }

        // Notify VIP users for all new promotions
        _alertService.NotifyVipUsersAsync(rules);

        return Ok(new { message = "Seeded successfully" });
    }

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, CardPromotion updatedPromotion)
    {
        var promotion = await _promotionsService.GetAsync(id);

        if (promotion is null)
        {
            return NotFound();
        }

        updatedPromotion.Id = promotion.Id;
        updatedPromotion.CreatedAt = promotion.CreatedAt;
        updatedPromotion.UpdatedAt = DateTime.UtcNow;

        await _promotionsService.UpdateAsync(id, updatedPromotion);

        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        var promotion = await _promotionsService.GetAsync(id);

        if (promotion is null)
        {
            return NotFound();
        }

        await _promotionsService.RemoveAsync(id);

        return NoContent();
    }

    [HttpDelete("all")]
    public async Task<IActionResult> DeleteAll()
    {
        await _promotionsService.RemoveAllAsync();
        return NoContent();
    }
}
