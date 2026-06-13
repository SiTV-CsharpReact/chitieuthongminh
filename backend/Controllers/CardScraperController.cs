using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CardScraperController : ControllerBase
{
    private readonly CardScraperService _scraperService;
    private readonly CardScraperStatusService _statusService;
    private readonly IMongoCollection<CardScraperDraft> _draftsCollection;
    private readonly IMongoCollection<CreditCard> _cardsCollection;

    public CardScraperController(
        CardScraperService scraperService, 
        CardScraperStatusService statusService,
        IMongoClient mongoClient,
        IConfiguration config)
    {
        _scraperService = scraperService;
        _statusService = statusService;
        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        _draftsCollection = database.GetCollection<CardScraperDraft>("CardScraperDrafts");
        _cardsCollection = database.GetCollection<CreditCard>("CreditCards");
    }

    [HttpPost("start")]
    public IActionResult StartScraping([FromServices] IServiceProvider serviceProvider)
    {
        if (_statusService.IsRunning)
        {
            return BadRequest(new { message = "Scraper is already running." });
        }

        Task.Run(async () =>
        {
            try
            {
                await _scraperService.ScrapeCardsAsync(serviceProvider);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CardScraper] Failed: {ex.Message}");
            }
            finally
            {
                _statusService.IsRunning = false;
            }
        });

        return Ok(new { message = "Scraper started successfully." });
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
            newCardsFound = _statusService.NewCardsFound,
            lastRunTime = _statusService.LastRunTime
        });
    }

    [HttpGet("drafts")]
    public async Task<IActionResult> GetDrafts()
    {
        var drafts = await _draftsCollection.Find(d => d.Status == "Pending")
            .SortByDescending(d => d.CreatedAt)
            .ToListAsync();
        return Ok(drafts);
    }

    [HttpDelete("drafts/{id}")]
    public async Task<IActionResult> DeleteDraft(string id)
    {
        await _draftsCollection.DeleteOneAsync(d => d.Id == id);
        return Ok(new { message = "Deleted draft." });
    }

    [HttpPost("import/{id}")]
    public async Task<IActionResult> ImportDraft(string id)
    {
        var draft = await _draftsCollection.Find(d => d.Id == id).FirstOrDefaultAsync();
        if (draft == null) return NotFound(new { message = "Draft not found." });

        // Logic to link or import. If we find a card with the same name, we can just update its PDF link.
        // Or create a new card. For now, create a new card if it doesn't exist.
        var existingCard = await _cardsCollection.Find(c => c.Name.ToLower() == draft.Title.ToLower()).FirstOrDefaultAsync();

        if (existingCard != null)
        {
            // Just update PDF link if empty
            if (string.IsNullOrWhiteSpace(existingCard.TermsPdfUrl) && !string.IsNullOrWhiteSpace(draft.TermsPdfUrl))
            {
                var update = Builders<CreditCard>.Update.Set(c => c.TermsPdfUrl, draft.TermsPdfUrl);
                await _cardsCollection.UpdateOneAsync(c => c.Id == existingCard.Id, update);
            }
            // Optional: update Link as well if needed
            if (string.IsNullOrWhiteSpace(existingCard.Link) && !string.IsNullOrWhiteSpace(draft.SourceUrl))
            {
                var update = Builders<CreditCard>.Update.Set(c => c.Link, draft.SourceUrl);
                await _cardsCollection.UpdateOneAsync(c => c.Id == existingCard.Id, update);
            }
        }
        else
        {
            // Create a brand new minimal card
            var newCard = new CreditCard
            {
                Name = draft.Title,
                Bank = draft.BankName ?? "Unknown",
                BankName = draft.BankName ?? "Unknown",
                ImageUrl = draft.ImageUrl,
                Link = draft.SourceUrl,
                TermsPdfUrl = draft.TermsPdfUrl,
                Status = "Active"
            };
            await _cardsCollection.InsertOneAsync(newCard);
        }

        var updateDraft = Builders<CardScraperDraft>.Update.Set(d => d.Status, "Imported");
        await _draftsCollection.UpdateOneAsync(d => d.Id == id, updateDraft);

        return Ok(new { message = "Imported successfully." });
    }
}
