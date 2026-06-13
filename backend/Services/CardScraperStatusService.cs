using System.Text.Json;

namespace backend.Services;

public class CardScraperStatusService
{
    public bool IsRunning { get; set; } = false;
    public int TotalBanks { get; set; } = 0;
    public int ProcessedBanks { get; set; } = 0;
    public string CurrentBank { get; set; } = "";
    public int NewCardsFound { get; set; } = 0;
    public DateTime? LastRunTime { get; set; }

    public void Reset(int totalBanks)
    {
        IsRunning = true;
        TotalBanks = totalBanks;
        ProcessedBanks = 0;
        NewCardsFound = 0;
        CurrentBank = "";
    }

    public void IncrementProcessed()
    {
        ProcessedBanks++;
    }

    public void Finish()
    {
        IsRunning = false;
        LastRunTime = DateTime.UtcNow;
    }
}
