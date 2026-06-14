using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Email")]
    public string Email { get; set; } = null!;

    [BsonElement("PasswordHash")]
    public string? PasswordHash { get; set; }

    [BsonElement("Name")]
    public string Name { get; set; } = null!;

    [BsonElement("Avatar")]
    public string? Avatar { get; set; }

    [BsonElement("Role")]
    public string Role { get; set; } = "Admin";

    [BsonElement("Provider")]
    public string Provider { get; set; } = "Local";

    [BsonElement("ProviderId")]
    public string? ProviderId { get; set; }

    [BsonElement("SavedCardIds")]
    public List<string> SavedCardIds { get; set; } = new();

    [BsonElement("CardIssueDates")]
    public Dictionary<string, DateTime> CardIssueDates { get; set; } = new();

    [BsonElement("CardDetails")]
    public Dictionary<string, UserCardDetail> CardDetails { get; set; } = new();

    [BsonElement("IsBlocked")]
    public bool IsBlocked { get; set; } = false;

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UserCardDetail
{
    public DateTime? IssueDate { get; set; }
    public int? StatementDate { get; set; }
    public int? DueDate { get; set; }
    public DateTime? LastRemindedAt { get; set; }
}
