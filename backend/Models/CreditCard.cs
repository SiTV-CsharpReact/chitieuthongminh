using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

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
    
    public string? Description { get; set; }
    public List<string> Benefits { get; set; } = new();
}

public class CashbackRule
{
    public string Category { get; set; } = null!; // e.g., "Dining", "Groceries", "All"
    public decimal Percentage { get; set; } // e.g., 5.0 for 5%
    public decimal? CapAmount { get; set; } // Monthly/Quarterly cap if applicable
}
