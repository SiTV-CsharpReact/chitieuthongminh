using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class CardPromotion
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Title")]
    public string Title { get; set; } = null!;

    [BsonElement("Description")]
    public string? Description { get; set; }

    [BsonElement("ImageUrl")]
    public string? ImageUrl { get; set; }

    [BsonElement("DiscountRate")]
    public string? DiscountRate { get; set; }

    [BsonElement("CategoryTab")]
    public string? CategoryTab { get; set; } // e.g., "Ẩm thực", "Mua sắm"

    [BsonElement("SourceUrl")]
    public string? SourceUrl { get; set; }

    [BsonElement("StartDate")]
    public string? StartDate { get; set; }

    [BsonElement("ValidUntil")]
    public string? ValidUntil { get; set; }

    [BsonElement("ApplicableCards")]
    public List<string> ApplicableCards { get; set; } = new List<string>();

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("UpdatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
