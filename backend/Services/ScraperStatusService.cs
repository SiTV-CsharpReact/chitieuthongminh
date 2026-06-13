namespace backend.Services;

public class ScraperStatusService
{
    public bool IsRunning { get; set; } = false;
    public int TotalBanks { get; set; } = 0;
    public int ProcessedBanks { get; set; } = 0;
    public string CurrentBank { get; set; } = "";
    public int NewDraftsFound { get; set; } = 0;
    public string? ErrorMessage { get; set; } = null;
    
    public void Reset(int total)
    {
        IsRunning = true;
        TotalBanks = total;
        ProcessedBanks = 0;
        CurrentBank = "Khởi tạo...";
        NewDraftsFound = 0;
        ErrorMessage = null;
    }

    public void Complete()
    {
        IsRunning = false;
        CurrentBank = "Hoàn thành";
    }

    public void Fail(string error)
    {
        IsRunning = false;
        ErrorMessage = error;
    }
}
