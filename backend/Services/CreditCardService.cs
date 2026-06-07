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

    public async Task<CreditCard?> GetBySlugAsync(string slug)
    {
        var allCards = await GetAsync();
        return allCards.FirstOrDefault(c => GenerateSlug(c.Name) == slug);
    }

    private string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "";
        
        var cleanName = System.Text.RegularExpressions.Regex.Replace(name, @"^(thẻ tín dụng|Thẻ tín dụng)\s+", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
        
        string str = cleanName.ToLower();
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[áàảạãăắằẳẵặâấầẩẫậ]", "a");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[éèẻẽẹêếềểễệ]", "e");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[iíìỉĩị]", "i");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[úùủũụưứừửữự]", "u");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[ýỳỷỹỵ]", "y");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"đ", "d");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[^a-z0-9\-]", "-");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"\-+", "-");
        str = str.Trim('-');
        return str;
    }
}
