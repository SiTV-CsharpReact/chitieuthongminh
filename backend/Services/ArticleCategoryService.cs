using backend.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace backend.Services;

public class ArticleCategoryService
{
    private readonly IMongoCollection<ArticleCategory> _categoriesCollection;

    public ArticleCategoryService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _categoriesCollection = database.GetCollection<ArticleCategory>("ArticleCategories");
    }

    public async Task<List<ArticleCategory>> GetAsync() =>
        await _categoriesCollection.Find(_ => true).ToListAsync();

    public async Task<ArticleCategory?> GetAsync(string id) =>
        await _categoriesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(ArticleCategory newCategory) =>
        await _categoriesCollection.InsertOneAsync(newCategory);

    public async Task UpdateAsync(string id, ArticleCategory updatedCategory) =>
        await _categoriesCollection.ReplaceOneAsync(x => x.Id == id, updatedCategory);

    public async Task RemoveAsync(string id) =>
        await _categoriesCollection.DeleteOneAsync(x => x.Id == id);
}
