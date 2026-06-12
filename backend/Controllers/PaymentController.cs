using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly VNPayService _vnPayService;
    private readonly IMongoCollection<User> _usersCollection;

    public PaymentController(VNPayService vnPayService, IConfiguration configuration, IMongoClient mongoClient)
    {
        _vnPayService = vnPayService;
        var database = mongoClient.GetDatabase(configuration["DatabaseName"]);
        _usersCollection = database.GetCollection<User>("Users");
    }

    [Authorize]
    [HttpPost("vnpay/create")]
    public IActionResult CreatePaymentUrl()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // 30,000 VND for VIP (1 month)
        var url = _vnPayService.CreatePaymentUrl(HttpContext, userId, 30000);
        return Ok(new { url });
    }

    // IPN (Webhook) is called by VNPay server, so it should not require authorization
    [HttpGet("vnpay/ipn")]
    public async Task<IActionResult> VnpayIpn()
    {
        try
        {
            var isValidSignature = _vnPayService.ValidateSignature(Request.Query, out string txnRef, out string responseCode);

            if (isValidSignature)
            {
                if (responseCode == "00") // Success
                {
                    // TxnRef format is "VIP_{userId}_{ticks}"
                    var parts = txnRef.Split('_');
                    if (parts.Length >= 2 && parts[0] == "VIP")
                    {
                        string userId = parts[1];
                        if (MongoDB.Bson.ObjectId.TryParse(userId, out _))
                        {
                            var update = Builders<User>.Update.Set(u => u.Role, "VIP");
                            await _usersCollection.UpdateOneAsync(u => u.Id == userId, update);
                        }
                        
                        return Ok(new { RspCode = "00", Message = "Confirm Success" });
                    }
                }
                else
                {
                    return Ok(new { RspCode = "00", Message = "Transaction Failed" });
                }
            }
            else
            {
                return Ok(new { RspCode = "97", Message = "Invalid Signature" });
            }
        }
        catch (Exception ex)
        {
            return Ok(new { RspCode = "99", Message = "Unknown error" });
        }

        return Ok(new { RspCode = "99", Message = "Unknown error" });
    }

    [HttpGet("vnpay/return")]
    public IActionResult VnpayReturn()
    {
        var isValidSignature = _vnPayService.ValidateSignature(Request.Query, out string txnRef, out string responseCode);
        
        // This is just a redirect to frontend. The actual upgrade logic is handled in IPN.
        // We can pass a status query param to frontend
        string returnUrl = "http://localhost:3000/settings"; // Or get from config

        if (isValidSignature && responseCode == "00")
        {
            return Redirect(returnUrl + "?payment=success");
        }
        
        return Redirect(returnUrl + "?payment=failed");
    }
}
