using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

[BsonIgnoreExtraElements]
public class ScraperDraft
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = null!;
    public string Bank { get; set; } = null!;
    public string BankName { get; set; } = null!;
    public string? BankLogo { get; set; }
    public string? ImageUrl { get; set; }
    public string? Link { get; set; }
    public string? RegisterUrl { get; set; }
    public decimal AnnualFee { get; set; }
    
    public List<CashbackRule> CashbackRules { get; set; } = new();
    
    public decimal MinSalary { get; set; }
    public string? Requirement { get; set; }
    public string? WelcomeOffer { get; set; }
    
    public decimal? MaxCashbackPerMonth { get; set; }
    public decimal MinSpendForCashback { get; set; }
    
    public string? Description { get; set; }
    public List<string> Benefits { get; set; } = new();
    public List<string> Pros { get; set; } = new();
    public List<string> Cons { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public string? CreditLimit { get; set; }
    public string? InterestRate { get; set; }
    public string? TermsPdfUrl { get; set; }
    public CardRatings? Ratings { get; set; }

    // Draft specific fields
    public string Reason { get; set; } = "Phát hiện thẻ mới"; // Or "Cập nhật phí"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ExistingCardId { get; set; } // If this is an update to an existing card
    public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"
}
