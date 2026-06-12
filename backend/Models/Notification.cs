using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("UserId")]
    public string UserId { get; set; } = null!; // "ALL" if sent to everyone

    [BsonElement("Title")]
    public string Title { get; set; } = null!;

    [BsonElement("Message")]
    public string Message { get; set; } = null!;

    [BsonElement("Link")]
    public string? Link { get; set; }

    [BsonElement("IsRead")]
    public bool IsRead { get; set; } = false;

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
