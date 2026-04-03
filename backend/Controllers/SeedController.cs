using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly CreditCardService _creditCardService;
    private readonly CategoryService _categoryService;

    public SeedController(CreditCardService creditCardService, CategoryService categoryService)
    {
        _creditCardService = creditCardService;
        _categoryService = categoryService;
    }

    [HttpPost("cards")]
    public async Task<IActionResult> SeedCardsAction()
    {
        await SeedCardsInternal();
        return Ok(new { message = "Seeded cards successfully" });
    }

    private async Task SeedCardsInternal()
    {
        // Bulk clear existing cards
        await _creditCardService.RemoveAllAsync();

        var cards = new List<CreditCard>
        {
            new CreditCard {
                Name = "HSBC Visa Platinum",
                BankName = "HSBC",
                BankLogo = "https://www.hsbc.com.vn/content/dam/hsbc/hsbcvn/images/common/logo-hsbc.svg",
                ImageUrl = "https://www.hsbc.com.vn/content/dam/hsbc/hsbcvn/images/cards/visa-platinum.png",
                AnnualFee = 800000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Ăn uống", Percentage = 6M, CapAmount = 600000 },
                    new CashbackRule { Category = "Mua sắm", Percentage = 1M, CapAmount = 1000000 },
                    new CashbackRule { Category = "Tất cả", Percentage = 0.5M }
                },
                Description = "Hoàn tiền lên đến 6% cho chi tiêu ẩm thực.",
                Benefits = new List<string> { "Bảo hiểm du lịch", "Ưu đãi sân golf" }
            },
            new CreditCard {
                Name = "VIB Online Plus 2in1",
                BankName = "VIB",
                BankLogo = "https://www.vib.com.vn/static-contents/logo_vib_blue.png",
                ImageUrl = "https://www.vib.com.vn/static-contents/620/1240/vib-online-plus-2in1.png",
                AnnualFee = 599000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Online", Percentage = 6M, CapAmount = 600000 },
                    new CashbackRule { Category = "Tất cả", Percentage = 0.1M }
                },
                Description = "Dòng thẻ tích hợp tín dụng và thanh toán đầu tiên tại Đông Nam Á.",
                Benefits = new List<string> { "Hoàn tiền 6% chi tiêu trực tuyến", "Tặng gói bảo hiểm chủ thẻ" }
            },
            new CreditCard {
                Name = "VPBank StepUP",
                BankName = "VPBank",
                BankLogo = "https://www.vpbank.com.vn/assets/img/logo-vpbank.svg",
                ImageUrl = "https://www.vpbank.com.vn/-/media/vpbank-latest/6-ca-nhan/3-the-tin-dung/stepup/the-step-up.png",
                AnnualFee = 499000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Online", Percentage = 15M, CapAmount = 600000 },
                    new CashbackRule { Category = "Ăn uống", Percentage = 2M, CapAmount = 600000 },
                    new CashbackRule { Category = "Tất cả", Percentage = 0.3M }
                },
                Description = "Hoàn tiền đến 15% cho chi tiêu Online, Ăn uống, Giải trí.",
                Benefits = new List<string> { "Hoàn tiền 15% Grab/Be", "Miễn phí thường niên năm đầu" }
            },
            new CreditCard {
                Name = "Techcombank Spark",
                BankName = "Techcombank",
                BankLogo = "https://techcombank.com/images/logo.png",
                ImageUrl = "https://techcombank.com/images/cards/spark.png",
                AnnualFee = 0,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Tất cả", Percentage = 2M, CapAmount = 500000 }
                },
                Description = "Chọn 1 trong 3 gói ưu đãi: Ăn uống, Mua sắm hoặc Giải trí.",
                Benefits = new List<string> { "Hoàn tiền 2% danh mục tự chọn", "Phí thường niên 0đ" }
            },
            new CreditCard {
                Name = "Standard Chartered Simply Cash",
                BankName = "Standard Chartered",
                BankLogo = "https://av.sc.com/vn/content/images/logo.png",
                ImageUrl = "https://av.sc.com/vn/content/images/simply-cash-card-face.png",
                AnnualFee = 1000000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Tất cả", Percentage = 1.5M }
                },
                Description = "Hoàn tiền 1.5% không giới hạn cho mọi chi tiêu.",
                Benefits = new List<string> { "Hoàn tiền không giới hạn", "Ưu đãi ẩm thực toàn cầu" }
            },
            new CreditCard {
                Name = "Citi Cash Back",
                BankName = "Citibank",
                BankLogo = "https://www.citibank.com.vn/vietnam/footer/images/citi-logo.png",
                ImageUrl = "https://www.citibank.com.vn/vietnam/footer/images/citi-cash-back-card.png",
                AnnualFee = 1200000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Y tế", Percentage = 6M, CapAmount = 500000 },
                    new CashbackRule { Category = "Giáo dục", Percentage = 6M, CapAmount = 500000 },
                    new CashbackRule { Category = "Tất cả", Percentage = 1M }
                },
                Description = "Hoàn tiền đến 6% cho các danh mục thiết yếu.",
                Benefits = new List<string> { "Hoàn tiền tự động", "Bảo hiểm mua sắm" }
            },
            new CreditCard {
                Name = "Shinhan Digital",
                BankName = "Shinhan",
                BankLogo = "https://shinhan.com.vn/public/themes/shinhan/img/logo.png",
                ImageUrl = "https://shinhan.com.vn/public/uploads/cards/digital-card.png",
                AnnualFee = 500000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Online", Percentage = 5M, CapAmount = 300000 },
                    new CashbackRule { Category = "Tất cả", Percentage = 0.3M }
                },
                Description = "Thế hệ thẻ mới dành cho tín đồ mua sắm trực tuyến.",
                Benefits = new List<string> { "Hoàn tiền 5% Tiki/Shopee/Lazada", "Ưu đãi cà phê" }
            },
            new CreditCard {
                Name = "ACB Visa Signature",
                BankName = "ACB",
                BankLogo = "https://acb.com.vn/wps/wcm/connect/acb-logo.png",
                ImageUrl = "https://acb.com.vn/wps/wcm/connect/acb-visa-signature.png",
                AnnualFee = 1500000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Vé máy bay", Percentage = 10M, CapAmount = 1000000 },
                    new CashbackRule { Category = "Khách sạn", Percentage = 10M, CapAmount = 1000000 }
                },
                Description = "Đẳng cấp thượng lưu cùng ưu đãi du lịch vượt trội.",
                Benefits = new List<string> { "Phòng chờ sân bay", "Bảo hiểm du lịch 11 tỷ" }
            },
            new CreditCard {
                Name = "Sacombank Visa Platinum",
                BankName = "Sacombank",
                BankLogo = "https://www.sacombank.com.vn/assets/logo.png",
                ImageUrl = "https://www.sacombank.com.vn/ca-nhan/Pages/sacombank-visa-platinum.png",
                AnnualFee = 999000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Online", Percentage = 5M, CapAmount = 500000 },
                    new CashbackRule { Category = "Tất cả", Percentage = 0.5M }
                },
                Description = "Sống trọn đam mê với đặc quyền hoàn tiền hấp dẫn.",
                Benefits = new List<string> { "Trả góp 0%", "Bảo hiểm tai nạn du lịch" }
            },
            new CreditCard {
                Name = "MB Visa Modern",
                BankName = "MB Bank",
                BankLogo = "https://mbbank.com.vn/images/logo.png",
                ImageUrl = "https://mbbank.com.vn/images/visa-modern.png",
                AnnualFee = 200000,
                CashbackRules = new List<CashbackRule> {
                    new CashbackRule { Category = "Tất cả", Percentage = 1M, CapAmount = 200000 }
                },
                Description = "Thẻ tín dụng hiện đại cho cuộc sống năng động.",
                Benefits = new List<string> { "Mở thẻ online 1 phút", "Ưu đãi voucher ẩm thực" }
            }
        };

        foreach (var card in cards)
        {
            await _creditCardService.CreateAsync(card);
        }
    }

    [HttpPost("categories")]
    public async Task<IActionResult> SeedCategoriesAction()
    {
        await SeedCategoriesInternal();
        return Ok(new { message = "Seeded 10 categories successfully" });
    }

    private async Task SeedCategoriesInternal()
    {
        // Bulk clear existing categories
        await _categoryService.RemoveAllAsync();

        var categories = new List<Category>
        {
            new Category { Name = "Ăn uống", Color = "#EF4444" },
            new Category { Name = "Online", Color = "#3B82F6" },
            new Category { Name = "Mua sắm", Color = "#F59E0B" },
            new Category { Name = "Siêu thị", Color = "#10B981" },
            new Category { Name = "Du lịch", Color = "#8B5CF6" },
            new Category { Name = "Di chuyển", Color = "#06B6D4" },
            new Category { Name = "Giáo dục", Color = "#EC4899" },
            new Category { Name = "Y tế", Color = "#F43F5E" },
            new Category { Name = "Vé máy bay", Color = "#0EA5E9" },
            new Category { Name = "Tất cả", Color = "#64748B" }
        };

        foreach (var category in categories)
        {
            await _categoryService.CreateAsync(category);
        }
    }

    [HttpPost("all")]
    public async Task<IActionResult> SeedAll()
    {
        Console.WriteLine("SeedAll started...");
        await SeedCategoriesInternal();
        Console.WriteLine("Categories seeded.");
        await SeedCardsInternal();
        Console.WriteLine("Cards seeded.");
        return Ok(new { message = "Seeded everything successfully" });
    }
}
