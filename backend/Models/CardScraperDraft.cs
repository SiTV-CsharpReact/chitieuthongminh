using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace backend.Models;

[BsonIgnoreExtraElements]
public class CardScraperDraft
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Title { get; set; } = null!;
    public string? BankName { get; set; }
    public string? ImageUrl { get; set; }
    public string? SourceUrl { get; set; }
    public string? TermsPdfUrl { get; set; }
    
    // Extracted details (optional heuristics)
    public string? Requirement { get; set; }
    public string? WelcomeOffer { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // Pending, Imported, Ignored
}
