using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpendingController : ControllerBase
{
    private readonly MongoDBService _mongoDBService;

    public SpendingController(MongoDBService mongoDBService)
    {
        _mongoDBService = mongoDBService;
    }

    [HttpGet]
    public async Task<List<SpendingData>> Get() =>
        await _mongoDBService.GetAsync();

    [HttpPost]
    public async Task<IActionResult> Post(SpendingData newData)
    {
        newData.Date = DateTime.UtcNow;
        await _mongoDBService.CreateAsync(newData);
        return Ok(newData);
    }
}
