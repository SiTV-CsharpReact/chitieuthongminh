using backend.Models;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;

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
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public ChatService(CreditCardService creditCardService, IConfiguration configuration, HttpClient httpClient)
    {
        _creditCardService = creditCardService;
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        var apiKey = _configuration["GeminiApiKey"];
        if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_API_KEY_HERE")
        {
            return new ChatResponse 
            { 
                Reply = "Hệ thống chưa được cấu hình Google Gemini API Key.\n\n**Hướng dẫn:** Vui lòng lấy API key miễn phí tại [Google AI Studio](https://aistudio.google.com/), sau đó dán vào thuộc tính `\"GeminiApiKey\"` trong file `appsettings.json` của Backend rồi khởi động lại ứng dụng.",
                Intent = "error"
            };
        }

        var allCards = await _creditCardService.GetAsync();
        
        // Compact the card list to save tokens
        var compactedCards = allCards.Select(c => new
        {
            Id = c.Id,
            Name = c.Name,
            Bank = c.Bank,
            AnnualFee = c.AnnualFee,
            MinSalary = c.MinSalary,
            MaxCashbackPerMonth = c.MaxCashbackPerMonth,
            MinSpendForCashback = c.MinSpendForCashback,
            Tags = c.Tags,
            CashbackRules = c.CashbackRules.Select(r => new { Category = r.Category, Percentage = r.Percentage, CapAmount = r.CapAmount }).ToList()
        }).ToList();

        var cardsJson = JsonSerializer.Serialize(compactedCards, new JsonSerializerOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });

        var systemInstruction = $@"Bạn là Trợ lý Tài chính AI của hệ thống CredBack (Chi Tiêu Thông Minh) tại Việt Nam.
Nhiệm vụ của bạn là tư vấn thẻ tín dụng cho người dùng dựa trên nhu cầu của họ.

Dưới đây là danh sách thẻ tín dụng có sẵn trong hệ thống (định dạng JSON):
{cardsJson}

Luật:
1. Trả lời bằng tiếng Việt, thân thiện, súc tích và sử dụng markdown để làm nổi bật thông tin.
2. NẾU người dùng hỏi về một lĩnh vực cụ thể (ví dụ: Du lịch, Ăn uống, Siêu thị), TUYỆT ĐỐI CHỈ tìm và đề xuất các thẻ có `CashbackRules` (danh mục hoàn tiền) hoặc `Tags` KHỚP VỚI LĨNH VỰC ĐÓ. (Ví dụ: Khách hỏi Du lịch -> Chỉ tìm thẻ hoàn tiền Du lịch/Ngoại tệ/Vé máy bay. KHÔNG ĐƯỢC đưa thẻ hoàn tiền Shopee/Siêu thị vào danh sách).
3. KHÔNG đề xuất thẻ dành cho Doanh nghiệp (trong tên có chữ Corporate/Business) trừ khi người dùng nói họ là công ty/doanh nghiệp.
4. KHÔNG BỊA RA TÊN THẺ KHÔNG CÓ TRONG DANH SÁCH.
5. ĐẶC BIỆT CHÚ Ý ĐẾN MaxCashbackPerMonth (giới hạn hoàn tối đa/tháng) và CapAmount. Nếu tiêu 20 triệu vào thẻ hoàn 20% nhưng MaxCashback = 500k, thì số tiền hoàn chỉ là 500k.
6. Khi tóm tắt thẻ trong nội dung câu trả lời, BẮT BUỘC dùng định dạng sau (đặt bên trong trường ""reply""):
- **[Tên thẻ]** - *[Ngân hàng]*
- Danh mục hoàn: [Liệt kê TẤT CẢ danh mục liên quan]
- Mức hoàn: [Phần trăm]% (Tối đa: [MaxCashbackPerMonth] VNĐ/tháng)
- Phí thường niên: [AnnualFee]
7. LUÔN TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON hợp lệ với cấu trúc sau:
{{
  ""reply"": ""Câu trả lời CÓ CHỨA ĐỊNH DẠNG TÓM TẮT THẺ ở trên"",
  ""intent"": ""loại_yêu_cầu"",
  ""suggestedCardIds"": [""id_the_1"", ""id_the_2""],
  ""quickReplies"": [""Câu hỏi gợi ý 1"", ""Câu hỏi gợi ý 2""]
}}
Nếu không gợi ý thẻ nào, để suggestedCardIds là mảng rỗng [].";

        var contents = new List<object>();

        // Add history
        foreach (var msg in request.History)
        {
            contents.Add(new
            {
                role = msg.Role == "assistant" ? "model" : "user",
                parts = new[] { new { text = msg.Content } }
            });
        }

        // Add current message
        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = request.Message } }
        });

        var payload = new
        {
            system_instruction = new
            {
                parts = new[] { new { text = systemInstruction } }
            },
            contents = contents,
            generationConfig = new
            {
                response_mime_type = "application/json"
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
        
        var jsonPayload = JsonSerializer.Serialize(payload);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(url, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Gemini API Error: {responseString}");
                return new ChatResponse { Reply = $"Đã xảy ra lỗi khi gọi Gemini API: {responseString}" };
            }

            using var doc = JsonDocument.Parse(responseString);
            var textResult = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text").GetString();

            if (string.IsNullOrEmpty(textResult))
                return new ChatResponse { Reply = "Xin lỗi, tôi không thể trả lời lúc này." };

            // Clean up possible markdown code blocks around json
            textResult = textResult.Trim();
            if (textResult.StartsWith("```json")) textResult = textResult.Substring(7);
            if (textResult.StartsWith("```")) textResult = textResult.Substring(3);
            if (textResult.EndsWith("```")) textResult = textResult.Substring(0, textResult.Length - 3);
            textResult = textResult.Trim();

            // Parse textResult as JSON
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(textResult);
            
            var reply = aiResponse.TryGetProperty("reply", out var replyElem) ? replyElem.GetString() ?? "" : "";
            var intent = aiResponse.TryGetProperty("intent", out var intentElem) ? intentElem.GetString() ?? "" : "";
            
            var suggestedCards = new List<CreditCard>();
            if (aiResponse.TryGetProperty("suggestedCardIds", out var idsElem) && idsElem.ValueKind == JsonValueKind.Array)
            {
                foreach (var idElem in idsElem.EnumerateArray())
                {
                    var id = idElem.GetString();
                    var card = allCards.FirstOrDefault(c => c.Id == id);
                    if (card != null) suggestedCards.Add(card);
                }
            }

            var quickReplies = new List<string>();
            if (aiResponse.TryGetProperty("quickReplies", out var qrElem) && qrElem.ValueKind == JsonValueKind.Array)
            {
                foreach (var qr in qrElem.EnumerateArray())
                {
                    var qrStr = qr.GetString();
                    if (!string.IsNullOrEmpty(qrStr)) quickReplies.Add(qrStr);
                }
            }

            return new ChatResponse
            {
                Reply = reply,
                Intent = intent,
                SuggestedCards = suggestedCards,
                QuickReplies = quickReplies
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ChatService Error: {ex.Message}");
            return new ChatResponse { Reply = "Hệ thống AI đang bảo trì hoặc bận. Vui lòng thử lại sau." };
        }
    }
}
