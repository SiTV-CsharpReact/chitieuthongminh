using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreditCardsController : ControllerBase
{
    private readonly CreditCardService _creditCardService;

    public CreditCardsController(CreditCardService creditCardService)
    {
        _creditCardService = creditCardService;
    }

    [HttpGet]
    public async Task<List<CreditCard>> Get() =>
        await _creditCardService.GetAsync();

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<CreditCard>> Get(string id)
    {
        var card = await _creditCardService.GetAsync(id);

        if (card is null)
        {
            return NotFound();
        }

        return card;
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreditCard newCard)
    {
        await _creditCardService.CreateAsync(newCard);

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
}
