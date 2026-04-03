using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class ArticleService
{
    private readonly IMongoCollection<Article> _articlesCollection;

    public ArticleService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _articlesCollection = database.GetCollection<Article>("Articles");
    }

    public async Task<List<Article>> GetAsync() =>
        await _articlesCollection.Find(_ => true).SortByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<Article?> GetAsync(string id) =>
        await _articlesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Article newArticle) =>
        await _articlesCollection.InsertOneAsync(newArticle);

    public async Task UpdateAsync(string id, Article updatedArticle) =>
        await _articlesCollection.ReplaceOneAsync(x => x.Id == id, updatedArticle);

    public async Task RemoveAsync(string id) =>
        await _articlesCollection.DeleteOneAsync(x => x.Id == id);
}
