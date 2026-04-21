using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticleCategoriesController : ControllerBase
{
    private readonly ArticleCategoryService _categoriesService;

    public ArticleCategoriesController(ArticleCategoryService categoriesService)
    {
        _categoriesService = categoriesService;
    }

    [HttpGet]
    public async Task<List<ArticleCategory>> Get() =>
        await _categoriesService.GetAsync();

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown()
    {
        var categories = await _categoriesService.GetAsync();
        var dropdownData = categories.Select(c => new
        {
            id = c.Id,
            cateValue = c.Name,
            cateName = c.Name,
            cateColor = c.Color
        });
        return Ok(dropdownData);
    }

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<ArticleCategory>> Get(string id)
    {
        var category = await _categoriesService.GetAsync(id);

        if (category is null)
        {
            return NotFound();
        }

        return category;
    }

    [HttpPost]
    public async Task<IActionResult> Post(ArticleCategory newCategory)
    {
        newCategory.CreatedAt = DateTime.UtcNow;
        newCategory.UpdatedAt = DateTime.UtcNow;
        await _categoriesService.CreateAsync(newCategory);

        return CreatedAtAction(nameof(Get), new { id = newCategory.Id }, newCategory);
    }

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, ArticleCategory updatedCategory)
    {
        var category = await _categoriesService.GetAsync(id);

        if (category is null)
        {
            return NotFound();
        }

        updatedCategory.Id = category.Id;
        updatedCategory.CreatedAt = category.CreatedAt;
        updatedCategory.UpdatedAt = DateTime.UtcNow;

        await _categoriesService.UpdateAsync(id, updatedCategory);

        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        var category = await _categoriesService.GetAsync(id);

        if (category is null)
        {
            return NotFound();
        }

        await _categoriesService.RemoveAsync(id);

        return NoContent();
    }
}
