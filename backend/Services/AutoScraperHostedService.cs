namespace backend.Services;

public class AutoScraperHostedService : BackgroundService
{
    private readonly ILogger<AutoScraperHostedService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public AutoScraperHostedService(ILogger<AutoScraperHostedService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutoScraperHostedService is starting.");

        // Wait 5 minutes on startup to not block initial load
        await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var settingsService = scope.ServiceProvider.GetRequiredService<SystemSettingsService>();
                var settings = await settingsService.GetSettingsAsync();

                var now = DateTime.UtcNow;
                bool settingsUpdated = false;

                // Check Auto Scraper (Cards)
                if (settings.IsAutoScraperEnabled)
                {
                    var lastRun = settings.LastAutoScrapeTime ?? DateTime.MinValue;
                    if ((now - lastRun).TotalHours >= settings.AutoScraperIntervalHours)
                    {
                        _logger.LogInformation("Running Auto Scraper (Cards) job...");
                        var scraperService = scope.ServiceProvider.GetRequiredService<AutoScraperService>();
                        await scraperService.RunScraperAsync();
                        
                        settings.LastAutoScrapeTime = now;
                        settingsUpdated = true;
                    }
                }

                // Check Ưu đãi thẻ tín dụng
                if (settings.IsPromoScraperEnabled)
                {
                    var lastRun = settings.LastPromoScrapeTime ?? DateTime.MinValue;
                    if ((now - lastRun).TotalHours >= settings.PromoScraperIntervalHours)
                    {
                        _logger.LogInformation("Running Ưu đãi thẻ tín dụng job...");
                        var promoScraperService = scope.ServiceProvider.GetRequiredService<PromotionScraperService>();
                        await promoScraperService.ScrapePromotionsAsync(scope.ServiceProvider);
                        
                        settings.LastPromoScrapeTime = now;
                        settingsUpdated = true;
                    }
                }

                if (settingsUpdated)
                {
                    await settingsService.UpdateSettingsAsync(settings);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in AutoScraperHostedService check loop: {ex.Message}");
            }

            // Check settings every hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }

        _logger.LogInformation("AutoScraperHostedService is stopping.");
    }
}
