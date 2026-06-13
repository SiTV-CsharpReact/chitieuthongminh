using System.Text.RegularExpressions;
using UglyToad.PdfPig;
using backend.Models;

namespace backend.Services;

public class PdfCardInfo
{
    public decimal? AnnualFee { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxCashbackPerMonth { get; set; }
    public List<CashbackRule> CashbackRules { get; set; } = new();
}

public class PdfExtractorService
{
    private readonly HttpClient _httpClient;

    public PdfExtractorService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PdfCardInfo?> ExtractInfoFromPdfAsync(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;

        try
        {
            var pdfBytes = await _httpClient.GetByteArrayAsync(url);
            using var document = PdfDocument.Open(pdfBytes);
            var text = string.Join(" ", document.GetPages().Select(p => p.Text));

            return ParseInfoFromText(text);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PdfExtractor] Failed to process {url}: {ex.Message}");
            return null;
        }
    }

    private PdfCardInfo ParseInfoFromText(string text)
    {
        var info = new PdfCardInfo();
        text = text.Replace("\n", " ").Replace("\r", " ").Replace("\t", " ");
        // Combine multiple spaces
        text = Regex.Replace(text, @"\s+", " ");
        
        // Annual Fee (Phí thường niên)
        var feeMatch = Regex.Match(text, @"phí\s+thường\s+niên.*?(?:là|:)?\s*(\d{1,3}(?:[.,]\d{3})+)\s*(?:vnđ|vnd|đ|đồng)", RegexOptions.IgnoreCase);
        if (feeMatch.Success)
        {
            if (decimal.TryParse(feeMatch.Groups[1].Value.Replace(".", "").Replace(",", ""), out var fee))
            {
                info.AnnualFee = fee;
            }
        }

        // Min Salary (Thu nhập tối thiểu)
        var salaryMatch = Regex.Match(text, @"thu\s+nhập.*?(?:tối\s+thiểu|từ).*?(?:là|:)?\s*(\d{1,3}(?:[.,]\d{3})*)\s*(?:vnđ|vnd|đ|đồng|triệu)", RegexOptions.IgnoreCase);
        if (salaryMatch.Success)
        {
            var valueStr = salaryMatch.Groups[1].Value.Replace(".", "").Replace(",", "");
            if (decimal.TryParse(valueStr, out var salary))
            {
                if (salaryMatch.Value.ToLower().Contains("triệu") && salary < 1000)
                    salary *= 1000000;
                info.MinSalary = salary;
            }
        }

        // Max Cashback Per Month (Số tiền hoàn tối đa)
        var maxCashbackMatch = Regex.Match(text, @"hoàn\s+tối\s+đa.*?(?:là|:)?\s*(\d{1,3}(?:[.,]\d{3})+)\s*(?:vnđ|vnd|đ|đồng)", RegexOptions.IgnoreCase);
        if (maxCashbackMatch.Success)
        {
            if (decimal.TryParse(maxCashbackMatch.Groups[1].Value.Replace(".", "").Replace(",", ""), out var maxCashback))
            {
                info.MaxCashbackPerMonth = maxCashback;
            }
        }

        // Cashback rules (Hoàn tiền X%)
        var cashbackMatches = Regex.Matches(text, @"hoàn\s+(?:tiền\s+)?(\d+(?:[.,]\d+)?)\s*%\s*(?:cho|khi|đối\s+với|các\s+giao\s+dịch)?\s*([^.,;]+)", RegexOptions.IgnoreCase);
        foreach (Match match in cashbackMatches)
        {
            if (decimal.TryParse(match.Groups[1].Value.Replace(",", "."), out var percentage) && percentage > 0)
            {
                var category = match.Groups[2].Value.Trim();
                if (category.Length > 50) category = category.Substring(0, 50) + "...";
                info.CashbackRules.Add(new CashbackRule
                {
                    Category = category,
                    Percentage = percentage
                });
            }
        }

        return info;
    }
}
