using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class ArticleCategory
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Name")]
    public string Name { get; set; } = null!;

    [BsonElement("Slug")]
    public string Slug { get; set; } = null!;

    [BsonElement("Description")]
    public string? Description { get; set; }

    [BsonElement("Color")]
    public string Color { get; set; } = "#3b82f6"; // Default blue

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("UpdatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
