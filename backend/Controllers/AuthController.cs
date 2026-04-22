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

    public class RegisterRequest
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class GoogleAuthRequest
    {
        public string AccessToken { get; set; } = null!;
    }

    public class FacebookAuthRequest
    {
        public string AccessToken { get; set; } = null!;
    }
    
    public class FacebookUser
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public FacebookPicture? Picture { get; set; }
    }
    public class FacebookPicture { public FacebookPictureData? Data { get; set; } }
    public class FacebookPictureData { public string Url { get; set; } = null!; }

    public class GoogleUserInfo
    {
        public string Sub { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Picture { get; set; }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _usersCollection.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email này đã được sử dụng!" });
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User",
            Avatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(request.Name)}&background=random"
        };

        await _usersCollection.InsertOneAsync(user);

        var token = GenerateJwtToken(user.Id!, user.Name, user.Email, user.Role, user.Avatar);
        return Ok(new { token });
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

    [HttpPost("google")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        try
        {
            using var client = new HttpClient();
            var response = await client.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.AccessToken}");
            if (!response.IsSuccessStatusCode)
                return BadRequest(new { message = "Xác thực Google thất bại!" });

            var payload = await response.Content.ReadFromJsonAsync<GoogleUserInfo>();
            if (payload == null || string.IsNullOrEmpty(payload.Email))
                return BadRequest(new { message = "Không thể lấy email từ Google!" });
            
            var user = await _usersCollection.Find(u => u.Email == payload.Email).FirstOrDefaultAsync();

            if (user == null)
            {
                user = new User
                {
                    Name = payload.Name,
                    Email = payload.Email,
                    Role = "User",
                    Provider = "Google",
                    ProviderId = payload.Sub,
                    Avatar = payload.Picture ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(payload.Name)}&background=random"
                };
                await _usersCollection.InsertOneAsync(user);
            }
            // Link existing account
            else if (user.Provider == "Local")
            {
                var update = Builders<User>.Update
                    .Set(u => u.Provider, "Google")
                    .Set(u => u.ProviderId, payload.Sub)
                    .Set(u => u.Avatar, user.Avatar ?? payload.Picture);
                await _usersCollection.UpdateOneAsync(u => u.Id == user.Id, update);
            }

            var token = GenerateJwtToken(user.Id!, user.Name, user.Email, user.Role, user.Avatar);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Xác thực Google thất bại!", error = ex.Message });
        }
    }

    [HttpPost("facebook")]
    public async Task<IActionResult> FacebookAuth([FromBody] FacebookAuthRequest request)
    {
        try
        {
            using var client = new HttpClient();
            var response = await client.GetAsync($"https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&access_token={request.AccessToken}");
            if (!response.IsSuccessStatusCode)
                return BadRequest(new { message = "Xác thực Facebook thất bại!" });

            var fbUser = await response.Content.ReadFromJsonAsync<FacebookUser>();
            if (fbUser == null || string.IsNullOrEmpty(fbUser.Email))
                return BadRequest(new { message = "Không thể lấy email từ Facebook. Vui lòng cấp quyền truy cập email!" });

            var user = await _usersCollection.Find(u => u.Email == fbUser.Email).FirstOrDefaultAsync();

            if (user == null)
            {
                user = new User
                {
                    Name = fbUser.Name,
                    Email = fbUser.Email,
                    Role = "User",
                    Provider = "Facebook",
                    ProviderId = fbUser.Id,
                    Avatar = fbUser.Picture?.Data?.Url ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(fbUser.Name)}&background=random"
                };
                await _usersCollection.InsertOneAsync(user);
            }
            else if (user.Provider == "Local")
            {
                var update = Builders<User>.Update
                    .Set(u => u.Provider, "Facebook")
                    .Set(u => u.ProviderId, fbUser.Id)
                    .Set(u => u.Avatar, user.Avatar ?? fbUser.Picture?.Data?.Url);
                await _usersCollection.UpdateOneAsync(u => u.Id == user.Id, update);
            }

            var token = GenerateJwtToken(user.Id!, user.Name, user.Email, user.Role, user.Avatar);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Xác thực Facebook thất bại!", error = ex.Message });
        }
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
