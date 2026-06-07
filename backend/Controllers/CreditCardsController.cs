using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using System.Text.RegularExpressions;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreditCardsController : ControllerBase
{
    private readonly CreditCardService _creditCardService;
    private readonly ScraperController _scraperController;

    public CreditCardsController(CreditCardService creditCardService, ScraperController scraperController)
    {
        _creditCardService = creditCardService;
        _scraperController = scraperController;
    }

    [HttpGet]
    public async Task<List<CreditCard>> Get() =>
        await _creditCardService.GetAsync();

    [HttpGet("{idOrSlug}")]
    public async Task<ActionResult<CreditCard>> Get(string idOrSlug)
    {
        CreditCard? card = null;

        // Try by ID first if it's a valid 24-character hex string
        if (idOrSlug.Length == 24 && Regex.IsMatch(idOrSlug, @"\A\b[0-9a-fA-F]+\b\Z"))
        {
            card = await _creditCardService.GetAsync(idOrSlug);
        }

        // If not found or not a valid ID format, try by Slug
        if (card is null)
        {
            card = await _creditCardService.GetBySlugAsync(idOrSlug);
        }

        if (card is null)
        {
            return NotFound();
        }

        return card;
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreditCard newCard)
    {
        // Auto-download external image to local storage
        await TryDownloadCardFiles(newCard);

        await _creditCardService.CreateAsync(newCard);

        // Save card name to appsettings.json for later reference
        await SaveScrapedCardName(newCard.Name);

        return CreatedAtAction(nameof(Get), new { id = newCard.Id }, newCard);
    }

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, CreditCard updatedCard)
    {
        var card = await _creditCardService.GetAsync(id);

        if (card is null)
        {
            return NotFound();
        }

        updatedCard.Id = card.Id;

        // Auto-download external image to local storage
        await TryDownloadCardFiles(updatedCard);

        await _creditCardService.UpdateAsync(id, updatedCard);

        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        var card = await _creditCardService.GetAsync(id);

        if (card is null)
        {
            return NotFound();
        }

        await _creditCardService.RemoveAsync(id);

        return NoContent();
    }

    /// <summary>
    /// If ImageUrl or TermsPdfUrl starts with http (external), download it to local upload/image/{BankName}/{CardSlug}/ 
    /// and replace the URL with the absolute local path.
    /// </summary>
    private async Task TryDownloadCardFiles(CreditCard card)
    {
        string bankName = !string.IsNullOrWhiteSpace(card.BankName) ? card.BankName : card.Bank ?? "unknown";

        // Download Image
        try
        {
            if (!string.IsNullOrWhiteSpace(card.ImageUrl) && card.ImageUrl.StartsWith("http"))
            {
                string baseUrl = $"{this.Request.Scheme}://{this.Request.Host}";
                var localPath = await _scraperController.DownloadAndSaveFileInternal(card.ImageUrl, bankName, card.Name, baseUrl);
                if (!string.IsNullOrEmpty(localPath)) card.ImageUrl = localPath;
            }
        }
        catch (Exception ex) { Console.WriteLine($"TryDownloadCardFiles (Image) error: {ex.Message}"); }

        // Do not download PDF, just keep the external bank URL as requested by user
    }
    private async Task SaveScrapedCardName(string cardName)
    {
        try
        {
            var configPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            if (System.IO.File.Exists(configPath))
            {
                var json = await System.IO.File.ReadAllTextAsync(configPath);
                var root = System.Text.Json.Nodes.JsonNode.Parse(json) as System.Text.Json.Nodes.JsonObject;
                
                if (root != null)
                {
                    if (!root.ContainsKey("ScrapedCardNames"))
                    {
                        root["ScrapedCardNames"] = new System.Text.Json.Nodes.JsonArray();
                    }
                    
                    var array = root["ScrapedCardNames"] as System.Text.Json.Nodes.JsonArray;
                    if (array != null)
                    {
                        // Check if already exists
                        bool exists = false;
                        foreach(var item in array)
                        {
                            if (item?.ToString() == cardName)
                            {
                                exists = true;
                                break;
                            }
                        }
                        
                        if (!exists)
                        {
                            array.Add(cardName);
                            var options = new System.Text.Json.JsonSerializerOptions { WriteIndented = true };
                            await System.IO.File.WriteAllTextAsync(configPath, root.ToJsonString(options));
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to save scraped card name: {ex.Message}");
        }
    }
}
