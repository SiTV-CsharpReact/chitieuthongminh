using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Category
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = null!;
    public string Color { get; set; } = "#3b82f6"; // Default blue
    public string? Icon { get; set; } = "category"; // Default icon
    public List<string> MccCodes { get; set; } = new List<string>();
    public bool IsFrequent { get; set; } = false;
}
