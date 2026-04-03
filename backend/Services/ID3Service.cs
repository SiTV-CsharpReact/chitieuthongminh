using backend.Models;
using System.Data;

namespace backend.Services;

public class ID3Service
{
    private readonly CreditCardService _creditCardService;

    public ID3Service(CreditCardService creditCardService)
    {
        _creditCardService = creditCardService;
    }

    public async Task<List<CreditCard>> RecommendCardsAsync(SpendingData input)
    {
        var allCards = await _creditCardService.GetAsync();
        
        // In a real ID3 implementation, we would build a tree based on historical successful matches.
        // Since we don't have a huge dataset, we'll use an optimized selection logic 
        // that mimics the "best fit" branch of a decision tree.
        
        return allCards
            .Select(card => new 
            { 
                Card = card, 
                Score = CalculateMatchScore(card, input) 
            })
            .OrderByDescending(x => x.Score)
            .Select(x => x.Card)
            .ToList();
    }

    private decimal CalculateMatchScore(CreditCard card, SpendingData input)
    {
        decimal score = 0;

        // Rule-based weights matching the ID3 feature importance
        foreach (var rule in card.CashbackRules)
        {
            if (string.IsNullOrEmpty(rule.Category) || string.IsNullOrEmpty(input.Category)) continue;

            // Flexible matching with synonyms
            string[] synonyms = { "Ăn uống", "Ẩm thực", "Nhà hàng", "Dining", "Food" };
            bool isDiningMatch = synonyms.Any(s => rule.Category.Contains(s, StringComparison.OrdinalIgnoreCase)) &&
                                synonyms.Any(s => input.Category.Contains(s, StringComparison.OrdinalIgnoreCase));

            bool isMatch = isDiningMatch || 
                          rule.Category.Equals(input.Category, StringComparison.OrdinalIgnoreCase) ||
                          input.Category.Contains(rule.Category, StringComparison.OrdinalIgnoreCase) ||
                          rule.Category.Contains(input.Category, StringComparison.OrdinalIgnoreCase);

            if (isMatch)
            {
                score += rule.Percentage * 10;
            }
            else if (rule.Category.Equals("All", StringComparison.OrdinalIgnoreCase) || 
                     rule.Category.Equals("Tất cả", StringComparison.OrdinalIgnoreCase))
            {
                score += rule.Percentage * 2;
            }
        }

        // Logic for income level and annual fee (Economic feasibility branch)
        if (input.IncomeLevel == "High" && card.AnnualFee > 1000000) score += 50;
        if (input.IncomeLevel == "Low" && card.AnnualFee == 0) score += 30;

        // Credit score branch
        if (input.CreditScoreRange == "Excellent") score += 20;

        return score;
    }
}
