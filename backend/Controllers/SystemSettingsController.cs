using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemSettingsController : ControllerBase
{
    private readonly SystemSettingsService _settingsService;

    public SystemSettingsController(SystemSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<ActionResult<SystemSettings>> GetSettings()
    {
        var settings = await _settingsService.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] SystemSettings updatedSettings)
    {
        var existing = await _settingsService.GetSettingsAsync();
        
        existing.IsAutoScraperEnabled = updatedSettings.IsAutoScraperEnabled;
        existing.AutoScraperIntervalHours = updatedSettings.AutoScraperIntervalHours;
        existing.IsPromoScraperEnabled = updatedSettings.IsPromoScraperEnabled;
        existing.PromoScraperIntervalHours = updatedSettings.PromoScraperIntervalHours;
        
        await _settingsService.UpdateSettingsAsync(existing);
        return Ok(new { message = "Đã cập nhật cài đặt thành công" });
    }
}
