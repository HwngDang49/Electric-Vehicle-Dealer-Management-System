using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Background service tự động chuyển pricebooks sang Expired khi qua effective_to
    /// Chạy mỗi 1 giờ
    /// </summary>
    public class PricebookExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PricebookExpirationService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(1); // Chạy mỗi 1 giờ

        public PricebookExpirationService(
            IServiceProvider serviceProvider,
            ILogger<PricebookExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PricebookExpirationService đã bắt đầu");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ExpirePricebooks(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi thực thi PricebookExpirationService");
                }

                // Chờ 1 giờ trước khi chạy lại
                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("PricebookExpirationService đã dừng");
        }

        private async Task ExpirePricebooks(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<EVDmsDbContext>();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Tìm tất cả pricebooks Active nhưng đã qua effective_to
            var expiredPricebooks = await dbContext.Pricebooks
                .Where(p => p.Status == PricebookStatus.Active.ToString() &&
                           p.EffectiveTo != null &&
                           p.EffectiveTo < today)
                .ToListAsync(ct);

            if (expiredPricebooks.Any())
            {
                _logger.LogInformation($"Tìm thấy {expiredPricebooks.Count} pricebook(s) cần chuyển sang Expired");

                foreach (var pricebook in expiredPricebooks)
                {
                    pricebook.Status = PricebookStatus.Expired.ToString();
                    _logger.LogInformation(
                        $"Pricebook ID {pricebook.PricebookId} ('{pricebook.Name}') đã được chuyển sang Expired " +
                        $"(EffectiveTo: {pricebook.EffectiveTo})");
                }

                await dbContext.SaveChangesAsync(ct);
            }
            else
            {
                _logger.LogDebug("Không có pricebook nào cần expire");
            }
        }
    }
}


