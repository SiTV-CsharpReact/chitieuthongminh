using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IMongoCollection<Notification> _notificationsCollection;
    private readonly IMongoCollection<User> _usersCollection;

    public NotificationsController(IMongoClient mongoClient, IConfiguration config)
    {
        var database = mongoClient.GetDatabase(config["DatabaseName"]);
        _notificationsCollection = database.GetCollection<Notification>("Notifications");
        _usersCollection = database.GetCollection<User>("Users");
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var notifications = await _notificationsCollection.Find(n => n.UserId == userId || n.UserId == "ALL")
            .SortByDescending(n => n.CreatedAt)
            .Limit(50)
            .ToListAsync();

        return Ok(notifications);
    }

    [Authorize]
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(string id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
        await _notificationsCollection.UpdateOneAsync(n => n.Id == id && (n.UserId == userId || n.UserId == "ALL"), update);
        
        return Ok(new { message = "Đã đánh dấu đọc" });
    }

    // -- ADMIN APIs --

    public class CreateNotificationRequest
    {
        public string Target { get; set; } = null!; // "ALL", "VIP", or userId
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Link { get; set; }
    }

    [Authorize]
    [HttpPost("admin")]
    public async Task<IActionResult> SendNotification([FromBody] CreateNotificationRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !MongoDB.Bson.ObjectId.TryParse(userId, out _)) return Unauthorized();
        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null || user.Role != "Admin") return Forbid();

        var notifications = new List<Notification>();

        if (request.Target == "ALL")
        {
            // Gửi cho tất cả (tạo 1 bản ghi chung ALL)
            notifications.Add(new Notification
            {
                UserId = "ALL",
                Title = request.Title,
                Message = request.Message,
                Link = request.Link
            });
        }
        else if (request.Target == "VIP")
        {
            // Lấy tất cả VIP và insert
            var vips = await _usersCollection.Find(u => u.Role == "VIP").ToListAsync();
            foreach (var vip in vips)
            {
                notifications.Add(new Notification
                {
                    UserId = vip.Id!,
                    Title = request.Title,
                    Message = request.Message,
                    Link = request.Link
                });
            }
        }
        else
        {
            // Gửi cá nhân
            notifications.Add(new Notification
            {
                UserId = request.Target,
                Title = request.Title,
                Message = request.Message,
                Link = request.Link
            });
        }

        if (notifications.Any())
        {
            await _notificationsCollection.InsertManyAsync(notifications);
        }

        return Ok(new { message = "Đã gửi thông báo thành công!" });
    }

    [Authorize]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminNotifications()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !MongoDB.Bson.ObjectId.TryParse(userId, out _)) return Unauthorized();
        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null || user.Role != "Admin") return Forbid();

        // Admin xem tất cả các thông báo đã gửi
        var notifications = await _notificationsCollection.Find(_ => true)
            .SortByDescending(n => n.CreatedAt)
            .Limit(100)
            .ToListAsync();

        return Ok(notifications);
    }

    [Authorize]
    [HttpPost("admin/trigger-reminders")]
    public async Task<IActionResult> TriggerReminders([FromServices] IServiceProvider serviceProvider)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !MongoDB.Bson.ObjectId.TryParse(userId, out _)) return Unauthorized();
        var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null || user.Role != "Admin") return Forbid();

        try
        {
            var reminderServices = serviceProvider.GetServices<IHostedService>()
                .OfType<backend.Services.StatementReminderService>();
            
            var reminderService = reminderServices.FirstOrDefault();
            if (reminderService != null)
            {
                await reminderService.RunReminderJobAsync();
                return Ok(new { message = "Đã chạy lệnh quét nhắc nhở thành công!" });
            }
            return StatusCode(500, new { message = "Không tìm thấy StatementReminderService." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
