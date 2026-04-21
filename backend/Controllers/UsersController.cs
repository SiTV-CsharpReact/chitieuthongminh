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
            u.Avatar
        });

        return Ok(userDTOs);
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
        if (result.DeletedCount == 0)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        return Ok(new { message = "Xoá người dùng thành công" });
    }
}
