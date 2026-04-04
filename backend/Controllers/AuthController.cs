using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IMongoCollection<User> _usersCollection;

    public AuthController(IConfiguration configuration, IMongoClient mongoClient)
    {
        _configuration = configuration;
        var database = mongoClient.GetDatabase(_configuration["DatabaseName"]);
        _usersCollection = database.GetCollection<User>("Users");
    }

    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // HARDCODED ADMIN (Fix Cứng)
        if (request.Email == "admin@zenith.com" && request.Password == "admin123")
        {
            var token = GenerateJwtToken("admin_fixed_id", "Admin Zenith", request.Email, "Admin", "https://i.pravatar.cc/150?u=admin");
            return Ok(new { token });
        }

        // Dành cho các user thường thông qua DB (Tương lai mở rộng)
        var user = await _usersCollection.Find(u => u.Email == request.Email).FirstOrDefaultAsync();

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác!" });
        }

        var dbToken = GenerateJwtToken(user.Id!, user.Name, user.Email, user.Role, user.Avatar);
        return Ok(new { token = dbToken });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var avatar = User.FindFirst("Avatar")?.Value;

        if (id == null) return Unauthorized();

        return Ok(new
        {
            id,
            email,
            name,
            role,
            avatar
        });
    }

    private string GenerateJwtToken(string id, string name, string email, string role, string? avatar)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryDays = _configuration.GetValue<int>("Jwt:ExpireDays", 7);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, id),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        if (!string.IsNullOrEmpty(avatar))
        {
            claims.Add(new Claim("Avatar", avatar));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
