using backend.Models;
using MongoDB.Driver;

namespace backend.Services;

public class SystemSettingsService
{
    private readonly IMongoCollection<SystemSettings> _settingsCollection;

    public SystemSettingsService(IMongoClient mongoClient, IConfiguration config)
    {
        var database = mongoClient.GetDatabase(config.GetValue<string>("DatabaseName") ?? "ChiTieuThongMinh");
        _settingsCollection = database.GetCollection<SystemSettings>("SystemSettings");
    }

    public async Task<SystemSettings> GetSettingsAsync()
    {
        var settings = await _settingsCollection.Find(_ => true).FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SystemSettings();
            await _settingsCollection.InsertOneAsync(settings);
        }
        return settings;
    }

    public async Task UpdateSettingsAsync(SystemSettings updatedSettings)
    {
        var existing = await GetSettingsAsync();
        updatedSettings.Id = existing.Id;
        updatedSettings.UpdatedAt = DateTime.UtcNow;
        
        // Preserve last scrape times if they are not explicitly updated
        // Note: typically we update from UI, which doesn't send LastScrapeTime easily if we just bind. 
        // We will make sure the controller merges it properly.
        await _settingsCollection.ReplaceOneAsync(x => x.Id == existing.Id, updatedSettings);
    }
}
