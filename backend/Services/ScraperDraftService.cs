using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class ScraperDraftService
{
    private readonly IMongoCollection<ScraperDraft> _draftsCollection;

    public ScraperDraftService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _draftsCollection = database.GetCollection<ScraperDraft>("ScraperDrafts");
    }

    public async Task<List<ScraperDraft>> GetAsync() =>
        await _draftsCollection.Find(_ => true).ToListAsync();

    public async Task<ScraperDraft?> GetAsync(string id) =>
        await _draftsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(ScraperDraft newDraft) =>
        await _draftsCollection.InsertOneAsync(newDraft);

    public async Task UpdateAsync(string id, ScraperDraft updatedDraft) =>
        await _draftsCollection.ReplaceOneAsync(x => x.Id == id, updatedDraft);

    public async Task RemoveAsync(string id) =>
        await _draftsCollection.DeleteOneAsync(x => x.Id == id);
}
