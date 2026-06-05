using System.Collections.Generic;

namespace backend.Models;

public class CategorySpending
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class RecommendationRequest
{
    public decimal Salary { get; set; }
    public string? IncomeLevel { get; set; }
    public string? CreditScoreRange { get; set; }
    public List<CategorySpending> Spendings { get; set; } = new();
}

public class CardCashbackBreakdown
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Cashback { get; set; }
    public decimal Rate { get; set; }
}

public class CardCashbackResult
{
    public CreditCard Card { get; set; } = null!;
    public decimal TotalCashback { get; set; }
    public List<CardCashbackBreakdown> Breakdown { get; set; } = new();
}

public class ComboCardItem
{
    public CreditCard Card { get; set; } = null!;
    public string Label { get; set; } = string.Empty;
    public decimal Cashback { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class CategoryAllocation
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int AssignedTo { get; set; } // Index of the card in the ComboResult.Cards array
    public decimal Cashback { get; set; }
    public decimal Rate { get; set; }
}

public class ComboResult
{
    public List<ComboCardItem> Cards { get; set; } = new();
    public decimal TotalCashback { get; set; }
    public decimal SavingsVsSingle { get; set; }
    public decimal SavingsPercent { get; set; }
    public List<CategoryAllocation> Allocation { get; set; } = new();
}

public class RecommendationResponse
{
    public List<CardCashbackResult> SingleCards { get; set; } = new();
    public ComboResult? BestCombo { get; set; }
}
