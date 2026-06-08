using System;
using System.Collections.Generic;
using System.Linq;

namespace backend.ML;

public class ID3Engine
{
    // Calculates Entropy of a set of instances
    public double CalculateEntropy(List<TrainingInstance> instances)
    {
        if (instances.Count == 0) return 0;

        var classCounts = instances.GroupBy(i => i.TargetClass).Select(g => g.Count()).ToList();
        double total = instances.Count;
        double entropy = 0;

        foreach (var count in classCounts)
        {
            double p = count / total;
            entropy -= p * Math.Log(p, 2);
        }

        return entropy;
    }

    // Calculates Information Gain for a specific attribute
    public double CalculateInformationGain(List<TrainingInstance> instances, string attribute, double baseEntropy)
    {
        var subsets = instances.GroupBy(i => i.Attributes.ContainsKey(attribute) ? i.Attributes[attribute] : "").ToList();
        double total = instances.Count;
        double subsetEntropy = 0;

        foreach (var subset in subsets)
        {
            double p = subset.Count() / total;
            subsetEntropy += p * CalculateEntropy(subset.ToList());
        }

        return baseEntropy - subsetEntropy;
    }

    // Recursively builds the ID3 decision tree
    public ID3TreeNode BuildTree(List<TrainingInstance> instances, List<string> availableAttributes, string? parentBranchValue = null)
    {
        var node = new ID3TreeNode { BranchValue = parentBranchValue };

        // 1. If all instances have the same class, return a leaf node
        if (instances.Select(i => i.TargetClass).Distinct().Count() == 1)
        {
            node.Label = instances.First().TargetClass;
            return node;
        }

        // 2. If no attributes left, return leaf node with majority class
        if (availableAttributes.Count == 0)
        {
            node.Label = GetMajorityClass(instances);
            return node;
        }

        // 3. Find the best attribute to split on (max Information Gain)
        double baseEntropy = CalculateEntropy(instances);
        string bestAttribute = "";
        double maxGain = -1;

        foreach (var attr in availableAttributes)
        {
            double gain = CalculateInformationGain(instances, attr, baseEntropy);
            if (gain > maxGain)
            {
                maxGain = gain;
                bestAttribute = attr;
            }
        }

        // If no gain, just return majority class
        if (maxGain <= 0 || string.IsNullOrEmpty(bestAttribute))
        {
            node.Label = GetMajorityClass(instances);
            return node;
        }

        node.SplitAttribute = bestAttribute;

        // 4. Split the instances and create child nodes
        var attributeValues = instances.Select(i => i.Attributes.ContainsKey(bestAttribute) ? i.Attributes[bestAttribute] : "").Distinct().ToList();
        var remainingAttributes = availableAttributes.Where(a => a != bestAttribute).ToList();

        foreach (var val in attributeValues)
        {
            var subset = instances.Where(i => (i.Attributes.ContainsKey(bestAttribute) ? i.Attributes[bestAttribute] : "") == val).ToList();
            if (subset.Count == 0)
            {
                // Empty subset -> create leaf with majority class of parent
                node.Children.Add(new ID3TreeNode { BranchValue = val, Label = GetMajorityClass(instances) });
            }
            else
            {
                // Recursive call
                node.Children.Add(BuildTree(subset, remainingAttributes, val));
            }
        }

        return node;
    }

    private string GetMajorityClass(List<TrainingInstance> instances)
    {
        return instances.GroupBy(i => i.TargetClass)
                        .OrderByDescending(g => g.Count())
                        .First().Key;
    }

    // Inference: Predict class for a new input instance
    public string Predict(ID3TreeNode node, Dictionary<string, string> input)
    {
        if (node.IsLeaf) return node.Label ?? "Unknown";

        if (node.SplitAttribute != null && input.ContainsKey(node.SplitAttribute))
        {
            string val = input[node.SplitAttribute];
            var child = node.Children.FirstOrDefault(c => c.BranchValue == val);
            if (child != null)
            {
                return Predict(child, input);
            }
        }

        // Fallback to majority child if exact match not found (handling unseen data)
        var majorityChild = node.Children.OrderByDescending(c => CountLeaves(c)).FirstOrDefault();
        if (majorityChild != null) return Predict(majorityChild, input);
        
        return "Unknown";
    }
    
    private int CountLeaves(ID3TreeNode node)
    {
        if (node.IsLeaf) return 1;
        return node.Children.Sum(c => CountLeaves(c));
    }
}
