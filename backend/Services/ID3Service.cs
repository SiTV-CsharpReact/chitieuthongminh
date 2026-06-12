using backend.Models;
using backend.ML;
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
        
        // Filter by minimum spend requirement
        decimal totalSpend = input.Spendings?.Sum(s => s.Amount) ?? 0;
        eligibleCards = eligibleCards
            .Where(c => c.MinSpendForCashback <= 0 || totalSpend >= c.MinSpendForCashback)
            .ToList();
        
        // Calculate cashback for all eligible cards
        var singleResults = eligibleCards
            .Select(c => CalculateCardCashback(c, input.Spendings))
            .OrderByDescending(r => r.TotalCashback)
            .ToList();

        // -------------------------------------------------------------
        // ML ID3 Algorithm Integration for Single Card Prediction
        // -------------------------------------------------------------
        // 1. Generate Training Data based on card rules
        var mlDataset = TrainingDataGenerator.GenerateTrainingData(allCards);
        
        // 2. Build Decision Tree
        var id3Engine = new ID3Engine();
        var availableAttributes = new List<string> { "IncomeLevel", "TopCategory" };
        var decisionTree = id3Engine.BuildTree(mlDataset, availableAttributes);

        // 3. Prepare user input for prediction
        string incomeLevel = input.Salary >= 30000000 ? "High" : input.Salary >= 10000000 ? "Medium" : "Low";
        string topCategoryStr = input.Spendings.OrderByDescending(s => s.Amount).FirstOrDefault()?.Category ?? "Tất cả";
        
        var predictionInput = new Dictionary<string, string>
        {
            { "IncomeLevel", incomeLevel },
            { "TopCategory", topCategoryStr }
        };

        // 4. Predict the best card using the ML Tree
        string predictedCardName = id3Engine.Predict(decisionTree, predictionInput);

        // 5. Single Cards List (we return top 12)
        var topSingleCards = singleResults.Take(12).ToList();

        // Save the true mathematical best cashback before reordering
        decimal mathematicalBestCashback = topSingleCards.FirstOrDefault()?.TotalCashback ?? 0;

        // Boost the ID3 Predicted Card to the top if it exists in the results
        var predictedResult = topSingleCards.FirstOrDefault(r => r.Card.Name == predictedCardName);
        if (predictedResult != null)
        {
            topSingleCards.Remove(predictedResult);
            topSingleCards.Insert(0, predictedResult);
        }
        else
        {
            // If it wasn't in top 12 but in the eligible list, pull it up
            var fallbackPredicted = singleResults.FirstOrDefault(r => r.Card.Name == predictedCardName);
            if (fallbackPredicted != null)
            {
                topSingleCards.Insert(0, fallbackPredicted);
                if (topSingleCards.Count > 12) topSingleCards.RemoveAt(topSingleCards.Count - 1);
            }
        }

        // 2. Find Best Combo
        var topCards = topSingleCards.Select(x => x.Card).ToList();
        var bestCombo = FindBestCombo(topCards, input.Spendings, mathematicalBestCashback);

        return new RecommendationResponse
        {
            SingleCards = topSingleCards,
            BestCombo = bestCombo
        };
    }

    private CardCashbackResult CalculateCardCashback(CreditCard card, List<CategorySpending> spendings)
    {
        decimal totalAllocated = spendings.Sum(s => s.Amount);
        if (card.MinSpendForCashback > 0 && totalAllocated < card.MinSpendForCashback)
        {
            return new CardCashbackResult
            {
                Card = card,
                TotalCashback = 0,
                Breakdown = spendings.Select(sc => new CardCashbackBreakdown { Category = sc.Category, Amount = sc.Amount, Cashback = 0, Rate = 0 }).ToList()
            };
        }

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
        
        // Invalidate combo if any card has 0 cashback (due to unmet min spend or no allocation)
        if (results.Any(r => r.TotalCashback == 0))
        {
            return new ComboResult { Cards = new List<ComboCardItem>(), TotalCashback = 0, Allocation = new List<CategoryAllocation>() };
        }

        decimal totalCashback = results.Sum(r => r.TotalCashback);

        var cardsWithCashback = comboCards.Select((c, idx) => new 
        { 
            OriginalIndex = idx, 
            Card = c, 
            Result = results[idx] 
        })
        .OrderByDescending(x => x.Result.TotalCashback)
        .ToList();

        var newIndexMapping = new Dictionary<int, int>();
        for(int i = 0; i < cardsWithCashback.Count; i++)
        {
            newIndexMapping[cardsWithCashback[i].OriginalIndex] = i;
        }

        var finalAllocation = allocation.Select(a => 
        {
            var entry = results[a.AssignedTo].Breakdown.FirstOrDefault(b => b.Category == a.Category);
            a.Cashback = entry?.Cashback ?? a.Cashback;
            a.AssignedTo = newIndexMapping[a.AssignedTo];
            return a;
        }).ToList();

        string[] COMBO_LABELS = { "Thẻ chính", "Thẻ phụ", "Thẻ bổ sung" };
        string[] COMBO_COLORS = { "#10b981", "#06b6d4", "#8b5cf6" };

        var comboResult = new ComboResult
        {
            Cards = cardsWithCashback.Select((c, idx) => new ComboCardItem 
            { 
                Card = c.Card, 
                Label = COMBO_LABELS[idx], 
                Cashback = c.Result.TotalCashback, 
                Color = COMBO_COLORS[idx] 
            }).ToList(),
            TotalCashback = totalCashback,
            Allocation = finalAllocation
        };

        return comboResult;
    }
}
