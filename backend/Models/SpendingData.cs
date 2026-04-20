using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class SpendingData
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string? UserId { get; set; }
    public decimal Amount { get; set; }
    public decimal Salary { get; set; } // Lương hàng tháng của user
    public string? Category { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    
    // Attributes for ID3 classification (Example)
    public string? IncomeLevel { get; set; } // Low, Medium, High
    public string? SpendingHabit { get; set; } // Frugal, Moderate, Extravagant
    public string? CreditScoreRange { get; set; } // Poor, Fair, Good, Excellent
    
    // Target variable for recommendation
    public string? RecommendedCardType { get; set; }
}
