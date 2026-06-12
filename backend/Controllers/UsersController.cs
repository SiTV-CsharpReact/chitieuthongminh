using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using MongoDB.Driver;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMongoCollection<User> _usersCollection;

    public UsersController(IConfiguration configuration, IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase(configuration["DatabaseName"]);
        _usersCollection = database.GetCollection<User>("Users");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _usersCollection.Find(_ => true).ToListAsync();
        
        // Remove password hashes before returning
        var userDTOs = users.Select(u => new
        {
            u.Id,
            u.Name,
            u.Email,
            u.Role,
            u.Avatar,
            u.IsBlocked
        });

        return Ok(userDTOs);
    }

    [HttpGet("admin/vips")]
    public async Task<IActionResult> GetVips([FromServices] IMongoClient mongoClient, [FromServices] IConfiguration config)
    {
        var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(adminId) || !MongoDB.Bson.ObjectId.TryParse(adminId, out _)) 
            return Unauthorized();

        var admin = await _usersCollection.Find(u => u.Id == adminId).FirstOrDefaultAsync();
        if (admin == null || admin.Role != "Admin") return Forbid();

        var vips = await _usersCollection.Find(u => u.Role == "VIP").ToListAsync();

        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        var cardsCollection = database.GetCollection<CreditCard>("CreditCards");

        var allCardIds = vips.Where(v => v.SavedCardIds != null).SelectMany(v => v.SavedCardIds!).Distinct().ToList();
        var allCards = await cardsCollection.Find(c => allCardIds.Contains(c.Id)).ToListAsync();
        var cardsDict = allCards.ToDictionary(c => c.Id, c => c);

        var result = new List<object>();

        foreach (var vip in vips)
        {
            var vipCardsList = new List<object>();
            if (vip.SavedCardIds != null && vip.CardDetails != null)
            {
                foreach (var cardId in vip.SavedCardIds)
                {
                    if (cardsDict.TryGetValue(cardId, out var card) && vip.CardDetails.TryGetValue(cardId, out var detail))
                    {
                        // Calculate next due date
                        DateTime? nextDueDate = null;
                        int? daysRemaining = null;

                        if (detail.DueDate > 0 && detail.DueDate <= 31)
                        {
                            var today = DateTime.UtcNow;
                            var currentYear = today.Year;
                            var currentMonth = today.Month;

                            int daysInMonth = DateTime.DaysInMonth(currentYear, currentMonth);
                            int actualDueDay = Math.Min(detail.DueDate.Value, daysInMonth);
                            
                            nextDueDate = new DateTime(currentYear, currentMonth, actualDueDay, 0, 0, 0, DateTimeKind.Utc);
                            
                            if (nextDueDate.Value.Date < today.Date)
                            {
                                var nextMonthDate = today.AddMonths(1);
                                int daysInNextMonth = DateTime.DaysInMonth(nextMonthDate.Year, nextMonthDate.Month);
                                int actualNextDueDay = Math.Min(detail.DueDate.Value, daysInNextMonth);
                                nextDueDate = new DateTime(nextMonthDate.Year, nextMonthDate.Month, actualNextDueDay, 0, 0, 0, DateTimeKind.Utc);
                            }

                            daysRemaining = (int)(nextDueDate.Value.Date - today.Date).TotalDays;
                        }

                        vipCardsList.Add(new
                        {
                            cardId = card.Id,
                            cardName = card.Name,
                            cardImage = card.ImageUrl,
                            bankName = card.Bank,
                            statementDate = detail.StatementDate,
                            dueDate = detail.DueDate,
                            nextDueDate = nextDueDate,
                            daysRemaining = daysRemaining,
                            lastRemindedAt = detail.LastRemindedAt
                        });
                    }
                }
            }

            result.Add(new
            {
                id = vip.Id,
                name = vip.Name,
                email = vip.Email,
                avatar = vip.Avatar,
                cards = vipCardsList
            });
        }

        return Ok(result);
    }

    public class SendVipReminderRequest
    {
        public int DaysRemaining { get; set; }
        public string CardName { get; set; } = null!;
        public DateTime NextDueDate { get; set; }
    }

    [Authorize]
    [HttpPost("admin/vips/{vipId}/remind/{cardId}")]
    public async Task<IActionResult> SendVipReminder(string vipId, string cardId, [FromBody] SendVipReminderRequest request, [FromServices] IMongoClient mongoClient, [FromServices] IConfiguration config, [FromServices] backend.Services.EmailService emailService)
    {
        var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(adminId) || !MongoDB.Bson.ObjectId.TryParse(adminId, out _)) return Unauthorized();

        var admin = await _usersCollection.Find(u => u.Id == adminId).FirstOrDefaultAsync();
        if (admin == null || admin.Role != "Admin") return Forbid();

        var vip = await _usersCollection.Find(u => u.Id == vipId).FirstOrDefaultAsync();
        if (vip == null) return NotFound(new { message = "Không tìm thấy người dùng VIP." });

        if (vip.CardDetails == null || !vip.CardDetails.ContainsKey(cardId))
            return NotFound(new { message = "Thẻ này không tồn tại trong ví của người dùng." });

        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        var notificationsCollection = database.GetCollection<Notification>("Notifications");

        // Construct notification
        var dueDateStr = request.NextDueDate.ToString("dd/MM/yyyy");
        var message = request.DaysRemaining <= 0 
            ? $"Hôm nay là ngày thanh toán của thẻ {request.CardName}. Vui lòng thanh toán toàn bộ dư nợ để tránh phí phạt." 
            : $"Thẻ {request.CardName} của bạn sẽ đến hạn thanh toán trong {request.DaysRemaining} ngày tới ({dueDateStr}). Vui lòng sắp xếp thanh toán.";
        var title = request.DaysRemaining <= 0 ? "🔔 Đến hạn thanh toán thẻ!" : "⏳ Sắp đến hạn thanh toán thẻ";

        var notification = new Notification
        {
            UserId = vip.Id!,
            Title = title,
            Message = message,
            Link = "/wallet"
        };
        await notificationsCollection.InsertOneAsync(notification);

        // Send Email Notification in background to avoid blocking API
        if (!string.IsNullOrEmpty(vip.Email))
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await emailService.SendStatementReminderAsync(vip.Email, request.CardName, request.DaysRemaining, request.NextDueDate);
                    Console.WriteLine($"[EmailService] Sent email reminder to {vip.Email} for card {request.CardName}");
                }
                catch (Exception ex)
                {
                    // Log exception if needed, but don't fail the API
                    Console.WriteLine($"[EmailService] Failed to send email to {vip.Email}: {ex.Message}");
                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"[EmailService] Inner Exception: {ex.InnerException.Message}");
                    }
                }
            });
        }

        // Update LastRemindedAt
        vip.CardDetails[cardId].LastRemindedAt = DateTime.UtcNow;
        var update = Builders<User>.Update.Set(u => u.CardDetails, vip.CardDetails);
        await _usersCollection.UpdateOneAsync(u => u.Id == vipId, update);

        return Ok(new { message = "Đã gửi nhắc nhở thành công!", lastRemindedAt = vip.CardDetails[cardId].LastRemindedAt });
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = null!;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateRoleRequest request)
    {
        var user = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        var update = Builders<User>.Update.Set(u => u.Role, request.Role);
        await _usersCollection.UpdateOneAsync(u => u.Id == id, update);

        return Ok(new { message = "Cập nhật thành công" });
    }

    [HttpPut("{id}/block")]
    public async Task<IActionResult> ToggleBlock(string id)
    {
        var user = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        var update = Builders<User>.Update.Set(u => u.IsBlocked, !user.IsBlocked);
        await _usersCollection.UpdateOneAsync(u => u.Id == id, update);

        return Ok(new { message = !user.IsBlocked ? "Đã khóa người dùng" : "Đã mở khóa người dùng", isBlocked = !user.IsBlocked });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
        if (result.DeletedCount == 0)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        return Ok(new { message = "Xoá người dùng thành công" });
    }

    [HttpGet("wallet")]
    public async Task<IActionResult> GetWallet([FromServices] IMongoClient mongoClient, [FromServices] IConfiguration config)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (!MongoDB.Bson.ObjectId.TryParse(userId, out _))
            return Ok(new List<CreditCard>());

        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound(new { message = "User not found" });

        if (user.SavedCardIds == null || !user.SavedCardIds.Any())
            return Ok(new List<CreditCard>());

        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        var cardsCollection = database.GetCollection<CreditCard>("CreditCards");

        var cards = await cardsCollection.Find(c => user.SavedCardIds.Contains(c.Id)).ToListAsync();

        var walletCards = cards.Select(c => new
        {
            Card = c,
            Details = user.CardDetails != null && user.CardDetails.ContainsKey(c.Id) 
                ? user.CardDetails[c.Id] 
                : new UserCardDetail()
        }).ToList();

        return Ok(walletCards);
    }

    [HttpPost("wallet/{cardId}")]
    public async Task<IActionResult> AddToWallet(string cardId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (!MongoDB.Bson.ObjectId.TryParse(userId, out _))
            return NotFound(new { message = "User not found" });

        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound(new { message = "User not found" });

        user.SavedCardIds ??= new List<string>();
        user.CardDetails ??= new Dictionary<string, UserCardDetail>();

        if (!user.SavedCardIds.Contains(cardId))
        {
            user.SavedCardIds.Add(cardId);
            if (!user.CardDetails.ContainsKey(cardId))
            {
                user.CardDetails[cardId] = new UserCardDetail();
            }

            var update = Builders<User>.Update
                .Set(u => u.SavedCardIds, user.SavedCardIds)
                .Set(u => u.CardDetails, user.CardDetails);
            await _usersCollection.UpdateOneAsync(u => u.Id == userId, update);
        }

        return Ok(new { message = "Đã lưu thẻ vào ví", savedCardIds = user.SavedCardIds });
    }

    [HttpDelete("wallet/{cardId}")]
    public async Task<IActionResult> RemoveFromWallet(string cardId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (!MongoDB.Bson.ObjectId.TryParse(userId, out _))
            return NotFound(new { message = "User not found" });

        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound(new { message = "User not found" });

        if (user.SavedCardIds != null && user.SavedCardIds.Contains(cardId))
        {
            user.SavedCardIds.Remove(cardId);
            
            if (user.CardDetails != null && user.CardDetails.ContainsKey(cardId))
            {
                user.CardDetails.Remove(cardId);
            }

            var update = Builders<User>.Update
                .Set(u => u.SavedCardIds, user.SavedCardIds)
                .Set(u => u.CardDetails, user.CardDetails);
                
            await _usersCollection.UpdateOneAsync(u => u.Id == userId, update);
        }

        return Ok(new { message = "Đã xóa thẻ khỏi ví", savedCardIds = user.SavedCardIds });
    }

    public class UpdateCardDetailsRequest
    {
        public DateTime? IssueDate { get; set; }
        public int? StatementDate { get; set; }
        public int? DueDate { get; set; }
    }

    [HttpPut("wallet/{cardId}")]
    public async Task<IActionResult> UpdateCardDetails(string cardId, [FromBody] UpdateCardDetailsRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (!MongoDB.Bson.ObjectId.TryParse(userId, out _))
            return NotFound(new { message = "User not found" });

        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound(new { message = "User not found" });

        if (user.Role != "VIP")
            return BadRequest(new { message = "Chỉ tài khoản VIP mới được theo dõi ngày mở thẻ/sao kê để nhắc nợ." });

        user.CardDetails ??= new Dictionary<string, UserCardDetail>();
        if (!user.CardDetails.ContainsKey(cardId))
        {
            user.CardDetails[cardId] = new UserCardDetail();
        }

        user.CardDetails[cardId].IssueDate = request.IssueDate;
        user.CardDetails[cardId].StatementDate = request.StatementDate;
        user.CardDetails[cardId].DueDate = request.DueDate;

        var update = Builders<User>.Update.Set(u => u.CardDetails, user.CardDetails);
        await _usersCollection.UpdateOneAsync(u => u.Id == userId, update);

        return Ok(new { message = "Đã cập nhật thông tin thẻ thành công" });
    }

    [HttpPost("upgrade-vip")]
    public async Task<IActionResult> UpgradeVip()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (!MongoDB.Bson.ObjectId.TryParse(userId, out _))
            return NotFound(new { message = "User not found" });

        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound(new { message = "User not found" });

        var update = Builders<User>.Update.Set(u => u.Role, "VIP");
        await _usersCollection.UpdateOneAsync(u => u.Id == userId, update);

        return Ok(new { message = "Chúc mừng bạn đã nâng cấp thành viên VIP thành công!" });
    }
}
