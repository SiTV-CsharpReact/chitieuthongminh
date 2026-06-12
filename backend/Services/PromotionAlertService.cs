using backend.Models;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace backend.Services;

public class PromotionAlertService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public PromotionAlertService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public void NotifyVipUsersAsync(List<CardPromotion> promotions)
    {
        // Fire and forget: Do not await this, let it run in the background
        Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
            var mongoClient = scope.ServiceProvider.GetRequiredService<IMongoClient>();
            var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var database = mongoClient.GetDatabase(config["DatabaseName"]);
            var usersCollection = database.GetCollection<User>("Users");
            var cardsCollection = database.GetCollection<CreditCard>("CreditCards");

            // Find all VIP users
            var vipUsers = await usersCollection.Find(u => u.Role == "VIP").ToListAsync();
            if (!vipUsers.Any()) return;

            // Resolve all saved cards for VIPs
            var allSavedCardIds = vipUsers.SelectMany(u => u.SavedCardIds ?? new List<string>()).Distinct().ToList();
            if (!allSavedCardIds.Any()) return;

            var userCards = await cardsCollection.Find(c => allSavedCardIds.Contains(c.Id)).ToListAsync();

            foreach (var promo in promotions)
            {
                if (promo.ApplicableCards == null || !promo.ApplicableCards.Any()) continue;

                foreach (var user in vipUsers)
                {
                    if (user.SavedCardIds == null || !user.SavedCardIds.Any()) continue;

                    foreach (var cardId in user.SavedCardIds)
                    {
                        var card = userCards.FirstOrDefault(c => c.Id == cardId);
                        if (card != null && promo.ApplicableCards.Any(ac => ac.Contains(card.Name) || card.Name.Contains(ac)))
                        {
                            // Match found! Send email to this user for this promotion
                            try
                            {
                                await emailService.SendPromotionAlertAsync(user.Email, promo, card.Name);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[AlertService] Error sending email to {user.Email}: {ex.Message}");
                            }
                        }
                    }
                }
            }
        });
    }
}
