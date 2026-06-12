using backend.Models;
using MongoDB.Driver;

namespace backend.Services;

public class AnnualFeeReminderHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public AnnualFeeReminderHostedService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendRemindersAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AnnualFeeReminder] Error: {ex.Message}");
            }

            // Chạy kiểm tra mỗi ngày một lần (hoặc 1 giờ 1 lần tùy nhu cầu)
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }

    private async Task CheckAndSendRemindersAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
        var mongoClient = scope.ServiceProvider.GetRequiredService<IMongoClient>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        var usersCollection = database.GetCollection<User>("Users");
        var cardsCollection = database.GetCollection<CreditCard>("CreditCards");

        var vipUsers = await usersCollection.Find(u => u.Role == "VIP").ToListAsync();
        if (!vipUsers.Any()) return;

        var today = DateTime.UtcNow.Date;
        var targetDate = today.AddDays(7); // Kỷ niệm 7 ngày tới

        foreach (var user in vipUsers)
        {
            if (user.CardIssueDates == null || !user.CardIssueDates.Any()) continue;

            foreach (var kvp in user.CardIssueDates)
            {
                var cardId = kvp.Key;
                var issueDate = kvp.Value.Date;

                // Kiểm tra nếu 7 ngày tới trùng ngày/tháng với ngày mở thẻ
                if (issueDate.Month == targetDate.Month && issueDate.Day == targetDate.Day)
                {
                    var card = await cardsCollection.Find(c => c.Id == cardId).FirstOrDefaultAsync();
                    if (card != null && card.AnnualFee > 0)
                    {
                        try
                        {
                            await emailService.SendAnnualFeeReminderAsync(user.Email, card);
                            Console.WriteLine($"[AnnualFeeReminder] Đã gửi nhắc nhở cho {user.Email} về thẻ {card.Name}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[AnnualFeeReminder] Lỗi gửi email nhắc nhở: {ex.Message}");
                        }
                    }
                }
            }
        }
    }
}
