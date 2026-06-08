namespace backend.ML;

public class ID3TreeNode
{
    // Feature being tested at this node (e.g. "IncomeLevel" or "TopCategory")
    // Null if this is a leaf node
    public string? SplitAttribute { get; set; }
    
    // The target class if this is a leaf node (e.g. the specific Card Name)
    public string? Label { get; set; }
    
    // The value of the parent's SplitAttribute that leads to this node
    public string? BranchValue { get; set; }
    
    // Children nodes
    public List<ID3TreeNode> Children { get; set; } = new List<ID3TreeNode>();

    public bool IsLeaf => !string.IsNullOrEmpty(Label);
}
