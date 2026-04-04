using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Email")]
    public string Email { get; set; } = null!;

    [BsonElement("PasswordHash")]
    public string PasswordHash { get; set; } = null!;

    [BsonElement("Name")]
    public string Name { get; set; } = null!;

    [BsonElement("Avatar")]
    public string? Avatar { get; set; }

    [BsonElement("Role")]
    public string Role { get; set; } = "Admin";
}
