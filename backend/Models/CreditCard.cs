using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

[BsonIgnoreExtraElements]
public class CreditCard
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
    
    public decimal MinSalary { get; set; } // Lương tối thiểu (VNĐ). 0 = không yêu cầu
    public string? Requirement { get; set; } // Yêu cầu mở thẻ (Text dài)
    public string? WelcomeOffer { get; set; } // Quà chào mừng mở thẻ
    public string? Status { get; set; } = "Active"; // Trạng thái thẻ (Active / Discontinued)
    
    public decimal? MaxCashbackPerMonth { get; set; } // Số tiền hoàn tối đa mỗi tháng (VNĐ)
    
    public string? Description { get; set; }
    public List<string> Benefits { get; set; } = new();
    public List<string> Pros { get; set; } = new();
    public List<string> Cons { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public string? CreditLimit { get; set; }
    public string? InterestRate { get; set; }
    public string? TermsPdfUrl { get; set; }
}

public class CashbackRule
{
    public string Category { get; set; } = null!; // e.g., "Dining", "Groceries", "All"
    public decimal Percentage { get; set; } // e.g., 5.0 for 5%
    public decimal? CapAmount { get; set; } // Monthly/Quarterly cap if applicable
}
