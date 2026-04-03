using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class CreditCardService
{
    private readonly IMongoCollection<CreditCard> _cardsCollection;

    public CreditCardService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _cardsCollection = database.GetCollection<CreditCard>("CreditCards");
    }

    public async Task<List<CreditCard>> GetAsync() =>
        await _cardsCollection.Find(_ => true).ToListAsync();

    public async Task<CreditCard?> GetAsync(string id) =>
        await _cardsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(CreditCard newCard) =>
        await _cardsCollection.InsertOneAsync(newCard);

    public async Task UpdateAsync(string id, CreditCard updatedCard) =>
        await _cardsCollection.ReplaceOneAsync(x => x.Id == id, updatedCard);

    public async Task RemoveAsync(string id) =>
        await _cardsCollection.DeleteOneAsync(x => x.Id == id);

    public async Task RemoveAllAsync() =>
        await _cardsCollection.DeleteManyAsync(_ => true);
}
