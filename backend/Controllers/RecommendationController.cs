using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using MongoDB.Driver;

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
    public async Task<ActionResult<RecommendationResponse>> GetRecommendation(RecommendationRequest input)
    {
        var result = await _id3Service.RecommendCardsAsync(input);
        return Ok(result);
    }

    public class SmartSelectorRequest
    {
        public decimal Amount { get; set; }
        public string Category { get; set; } = null!;
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("smart-selector")]
    public async Task<IActionResult> SmartSelector([FromBody] SmartSelectorRequest request, [FromServices] MongoDB.Driver.IMongoClient mongoClient, [FromServices] IConfiguration config)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        var usersCollection = database.GetCollection<User>("Users");
        var user = await usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();

        if (user == null || user.SavedCardIds == null || !user.SavedCardIds.Any())
            return Ok(new { message = "Ví thẻ trống", cards = new List<object>() });

        var cardsCollection = database.GetCollection<CreditCard>("CreditCards");
        var cards = await cardsCollection.Find(c => user.SavedCardIds.Contains(c.Id)).ToListAsync();

        var results = new List<object>();

        foreach (var card in cards)
        {
            decimal cashbackRate = 0;
            // Tìm rule phù hợp nhất cho category
            var rule = card.CashbackRules?.OrderByDescending(r => r.Percentage).FirstOrDefault(r => r.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase) || r.Category == "Mọi chi tiêu" || r.Category == "All");
            if (rule != null)
            {
                cashbackRate = rule.Percentage;
            }

            decimal cashbackAmount = request.Amount * (cashbackRate / 100);
            if (rule?.CapAmount > 0 && cashbackAmount > rule.CapAmount)
            {
                cashbackAmount = rule.CapAmount.Value;
            }

            results.Add(new {
                Card = card,
                CashbackRate = cashbackRate,
                CashbackAmount = cashbackAmount
            });
        }

        var sortedResults = results.OrderByDescending(r => (decimal)r.GetType().GetProperty("CashbackAmount")!.GetValue(r)!).ToList();

        return Ok(new { cards = sortedResults });
    }
}
