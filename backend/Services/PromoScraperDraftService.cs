using backend.Models;
using MongoDB.Driver;

namespace backend.Services;

public class PromoScraperDraftService
{
    private readonly IMongoCollection<PromoScraperDraft> _draftsCollection;

    public PromoScraperDraftService(IMongoClient mongoClient, IConfiguration config)
    {
        var database = mongoClient.GetDatabase(config.GetValue<string>("DatabaseName") ?? "ChiTieuThongMinh");
        _draftsCollection = database.GetCollection<PromoScraperDraft>("PromoScraperDrafts");
    }

    public async Task<List<PromoScraperDraft>> GetAsync() =>
        await _draftsCollection.Find(_ => true).ToListAsync();

    public async Task<PromoScraperDraft?> GetAsync(string id) =>
        await _draftsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task UpdateAsync(string id, PromoScraperDraft updatedDraft) =>
        await _draftsCollection.ReplaceOneAsync(x => x.Id == id, updatedDraft);

    public async Task DeleteAsync(string id) =>
        await _draftsCollection.DeleteOneAsync(x => x.Id == id);

    public async Task DeleteAllPendingAsync() =>
        await _draftsCollection.DeleteManyAsync(x => x.Status == "Pending" || x.Status == null || x.Status == "");

    public async Task DeleteAllHistoryAsync() =>
        await _draftsCollection.DeleteManyAsync(x => x.Status == "Approved" || x.Status == "Rejected");
}
