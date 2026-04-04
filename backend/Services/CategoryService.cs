using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class CategoryService
{
    private readonly IMongoCollection<Category> _categoriesCollection;

    public CategoryService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseName"));
        _categoriesCollection = database.GetCollection<Category>("Categories");
    }

    public async Task<List<Category>> GetAsync() =>
        await _categoriesCollection.Find(_ => true).ToListAsync();

    public async Task<Category?> GetAsync(string id) =>
        await _categoriesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Category newCategory) =>
        await _categoriesCollection.InsertOneAsync(newCategory);

    public async Task UpdateAsync(string id, Category updatedCategory) =>
        await _categoriesCollection.ReplaceOneAsync(x => x.Id == id, updatedCategory);

    public async Task RemoveAsync(string id) =>
        await _categoriesCollection.DeleteOneAsync(x => x.Id == id);

    public async Task RemoveAllAsync() =>
        await _categoriesCollection.DeleteManyAsync(_ => true);

    public async Task SeedMccAsync()
    {
        var defaultCategories = new List<Category>
        {
            new Category { Name = "Ăn uống", Icon="restaurant", Color="#ef4444", IsFrequent=true, MccCodes = new List<string>{"5811", "5812", "5813", "5814"} },
            new Category { Name = "Siêu thị", Icon="shopping_cart", Color="#22c55e", IsFrequent=true, MccCodes = new List<string>{"5411", "5422", "5499", "5300"} },
            new Category { Name = "Du lịch", Icon="flight_takeoff", Color="#3b82f6", IsFrequent=false, MccCodes = new List<string>{"3000", "3001", "3005", "3007", "3008", "3010", "3350", "4511", "4722", "7011", "3501", "3502", "3503", "3504", "3509", "3512"} },
            new Category { Name = "Mua sắm", Icon="shopping_bag", Color="#a855f7", IsFrequent=false, MccCodes = new List<string>{"5311", "5611", "5621", "5631", "5641", "5651", "5661", "5691", "5941", "5942", "5999", "5945"} },
            new Category { Name = "Giao thông/Xăng", Icon="local_gas_station", Color="#f59e0b", IsFrequent=true, MccCodes = new List<string>{"5541", "5542", "4121", "4111", "4131", "4789"} },
            new Category { Name = "Giải trí", Icon="movie", Color="#ec4899", IsFrequent=false, MccCodes = new List<string>{"7832", "7922", "7999", "7997", "7941", "7991"} },
            new Category { Name = "Sức khỏe y tế", Icon="health_and_safety", Color="#14b8a6", IsFrequent=false, MccCodes = new List<string>{"8011", "8021", "8042", "8043", "8062", "8099", "5912"} },
            new Category { Name = "Hóa đơn/Tiện ích", Icon="bolt", Color="#eab308", IsFrequent=true, MccCodes = new List<string>{"4900", "4814", "4899", "4812"} },
            new Category { Name = "Giáo dục", Icon="school", Color="#6366f1", IsFrequent=false, MccCodes = new List<string>{"8211", "8220", "8241", "8244", "8249", "8299"} },
            new Category { Name = "Ô tô/Bảo dưỡng", Icon="directions_car", Color="#64748b", IsFrequent=false, MccCodes = new List<string>{"5533", "7531", "7534", "7538", "7542"} },
            new Category { Name = "Chăm sóc cá nhân", Icon="spa", Color="#f43f5e", IsFrequent=false, MccCodes = new List<string>{"7230", "7298", "7297"} },
            new Category { Name = "Dịch vụ kinh doanh", Icon="business_center", Color="#8b5cf6", IsFrequent=false, MccCodes = new List<string>{"7311", "7333", "7399", "8999", "7349", "7372"} }
        };

        foreach (var cat in defaultCategories)
        {
            var existingCat = await _categoriesCollection.Find(c => c.Name == cat.Name).FirstOrDefaultAsync();
            if (existingCat == null)
            {
                await _categoriesCollection.InsertOneAsync(cat);
            }
            else
            {
                var combinedMcc = existingCat.MccCodes ?? new List<string>();
                combinedMcc = combinedMcc.Union(cat.MccCodes).Distinct().ToList();

                var update = Builders<Category>.Update
                    .Set(c => c.Icon, cat.Icon)
                    .Set(c => c.Color, cat.Color)
                    .Set(c => c.IsFrequent, cat.IsFrequent)
                    .Set(c => c.MccCodes, combinedMcc);

                await _categoriesCollection.UpdateOneAsync(c => c.Id == existingCat.Id, update);
            }
        }
    }
}
