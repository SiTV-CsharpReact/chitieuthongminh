using backend.Models;
using System.Text.RegularExpressions;

namespace backend.Services;

public class ChatMessage
{
    public string Role { get; set; } = "user"; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
}

public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
    public List<ChatMessage> History { get; set; } = new();
}

public class ChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public string Intent { get; set; } = string.Empty;
    public List<CreditCard>? SuggestedCards { get; set; }
    public List<string>? QuickReplies { get; set; }
}

public class ChatService
{
    private readonly CreditCardService _creditCardService;
    private readonly CategoryService _categoryService;

    public ChatService(CreditCardService creditCardService, CategoryService categoryService)
    {
        _creditCardService = creditCardService;
        _categoryService = categoryService;
    }

    public async Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        var message = request.Message.ToLower().Trim();
        var allCards = await _creditCardService.GetAsync();

        // Intent detection
        var intent = DetectIntent(message);

        return intent switch
        {
            "greeting" => HandleGreeting(),
            "recommend" => await HandleRecommendation(message, allCards),
            "compare" => HandleCompare(message, allCards),
            "card_info" => HandleCardInfo(message, allCards),
            "bank_search" => HandleBankSearch(message, allCards),
            "cashback" => HandleCashback(message, allCards),
            "salary" => HandleSalary(message, allCards),
            "annual_fee" => HandleAnnualFee(message, allCards),
            "top_cards" => HandleTopCards(allCards),
            "count" => HandleCount(allCards),
            "help" => HandleHelp(),
            _ => HandleFallback(message, allCards),
        };
    }

    private string DetectIntent(string message)
    {
        // Greeting
        if (Regex.IsMatch(message, @"^(xin chào|xin chao|chào|chao|hello|hi|hey|ê|alo)\b"))
            return "greeting";

        // Recommendation
        if (Regex.IsMatch(message, @"(gợi ý|đề xuất|recommend|tư vấn|nên dùng|thẻ nào|phù hợp|cho tôi|giúp tôi chọn|thẻ tốt)"))
            return "recommend";

        // Compare
        if (Regex.IsMatch(message, @"(so sánh|compare|khác nhau|vs|versus|giữa.*và)"))
            return "compare";

        // Card info
        if (Regex.IsMatch(message, @"(thông tin|chi tiết|info|details|về thẻ|card info)"))
            return "card_info";

        // Bank search
        if (Regex.IsMatch(message, @"(ngân hàng|bank|vib|hsbc|techcombank|vpbank|acb|bidv|mb|sacombank|tpbank|ocb|shinhan|eximbank|hdbank|vietcombank|uob|msb|standard chartered)"))
            return "bank_search";

        // Cashback
        if (Regex.IsMatch(message, @"(hoàn tiền|cashback|hoàn|tích điểm|điểm thưởng|ưu đãi|percent|%)"))
            return "cashback";

        // Salary
        if (Regex.IsMatch(message, @"(lương|salary|thu nhập|income|triệu.*tháng|tr\/tháng)"))
            return "salary";

        // Annual fee
        if (Regex.IsMatch(message, @"(phí|annual fee|thường niên|miễn phí|free|phi thuong nien)"))
            return "annual_fee";

        // Top cards
        if (Regex.IsMatch(message, @"(top|tốt nhất|best|xếp hạng|ranking|nhiều nhất)"))
            return "top_cards";

        // Count
        if (Regex.IsMatch(message, @"(bao nhiêu|có mấy|số lượng|count|total|tổng)"))
            return "count";

        // Help
        if (Regex.IsMatch(message, @"(help|trợ giúp|hướng dẫn|làm gì|biết gì|có thể)"))
            return "help";

        return "unknown";
    }

    private ChatResponse HandleGreeting()
    {
        var greetings = new[]
        {
            "Xin chào! 👋 Tôi là **Trợ lý Tài chính AI** của Chi Tiêu Thông Minh. Tôi có thể giúp bạn:\n\n• 💳 Tư vấn chọn thẻ tín dụng phù hợp\n• 📊 So sánh các thẻ với nhau\n• 💰 Tìm thẻ hoàn tiền cao nhất\n• 🏦 Tra cứu thẻ theo ngân hàng\n\nBạn cần tôi hỗ trợ gì?",
            "Chào bạn! 🌟 Tôi là AI tư vấn thẻ tín dụng. Hãy cho tôi biết nhu cầu của bạn, tôi sẽ giúp bạn tìm chiếc thẻ hoàn hảo nhất! 💳",
        };
        return new ChatResponse
        {
            Reply = greetings[Random.Shared.Next(greetings.Length)],
            Intent = "greeting",
            QuickReplies = new List<string>
            {
                "Thẻ hoàn tiền cao nhất?",
                "Tư vấn thẻ cho lương 15 triệu",
                "Thẻ miễn phí thường niên",
                "So sánh thẻ VIB và HSBC"
            }
        };
    }

    private async Task<ChatResponse> HandleRecommendation(string message, List<CreditCard> allCards)
    {
        // Try to extract salary from message
        var salaryMatch = Regex.Match(message, @"(\d+)\s*(triệu|tr|m)");
        decimal salary = 0;
        if (salaryMatch.Success)
        {
            salary = decimal.Parse(salaryMatch.Groups[1].Value) * 1_000_000;
        }

        // Try to extract category
        string? category = null;
        var categoryKeywords = new Dictionary<string, string[]>
        {
            { "Ăn uống", new[] { "ăn", "uống", "nhà hàng", "food", "dining", "ẩm thực", "quán" } },
            { "Mua sắm", new[] { "mua sắm", "shopping", "mua", "shop" } },
            { "Du lịch", new[] { "du lịch", "travel", "bay", "khách sạn", "hotel" } },
            { "Xăng dầu", new[] { "xăng", "dầu", "fuel", "gas", "petrol" } },
            { "Online", new[] { "online", "trực tuyến", "internet", "web" } },
            { "Giáo dục", new[] { "giáo dục", "học", "education", "trường" } },
        };

        foreach (var kvp in categoryKeywords)
        {
            if (kvp.Value.Any(k => message.Contains(k)))
            {
                category = kvp.Key;
                break;
            }
        }

        var filtered = allCards.AsEnumerable();

        if (salary > 0)
        {
            filtered = filtered.Where(c => c.MinSalary <= 0 || c.MinSalary <= salary);
        }

        // Score cards
        var scored = filtered.Select(c =>
        {
            decimal score = 0;
            if (category != null)
            {
                foreach (var rule in c.CashbackRules)
                {
                    if (rule.Category.Contains(category, StringComparison.OrdinalIgnoreCase))
                        score += rule.Percentage * 10;
                    else if (rule.Category is "Tất cả" or "All")
                        score += rule.Percentage * 2;
                }
            }
            else
            {
                score = c.CashbackRules.Sum(r => r.Percentage * 3);
            }

            if (salary > 0 && c.MinSalary > 0)
            {
                var ratio = salary / c.MinSalary;
                if (ratio >= 1.0m && ratio <= 1.5m) score += 40;
                else if (ratio <= 3.0m) score += 20;
            }

            return new { Card = c, Score = score };
        })
        .OrderByDescending(x => x.Score)
        .Take(3)
        .ToList();

        if (!scored.Any())
        {
            return new ChatResponse
            {
                Reply = "Hiện tại tôi chưa tìm thấy thẻ phù hợp với tiêu chí của bạn. Bạn có thể mô tả lại nhu cầu chi tiêu không? 🤔",
                Intent = "recommend",
                QuickReplies = new List<string> { "Thẻ hoàn tiền cao nhất?", "Thẻ không phí thường niên" }
            };
        }

        var cards = scored.Select(x => x.Card).ToList();
        var lines = new List<string> { "🎯 **Đây là Top thẻ tôi gợi ý cho bạn:**\n" };
        for (int i = 0; i < cards.Count; i++)
        {
            var c = cards[i];
            var topRule = c.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();
            var cbText = topRule != null ? $"Hoàn {topRule.Percentage}% {topRule.Category}" : "Nhiều ưu đãi";
            var feeText = c.AnnualFee == 0 ? "Miễn phí thường niên" : $"Phí: {c.AnnualFee:N0}đ/năm";
            var salaryText = c.MinSalary > 0 ? $" | Lương tối thiểu: {c.MinSalary / 1_000_000}M" : "";

            lines.Add($"**{i + 1}. {c.Name}** — _{c.Bank}_");
            lines.Add($"   💰 {cbText} | {feeText}{salaryText}\n");
        }

        if (salary > 0)
            lines.Add($"_Đã lọc theo mức lương {salary / 1_000_000:N0} triệu/tháng._");
        if (category != null)
            lines.Add($"_Ưu tiên danh mục: {category}._");

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "recommend",
            SuggestedCards = cards,
            QuickReplies = new List<string>
            {
                $"Chi tiết {cards[0].Name}",
                "So sánh 2 thẻ đầu",
                "Tìm thẻ khác"
            }
        };
    }

    private ChatResponse HandleCompare(string message, List<CreditCard> allCards)
    {
        // Try to extract card/bank names
        var matchedCards = allCards
            .Where(c => message.Contains(c.Name.ToLower()) || message.Contains(c.Bank.ToLower()))
            .GroupBy(c => c.Bank)
            .Select(g => g.First())
            .Take(2)
            .ToList();

        if (matchedCards.Count < 2)
        {
            // Fall back to top 2
            matchedCards = allCards.OrderByDescending(c => c.CashbackRules.Sum(r => r.Percentage)).Take(2).ToList();
        }

        var a = matchedCards[0];
        var b = matchedCards[1];

        var aTopCb = a.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();
        var bTopCb = b.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();

        var reply = $"⚔️ **So sánh: {a.Name} vs {b.Name}**\n\n" +
                    $"| Tiêu chí | {a.Name} | {b.Name} |\n" +
                    $"|---|---|---|\n" +
                    $"| 🏦 Ngân hàng | {a.Bank} | {b.Bank} |\n" +
                    $"| 💰 Hoàn tiền cao nhất | {aTopCb?.Percentage ?? 0}% | {bTopCb?.Percentage ?? 0}% |\n" +
                    $"| 📋 Phí thường niên | {(a.AnnualFee == 0 ? "Miễn phí" : $"{a.AnnualFee:N0}đ")} | {(b.AnnualFee == 0 ? "Miễn phí" : $"{b.AnnualFee:N0}đ")} |\n" +
                    $"| 💵 Yêu cầu lương | {(a.MinSalary > 0 ? $"{a.MinSalary / 1_000_000}M+" : "Không")} | {(b.MinSalary > 0 ? $"{b.MinSalary / 1_000_000}M+" : "Không")} |\n" +
                    $"| 🎁 Số ưu đãi | {a.CashbackRules.Count} quy tắc | {b.CashbackRules.Count} quy tắc |\n\n" +
                    $"💡 **Nhận xét**: {(aTopCb?.Percentage >= bTopCb?.Percentage ? a.Name : b.Name)} có mức hoàn tiền cao hơn, " +
                    $"còn {(a.AnnualFee <= b.AnnualFee ? a.Name : b.Name)} tiết kiệm phí hơn.";

        return new ChatResponse
        {
            Reply = reply,
            Intent = "compare",
            SuggestedCards = matchedCards,
            QuickReplies = new List<string>
            {
                $"Chi tiết {a.Name}",
                $"Chi tiết {b.Name}",
                "Gợi ý thẻ khác cho tôi"
            }
        };
    }

    private ChatResponse HandleCardInfo(string message, List<CreditCard> allCards)
    {
        var card = allCards.FirstOrDefault(c =>
            message.Contains(c.Name.ToLower()) ||
            (c.Name.Split(' ').Length > 1 && c.Name.Split(' ').Count(w => message.Contains(w.ToLower())) >= 2));

        if (card == null)
        {
            card = allCards.FirstOrDefault(c => message.Contains(c.Bank.ToLower()));
        }

        if (card == null)
        {
            return new ChatResponse
            {
                Reply = "Tôi chưa tìm thấy thẻ bạn đề cập. Bạn có thể cho tôi biết tên thẻ hoặc ngân hàng cụ thể không? 🔍",
                Intent = "card_info",
                QuickReplies = allCards.Take(4).Select(c => $"Thông tin {c.Name}").ToList()
            };
        }

        var rules = string.Join("\n", card.CashbackRules.Select(r =>
            $"  • {r.Category}: **{r.Percentage}%**" + (r.CapAmount > 0 ? $" (tối đa {r.CapAmount:N0}đ)" : "")));

        var benefits = card.Benefits.Any()
            ? string.Join("\n", card.Benefits.Select(b => $"  ✅ {b}"))
            : "  _Chưa có thông tin cụ thể_";

        var reply = $"📋 **{card.Name}** — _{card.Bank}_\n\n" +
                    $"💵 **Phí thường niên**: {(card.AnnualFee == 0 ? "Miễn phí 🎉" : $"{card.AnnualFee:N0}đ/năm")}\n" +
                    $"💰 **Yêu cầu lương**: {(card.MinSalary > 0 ? $"Từ {card.MinSalary / 1_000_000:N0} triệu/tháng" : "Không yêu cầu")}\n\n" +
                    $"🏷️ **Hoàn tiền**:\n{rules}\n\n" +
                    $"🎁 **Quyền lợi**:\n{benefits}";

        return new ChatResponse
        {
            Reply = reply,
            Intent = "card_info",
            SuggestedCards = new List<CreditCard> { card },
            QuickReplies = new List<string>
            {
                "Tìm thẻ tương tự",
                $"So sánh với thẻ khác",
                "Thẻ hoàn tiền cao hơn?"
            }
        };
    }

    private ChatResponse HandleBankSearch(string message, List<CreditCard> allCards)
    {
        var banks = new[] { "vib", "hsbc", "techcombank", "vpbank", "acb", "bidv", "mb", "sacombank", "tpbank", "ocb", "shinhan", "eximbank", "hdbank", "vietcombank", "uob", "msb", "standard chartered", "mb bank" };
        var matchedBank = banks.FirstOrDefault(b => message.Contains(b));

        if (matchedBank == null)
        {
            return new ChatResponse
            {
                Reply = "Bạn muốn tìm thẻ của ngân hàng nào? Tôi hỗ trợ nhiều ngân hàng lớn! 🏦",
                Intent = "bank_search",
                QuickReplies = new List<string> { "Thẻ VIB", "Thẻ HSBC", "Thẻ Techcombank", "Thẻ VPBank" }
            };
        }

        var bankCards = allCards
            .Where(c => c.Bank.ToLower().Contains(matchedBank) || c.BankName.ToLower().Contains(matchedBank))
            .ToList();

        if (!bankCards.Any())
        {
            return new ChatResponse
            {
                Reply = $"Hiện tại hệ thống chưa có thẻ nào của **{matchedBank.ToUpper()}**. Bạn muốn tôi tìm ngân hàng khác không? 🔍",
                Intent = "bank_search",
                QuickReplies = new List<string> { "Thẻ VIB", "Thẻ HSBC", "Thẻ Techcombank" }
            };
        }

        var lines = new List<string> { $"🏦 **Danh sách thẻ {matchedBank.ToUpper()}** ({bankCards.Count} thẻ):\n" };
        foreach (var c in bankCards.Take(5))
        {
            var topRule = c.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();
            lines.Add($"• **{c.Name}** — Hoàn {topRule?.Percentage ?? 0}% | {(c.AnnualFee == 0 ? "Miễn phí" : $"{c.AnnualFee:N0}đ/năm")}");
        }

        if (bankCards.Count > 5)
            lines.Add($"\n_...và {bankCards.Count - 5} thẻ khác._");

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "bank_search",
            SuggestedCards = bankCards.Take(3).ToList(),
            QuickReplies = bankCards.Take(3).Select(c => $"Chi tiết {c.Name}").ToList()
        };
    }

    private ChatResponse HandleCashback(string message, List<CreditCard> allCards)
    {
        var topCards = allCards
            .Select(c => new
            {
                Card = c,
                MaxCb = c.CashbackRules.Any() ? c.CashbackRules.Max(r => r.Percentage) : 0
            })
            .OrderByDescending(x => x.MaxCb)
            .Take(5)
            .ToList();

        var lines = new List<string> { "💰 **Top 5 thẻ hoàn tiền cao nhất**:\n" };
        for (int i = 0; i < topCards.Count; i++)
        {
            var x = topCards[i];
            var topRule = x.Card.CashbackRules.OrderByDescending(r => r.Percentage).First();
            lines.Add($"**{i + 1}. {x.Card.Name}** — _{x.Card.Bank}_");
            lines.Add($"   🔥 Hoàn **{topRule.Percentage}%** cho _{topRule.Category}_ " +
                      (topRule.CapAmount > 0 ? $"(tối đa {topRule.CapAmount:N0}đ)" : "") + "\n");
        }

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "cashback",
            SuggestedCards = topCards.Select(x => x.Card).Take(3).ToList(),
            QuickReplies = new List<string>
            {
                $"Chi tiết {topCards[0].Card.Name}",
                "Thẻ hoàn tiền ăn uống",
                "Thẻ hoàn tiền mua sắm"
            }
        };
    }

    private ChatResponse HandleSalary(string message, List<CreditCard> allCards)
    {
        var match = Regex.Match(message, @"(\d+)\s*(triệu|tr|m)");
        if (!match.Success)
        {
            return new ChatResponse
            {
                Reply = "Bạn cho tôi biết mức lương hàng tháng (VD: 15 triệu) để tôi lọc thẻ phù hợp nhé! 💼",
                Intent = "salary",
                QuickReplies = new List<string> { "Lương 10 triệu", "Lương 15 triệu", "Lương 30 triệu", "Lương 50 triệu" }
            };
        }

        var salary = decimal.Parse(match.Groups[1].Value) * 1_000_000;
        var eligible = allCards.Where(c => c.MinSalary <= 0 || c.MinSalary <= salary).ToList();
        var tooHigh = allCards.Where(c => c.MinSalary > salary && c.MinSalary > 0).ToList();

        var lines = new List<string>
        {
            $"💼 **Với mức lương {salary / 1_000_000:N0} triệu/tháng**:\n",
            $"✅ Bạn đủ điều kiện cho **{eligible.Count}** thẻ",
            $"❌ Chưa đủ điều kiện cho **{tooHigh.Count}** thẻ\n"
        };

        var top3 = eligible
            .OrderByDescending(c => c.CashbackRules.Sum(r => r.Percentage))
            .Take(3)
            .ToList();

        if (top3.Any())
        {
            lines.Add("🌟 **Top thẻ phù hợp với bạn:**\n");
            foreach (var c in top3)
            {
                var topRule = c.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();
                lines.Add($"• **{c.Name}** ({c.Bank}) — Hoàn {topRule?.Percentage ?? 0}%");
            }
        }

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "salary",
            SuggestedCards = top3,
            QuickReplies = top3.Take(2).Select(c => $"Chi tiết {c.Name}").Append("So sánh 2 thẻ đầu").ToList()
        };
    }

    private ChatResponse HandleAnnualFee(string message, List<CreditCard> allCards)
    {
        bool wantFree = message.Contains("miễn phí") || message.Contains("free") || message.Contains("0") || message.Contains("không phí");

        var filtered = wantFree
            ? allCards.Where(c => c.AnnualFee == 0).ToList()
            : allCards.OrderBy(c => c.AnnualFee).ToList();

        var lines = new List<string>
        {
            wantFree
                ? $"🎉 **Thẻ miễn phí thường niên** ({filtered.Count} thẻ):\n"
                : $"📋 **Thẻ sắp xếp theo phí thường niên** (thấp → cao):\n"
        };

        foreach (var c in filtered.Take(5))
        {
            var topRule = c.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();
            lines.Add($"• **{c.Name}** ({c.Bank}) — {(c.AnnualFee == 0 ? "Miễn phí ✨" : $"{c.AnnualFee:N0}đ")} | Hoàn {topRule?.Percentage ?? 0}%");
        }

        if (filtered.Count > 5)
            lines.Add($"\n_...và {filtered.Count - 5} thẻ khác._");

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "annual_fee",
            SuggestedCards = filtered.Take(3).ToList(),
            QuickReplies = new List<string> { "Thẻ hoàn tiền cao nhất", "Tư vấn theo lương", "So sánh 2 thẻ" }
        };
    }

    private ChatResponse HandleTopCards(List<CreditCard> allCards)
    {
        var top = allCards
            .Select(c => new
            {
                Card = c,
                TotalScore = c.CashbackRules.Sum(r => r.Percentage * 5) + (c.AnnualFee == 0 ? 10 : 0) + c.Benefits.Count * 2
            })
            .OrderByDescending(x => x.TotalScore)
            .Take(5)
            .ToList();

        var lines = new List<string> { "🏆 **Top 5 thẻ tín dụng tốt nhất hiện tại:**\n" };
        for (int i = 0; i < top.Count; i++)
        {
            var x = top[i];
            var medal = i switch { 0 => "🥇", 1 => "🥈", 2 => "🥉", _ => $"**{i + 1}.**" };
            var topRule = x.Card.CashbackRules.OrderByDescending(r => r.Percentage).FirstOrDefault();
            lines.Add($"{medal} **{x.Card.Name}** — _{x.Card.Bank}_");
            lines.Add($"   Hoàn {topRule?.Percentage ?? 0}% | {(x.Card.AnnualFee == 0 ? "Miễn phí" : $"{x.Card.AnnualFee:N0}đ/năm")}\n");
        }

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "top_cards",
            SuggestedCards = top.Select(x => x.Card).Take(3).ToList(),
            QuickReplies = new List<string>
            {
                $"Chi tiết {top[0].Card.Name}",
                "Thẻ hoàn tiền ăn uống",
                "Thẻ phí thường niên thấp"
            }
        };
    }

    private ChatResponse HandleCount(List<CreditCard> allCards)
    {
        var bankGroups = allCards.GroupBy(c => c.Bank).OrderByDescending(g => g.Count()).ToList();
        var lines = new List<string>
        {
            $"📊 **Thống kê hệ thống:**\n",
            $"• Tổng số thẻ: **{allCards.Count}** thẻ",
            $"• Số ngân hàng: **{bankGroups.Count}** ngân hàng",
            $"• Thẻ miễn phí: **{allCards.Count(c => c.AnnualFee == 0)}** thẻ\n",
            "🏦 **Phân bổ theo ngân hàng:**\n"
        };

        foreach (var g in bankGroups.Take(6))
        {
            lines.Add($"• {g.Key}: **{g.Count()}** thẻ");
        }

        return new ChatResponse
        {
            Reply = string.Join("\n", lines),
            Intent = "count",
            QuickReplies = new List<string> { "Top thẻ tốt nhất", "Thẻ hoàn tiền cao nhất", "Tư vấn cho tôi" }
        };
    }

    private ChatResponse HandleHelp()
    {
        return new ChatResponse
        {
            Reply = "🤖 **Tôi có thể giúp bạn:**\n\n" +
                    "💳 **Tư vấn thẻ** — _\"Tư vấn thẻ cho lương 20 triệu\"_\n" +
                    "⚔️ **So sánh thẻ** — _\"So sánh VIB và HSBC\"_\n" +
                    "🔍 **Tra cứu thẻ** — _\"Thông tin VIB Cash Back\"_\n" +
                    "🏦 **Tìm theo ngân hàng** — _\"Thẻ của Techcombank\"_\n" +
                    "💰 **Hoàn tiền** — _\"Thẻ hoàn tiền ăn uống\"_\n" +
                    "💼 **Lọc theo lương** — _\"Lương 15 triệu nên dùng thẻ nào?\"_\n" +
                    "🏆 **Xếp hạng** — _\"Top thẻ tốt nhất\"_\n" +
                    "📊 **Thống kê** — _\"Hệ thống có bao nhiêu thẻ?\"_\n\n" +
                    "Hãy hỏi tôi bất cứ điều gì! 😊",
            Intent = "help",
            QuickReplies = new List<string>
            {
                "Top thẻ tốt nhất",
                "Tư vấn thẻ cho tôi",
                "Thẻ miễn phí thường niên",
                "Hệ thống có bao nhiêu thẻ?"
            }
        };
    }

    private ChatResponse HandleFallback(string message, List<CreditCard> allCards)
    {
        // Try to find any card name in the message
        var mentionedCard = allCards.FirstOrDefault(c =>
            message.Contains(c.Name.ToLower()) ||
            c.Name.Split(' ').Count(w => w.Length > 2 && message.Contains(w.ToLower())) >= 2);

        if (mentionedCard != null)
        {
            return HandleCardInfo(message, allCards);
        }

        return new ChatResponse
        {
            Reply = "Tôi chưa hiểu rõ câu hỏi của bạn 🤔. Bạn có thể thử hỏi theo các gợi ý bên dưới hoặc gõ **\"help\"** để xem danh sách tính năng nhé!",
            Intent = "unknown",
            QuickReplies = new List<string>
            {
                "Tư vấn thẻ cho tôi",
                "Top thẻ hoàn tiền",
                "Hướng dẫn sử dụng",
                "Thẻ miễn phí thường niên"
            }
        };
    }
}
