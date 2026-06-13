using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

[BsonIgnoreExtraElements]
public class PromoScraperDraft
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? CategoryTab { get; set; }
    public string? DiscountRate { get; set; }
    public string? ValidUntil { get; set; }
    public string? StartDate { get; set; }
    public string? SourceUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string BankName { get; set; } = null!;
    
    public List<string>? ApplicableCards { get; set; }
    
    // Draft specific fields
    public string Reason { get; set; } = "Phát hiện ưu đãi mới";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"
}
