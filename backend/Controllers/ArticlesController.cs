using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly ArticleService _articleService;

    public ArticlesController(ArticleService articleService)
    {
        _articleService = articleService;
    }

    [HttpGet]
    public async Task<List<Article>> Get() =>
        await _articleService.GetAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> Get(string id)
    {
        var article = await _articleService.GetAsync(id);
        if (article == null) return NotFound();
        return article;
    }

    [HttpPost]
    public async Task<IActionResult> Post(Article newArticle)
    {
        newArticle.CreatedAt = DateTime.UtcNow;
        newArticle.UpdatedAt = DateTime.UtcNow;
        await _articleService.CreateAsync(newArticle);
        return CreatedAtAction(nameof(Get), new { id = newArticle.Id }, newArticle);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Article updatedArticle)
    {
        var article = await _articleService.GetAsync(id);
        if (article == null) return NotFound();

        updatedArticle.Id = article.Id;
        updatedArticle.CreatedAt = article.CreatedAt;
        updatedArticle.UpdatedAt = DateTime.UtcNow;

        await _articleService.UpdateAsync(id, updatedArticle);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var article = await _articleService.GetAsync(id);
        if (article == null) return NotFound();

        await _articleService.RemoveAsync(id);
        return NoContent();
    }
}
