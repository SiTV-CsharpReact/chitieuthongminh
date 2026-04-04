using backend.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace backend.Services;

public class PromotionService
{
    private readonly IMongoCollection<CardPromotion> _promotionsCollection;

    public PromotionService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _promotionsCollection = database.GetCollection<CardPromotion>("CardPromotions");
    }

    public async Task<List<CardPromotion>> GetAsync() =>
        await _promotionsCollection.Find(_ => true).ToListAsync();

    public async Task<CardPromotion?> GetAsync(string id) =>
        await _promotionsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(CardPromotion newPromotion) =>
        await _promotionsCollection.InsertOneAsync(newPromotion);

    public async Task UpdateAsync(string id, CardPromotion updatedPromotion) =>
        await _promotionsCollection.ReplaceOneAsync(x => x.Id == id, updatedPromotion);

    public async Task RemoveAsync(string id) =>
        await _promotionsCollection.DeleteOneAsync(x => x.Id == id);

    public async Task RemoveAllAsync() =>
        await _promotionsCollection.DeleteManyAsync(_ => true);
}
