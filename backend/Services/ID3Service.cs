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

    public async Task<RecommendationResponse> RecommendCardsAsync(RecommendationRequest input)
    {
        var allCards = await _creditCardService.GetAsync();
        
        // ID3 Decision Branch 1: Filter by salary requirement
        var eligibleCards = allCards;
        if (input.Salary > 0)
        {
            eligibleCards = allCards
                .Where(c => c.MinSalary <= 0 || c.MinSalary <= input.Salary)
                .ToList();
        }
        
        // Calculate cashback for all eligible cards
        var singleResults = eligibleCards
            .Select(c => CalculateCardCashback(c, input.Spendings))
            .OrderByDescending(r => r.TotalCashback)
            .ToList();

        // 1. Single Cards List (we return top 12)
        var topSingleCards = singleResults.Take(12).ToList();

        // 2. Find Best Combo
        var topCards = topSingleCards.Select(x => x.Card).ToList();
        var bestCombo = FindBestCombo(topCards, input.Spendings, topSingleCards.FirstOrDefault()?.TotalCashback ?? 0);

        return new RecommendationResponse
        {
            SingleCards = topSingleCards,
            BestCombo = bestCombo
        };
    }

    private CardCashbackResult CalculateCardCashback(CreditCard card, List<CategorySpending> spendings)
    {
        decimal runningTotal = 0;
        var breakdown = new List<CardCashbackBreakdown>();

        foreach (var sc in spendings)
        {
            var rule = FindMatchingRule(card.CashbackRules, sc.Category);
            if (rule == null || rule.Percentage <= 0)
            {
                breakdown.Add(new CardCashbackBreakdown { Category = sc.Category, Amount = sc.Amount, Cashback = 0, Rate = 0 });
                continue;
            }

            decimal cashback = (sc.Amount * rule.Percentage) / 100m;
            
            // Apply per-rule cap
            if (rule.CapAmount > 0 && cashback > rule.CapAmount.Value)
            {
                cashback = rule.CapAmount.Value;
            }

            breakdown.Add(new CardCashbackBreakdown { Category = sc.Category, Amount = sc.Amount, Cashback = cashback, Rate = rule.Percentage });
            runningTotal += cashback;
        }

        // Apply monthly cap
        if (card.MaxCashbackPerMonth > 0 && runningTotal > card.MaxCashbackPerMonth.Value)
        {
            decimal ratio = card.MaxCashbackPerMonth.Value / runningTotal;
            foreach (var b in breakdown)
            {
                b.Cashback = Math.Round(b.Cashback * ratio);
            }
            runningTotal = card.MaxCashbackPerMonth.Value;
        }

        return new CardCashbackResult
        {
            Card = card,
            TotalCashback = Math.Round(runningTotal),
            Breakdown = breakdown
        };
    }

    private CashbackRule? FindMatchingRule(List<CashbackRule> rules, string category)
    {
        if (rules == null || !rules.Any() || string.IsNullOrEmpty(category)) return null;

        var exactRule = rules.FirstOrDefault(r => string.Equals(r.Category, category, StringComparison.OrdinalIgnoreCase));
        if (exactRule != null) return exactRule;

        string[] synonyms = { "Ăn uống", "Ẩm thực", "Nhà hàng", "Dining", "Food" };
        if (synonyms.Any(s => category.Contains(s, StringComparison.OrdinalIgnoreCase)))
        {
            var diningRule = rules.FirstOrDefault(r => synonyms.Any(s => r.Category.Contains(s, StringComparison.OrdinalIgnoreCase)));
            if (diningRule != null) return diningRule;
        }

        var partialRule = rules.FirstOrDefault(r => 
            category.Contains(r.Category, StringComparison.OrdinalIgnoreCase) || 
            r.Category.Contains(category, StringComparison.OrdinalIgnoreCase));
        if (partialRule != null) return partialRule;

        return rules.FirstOrDefault(r => r.Category.Equals("All", StringComparison.OrdinalIgnoreCase) || r.Category.Equals("Tất cả", StringComparison.OrdinalIgnoreCase));
    }

    private ComboResult? FindBestCombo(List<CreditCard> topCards, List<CategorySpending> spendings, decimal bestSingleCashback)
    {
        if (topCards.Count < 2 || spendings.Count < 2) return null;

        ComboResult? bestCombo = null;

        // Try 2-card combos
        for (int i = 0; i < topCards.Count; i++)
        {
            for (int j = i + 1; j < topCards.Count; j++)
            {
                if (topCards[i].BankName == topCards[j].BankName) continue;
                var combo = new List<CreditCard> { topCards[i], topCards[j] };
                var result = EvaluateCombo(combo, spendings);
                var savings = result.TotalCashback - bestSingleCashback;
                var savingsPercent = bestSingleCashback > 0 ? (savings / bestSingleCashback) * 100 : 0;

                if (savings > 0 && (bestCombo == null || result.TotalCashback > bestCombo.TotalCashback))
                {
                    result.SavingsVsSingle = savings;
                    result.SavingsPercent = savingsPercent;
                    bestCombo = result;
                }
            }
        }

        // Try 3-card combos
        if (spendings.Count >= 3)
        {
            var top8 = topCards.Take(8).ToList();
            for (int i = 0; i < top8.Count; i++)
            {
                for (int j = i + 1; j < top8.Count; j++)
                {
                    if (top8[i].BankName == top8[j].BankName) continue;
                    for (int k = j + 1; k < top8.Count; k++)
                    {
                        if (top8[k].BankName == top8[i].BankName || top8[k].BankName == top8[j].BankName) continue;
                        
                        var combo = new List<CreditCard> { top8[i], top8[j], top8[k] };
                        var result = EvaluateCombo(combo, spendings);
                        var savings = result.TotalCashback - bestSingleCashback;
                        var savingsPercent = bestSingleCashback > 0 ? (savings / bestSingleCashback) * 100 : 0;

                        if (savings > 0 && (bestCombo == null || result.TotalCashback > bestCombo.TotalCashback))
                        {
                            result.SavingsVsSingle = savings;
                            result.SavingsPercent = savingsPercent;
                            bestCombo = result;
                        }
                    }
                }
            }
        }

        if (bestCombo != null && bestCombo.SavingsPercent >= 10)
        {
            return bestCombo;
        }

        return null;
    }

    private ComboResult EvaluateCombo(List<CreditCard> comboCards, List<CategorySpending> spendings)
    {
        var cardSpendings = comboCards.Select(_ => new List<CategorySpending>()).ToList();
        var allocation = new List<CategoryAllocation>();

        foreach (var sc in spendings)
        {
            int bestIdx = 0;
            decimal bestEffective = 0;
            decimal bestRate = 0;

            for (int k = 0; k < comboCards.Count; k++)
            {
                var rule = FindMatchingRule(comboCards[k].CashbackRules, sc.Category);
                if (rule == null) continue;

                decimal raw = (sc.Amount * rule.Percentage) / 100m;
                decimal effective = rule.CapAmount > 0 ? Math.Min(raw, rule.CapAmount.Value) : raw;

                if (effective > bestEffective)
                {
                    bestEffective = effective;
                    bestIdx = k;
                    bestRate = rule.Percentage;
                }
            }

            cardSpendings[bestIdx].Add(sc);
            allocation.Add(new CategoryAllocation { Category = sc.Category, Amount = sc.Amount, AssignedTo = bestIdx, Cashback = bestEffective, Rate = bestRate });
        }

        var results = comboCards.Select((c, i) => CalculateCardCashback(c, cardSpendings[i])).ToList();
        decimal totalCashback = results.Sum(r => r.TotalCashback);

        var finalAllocation = allocation.Select(a => 
        {
            var entry = results[a.AssignedTo].Breakdown.FirstOrDefault(b => b.Category == a.Category);
            a.Cashback = entry?.Cashback ?? a.Cashback;
            return a;
        }).ToList();

        string[] COMBO_LABELS = { "Thẻ chính", "Thẻ phụ", "Thẻ bổ sung" };
        string[] COMBO_COLORS = { "#10b981", "#06b6d4", "#8b5cf6" };

        var comboResult = new ComboResult
        {
            Cards = comboCards.Select((c, idx) => new ComboCardItem 
            { 
                Card = c, 
                Label = COMBO_LABELS[idx], 
                Cashback = results[idx].TotalCashback, 
                Color = COMBO_COLORS[idx] 
            }).ToList(),
            TotalCashback = totalCashback,
            Allocation = finalAllocation
        };

        return comboResult;
    }
}
