using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class SystemSettings
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public bool IsAutoScraperEnabled { get; set; } = false;
    public int AutoScraperIntervalHours { get; set; } = 168; // 7 days by default
    public DateTime? LastAutoScrapeTime { get; set; }

    public bool IsPromoScraperEnabled { get; set; } = false;
    public int PromoScraperIntervalHours { get; set; } = 168; // 7 days by default
    public DateTime? LastPromoScrapeTime { get; set; }

    public DateTime? LastReminderRunTime { get; set; }
    public int LastReminderUsersProcessed { get; set; } = 0;
    public int LastReminderCardsProcessed { get; set; } = 0;
    public int LastReminderNotificationsSent { get; set; } = 0;

    public int ReminderDaysBefore { get; set; } = 3;
    public int ReminderRunHour { get; set; } = 23; // Chạy lúc 23:00 (11 PM)

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
