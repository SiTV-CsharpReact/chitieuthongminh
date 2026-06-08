using backend.Models;

namespace backend.ML;

public class TrainingInstance
{
    public Dictionary<string, string> Attributes { get; set; } = new();
    public string TargetClass { get; set; } = "";
}

public class TrainingDataGenerator
{
    // Generate a mock dataset. In a real system, this would come from historical application data.
    // Here we generate it synthetically based on the credit cards database.
    public static List<TrainingInstance> GenerateTrainingData(List<CreditCard> cards)
    {
        var dataset = new List<TrainingInstance>();
        
        foreach (var card in cards)
        {
            // If the card has a MinSalary, it restricts the IncomeLevel
            bool allowsLow = card.MinSalary <= 0 || card.MinSalary <= 5000000;
            bool allowsMedium = card.MinSalary <= 0 || card.MinSalary <= 15000000;
            bool allowsHigh = true;

            foreach(var rule in card.CashbackRules)
            {
                string standardCat = MapToStandardCategory(rule.Category);
                
                // If this is a high percentage rule (e.g. >= 5%), it's a good target for training
                if (rule.Percentage >= 5)
                {
                    if (allowsLow) dataset.Add(CreateInstance("Low", standardCat, card.Name));
                    if (allowsMedium) dataset.Add(CreateInstance("Medium", standardCat, card.Name));
                    if (allowsHigh) dataset.Add(CreateInstance("High", standardCat, card.Name));
                }
                // If it's a general card (1-4%) and rule applies to 'Tất cả'
                else if (standardCat == "Tất cả")
                {
                    if (allowsLow) dataset.Add(CreateInstance("Low", "Tất cả", card.Name));
                    if (allowsMedium) dataset.Add(CreateInstance("Medium", "Tất cả", card.Name));
                    if (allowsHigh) dataset.Add(CreateInstance("High", "Tất cả", card.Name));
                }
            }
        }
        
        return dataset;
    }
    
    private static TrainingInstance CreateInstance(string income, string category, string target)
    {
        return new TrainingInstance
        {
            Attributes = new Dictionary<string, string>
            {
                { "IncomeLevel", income },
                { "TopCategory", category }
            },
            TargetClass = target
        };
    }
    
    private static string MapToStandardCategory(string ruleCategory)
    {
        ruleCategory = ruleCategory.ToLower();
        if (ruleCategory.Contains("ăn uống") || ruleCategory.Contains("ẩm thực") || ruleCategory.Contains("food") || ruleCategory.Contains("dining")) return "Ăn uống";
        if (ruleCategory.Contains("siêu thị") || ruleCategory.Contains("siêu thị")) return "Siêu thị";
        if (ruleCategory.Contains("mua sắm") || ruleCategory.Contains("thời trang")) return "Mua sắm & Thời trang";
        if (ruleCategory.Contains("di chuyển") || ruleCategory.Contains("grab")) return "Di chuyển";
        if (ruleCategory.Contains("du lịch") || ruleCategory.Contains("bay") || ruleCategory.Contains("lưu trú")) return "Du lịch & Lưu trú";
        if (ruleCategory.Contains("thương mại") || ruleCategory.Contains("shopee")) return "Sàn thương mại điện tử";
        return "Tất cả";
    }
}
