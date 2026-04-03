using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Article
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Title")]
    public string Title { get; set; } = null!;

    [BsonElement("Slug")]
    public string Slug { get; set; } = null!;

    [BsonElement("Excerpt")]
    public string Excerpt { get; set; } = null!;

    [BsonElement("Content")]
    public string Content { get; set; } = null!;

    [BsonElement("Category")]
    public string Category { get; set; } = null!;

    [BsonElement("Author")]
    public string Author { get; set; } = "Admin";

    [BsonElement("CoverImage")]
    public string CoverImage { get; set; } = null!;

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("UpdatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
