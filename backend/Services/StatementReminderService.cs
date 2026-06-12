using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using backend.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Services;

public class StatementReminderService : BackgroundService
{
    private readonly ILogger<StatementReminderService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public StatementReminderService(ILogger<StatementReminderService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("StatementReminderService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunReminderJobAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing StatementReminderService.");
            }

            // Run every 24 hours (can be changed to 1 hour or specific time)
            // For production, usually calculate time to next 08:00 AM. Here we just sleep 24h.
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    public async Task RunReminderJobAsync(CancellationToken token = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var mongoClient = scope.ServiceProvider.GetRequiredService<IMongoClient>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
        
        var usersCollection = database.GetCollection<User>("Users");
        var cardsCollection = database.GetCollection<CreditCard>("CreditCards");
        var notificationsCollection = database.GetCollection<Notification>("Notifications");

        _logger.LogInformation("Running VIP Statement Reminder Job at {Time}", DateTimeOffset.Now);

        // Lấy danh sách tài khoản VIP
        var vipUsers = await usersCollection.Find(u => u.Role == "VIP").ToListAsync(token);

        foreach (var user in vipUsers)
        {
            if (user.CardDetails == null || !user.CardDetails.Any()) continue;

            foreach (var kvp in user.CardDetails)
            {
                var cardId = kvp.Key;
                var details = kvp.Value;

                if (details.DueDate <= 0 || details.DueDate > 31) continue;

                var today = DateTime.UtcNow;
                var currentYear = today.Year;
                var currentMonth = today.Month;

                // Handle valid days for current month (e.g., Feb might not have 30)
                int daysInMonth = DateTime.DaysInMonth(currentYear, currentMonth);
                int actualDueDay = Math.Min(details.DueDate.Value, daysInMonth);
                
                DateTime nextDueDate = new DateTime(currentYear, currentMonth, actualDueDay, 0, 0, 0, DateTimeKind.Utc);
                
                // Nếu dueDate của tháng này đã qua, tính cho tháng sau
                if (nextDueDate.Date < today.Date)
                {
                    var nextMonthDate = today.AddMonths(1);
                    int daysInNextMonth = DateTime.DaysInMonth(nextMonthDate.Year, nextMonthDate.Month);
                    int actualNextDueDay = Math.Min(details.DueDate.Value, daysInNextMonth);
                    nextDueDate = new DateTime(nextMonthDate.Year, nextMonthDate.Month, actualNextDueDay, 0, 0, 0, DateTimeKind.Utc);
                }

                var daysRemaining = (nextDueDate.Date - today.Date).TotalDays;

                if (daysRemaining == 3 || daysRemaining == 0)
                {
                    var card = await cardsCollection.Find(c => c.Id == cardId).FirstOrDefaultAsync(token);
                    if (card == null) continue;

                    string message = daysRemaining == 0 
                        ? $"Hôm nay là ngày thanh toán của thẻ {card.Name}. Vui lòng thanh toán toàn bộ dư nợ để tránh phí phạt." 
                        : $"Thẻ {card.Name} của bạn sẽ đến hạn thanh toán trong 3 ngày tới ({nextDueDate:dd/MM/yyyy}). Vui lòng sắp xếp thanh toán.";

                    string title = daysRemaining == 0 ? "🔔 Đến hạn thanh toán thẻ!" : "⏳ Sắp đến hạn thanh toán thẻ";

                    // Chống spam: Kiểm tra xem thông báo với nội dung tương tự đã được tạo trong vòng 10 ngày chưa
                    var cutoffDate = today.AddDays(-10);
                    var existingNoti = await notificationsCollection.Find(
                        n => n.UserId == user.Id && 
                             n.Title == title && 
                             n.Message == message && 
                             n.CreatedAt > cutoffDate
                    ).FirstOrDefaultAsync(token);

                    if (existingNoti == null)
                    {
                        var noti = new Notification
                        {
                            UserId = user.Id!,
                            Title = title,
                            Message = message,
                            Link = "/wallet",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        await notificationsCollection.InsertOneAsync(noti, cancellationToken: token);
                        _logger.LogInformation($"Sent reminder to {user.Email} for card {card.Name}");

                        // Update LastRemindedAt
                        user.CardDetails[cardId].LastRemindedAt = DateTime.UtcNow;
                        var update = Builders<User>.Update.Set(u => u.CardDetails, user.CardDetails);
                        await usersCollection.UpdateOneAsync(u => u.Id == user.Id, update, cancellationToken: token);

                        // Send Email Notification in background
                        if (!string.IsNullOrEmpty(user.Email))
                        {
                            var userEmail = user.Email;
                            var cardName = card.Name;
                            var remaining = (int)daysRemaining;
                            var dueDate = nextDueDate;
                            
                            _ = Task.Run(async () => {
                                try
                                {
                                    await emailService.SendStatementReminderAsync(userEmail, cardName, remaining, dueDate);
                                    _logger.LogInformation($"Sent email reminder to {userEmail} for card {cardName}");
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, $"Failed to send email reminder to {userEmail}");
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}
