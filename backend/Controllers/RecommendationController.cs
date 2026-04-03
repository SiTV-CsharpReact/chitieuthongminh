using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationController : ControllerBase
{
    private readonly ID3Service _id3Service;

    public RecommendationController(ID3Service id3Service)
    {
        _id3Service = id3Service;
    }

    [HttpPost]
    public async Task<ActionResult<List<CreditCard>>> GetRecommendation(SpendingData input)
    {
        var result = await _id3Service.RecommendCardsAsync(input);
        return Ok(result);
    }
}
