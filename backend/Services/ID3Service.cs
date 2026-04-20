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
        
        // ID3 Decision Branch 1: Filter by salary requirement
        // If user provided salary, exclude cards they can't qualify for
        var eligibleCards = allCards;
        if (input.Salary > 0)
        {
            eligibleCards = allCards
                .Where(c => c.MinSalary <= 0 || c.MinSalary <= input.Salary)
                .ToList();
        }
        
        // ID3 Decision Branch 2: Score & rank remaining cards
        return eligibleCards
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

        // Feature 1: Category matching (highest weight in ID3 tree)
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

        // Feature 2: Salary bracket matching (new ID3 branch)
        if (input.Salary > 0 && card.MinSalary > 0)
        {
            decimal salaryRatio = input.Salary / card.MinSalary;
            
            if (salaryRatio >= 1.0m && salaryRatio <= 1.5m)
            {
                // Perfect match: user salary is close to requirement
                score += 40;
            }
            else if (salaryRatio > 1.5m && salaryRatio <= 3.0m)
            {
                // Over-qualified but still relevant
                score += 20;
            }
            else if (salaryRatio > 3.0m)
            {
                // Way over-qualified, card might be too basic
                score += 5;
            }
        }
        else if (card.MinSalary == 0)
        {
            // No salary requirement = accessible to all
            score += 10;
        }

        // Feature 3: Income level vs annual fee (Economic feasibility branch)
        if (input.IncomeLevel == "High" && card.AnnualFee > 1000000) score += 50;
        if (input.IncomeLevel == "Low" && card.AnnualFee == 0) score += 30;

        // Feature 4: Credit score branch
        if (input.CreditScoreRange == "Excellent") score += 20;

        return score;
    }
}
