using MongoDB.Driver;
using backend.Models;
using Microsoft.Extensions.Configuration;

namespace backend.Services;

public class MongoDBService
{
    private readonly IMongoCollection<SpendingData> _spendingCollection;

    public MongoDBService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _spendingCollection = database.GetCollection<SpendingData>("Spending");
    }

    public async Task<List<SpendingData>> GetAsync() =>
        await _spendingCollection.Find(_ => true).ToListAsync();

    public async Task CreateAsync(SpendingData newData) =>
        await _spendingCollection.InsertOneAsync(newData);
}
