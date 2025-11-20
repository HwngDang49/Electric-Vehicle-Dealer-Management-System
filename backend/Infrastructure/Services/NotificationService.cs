using Microsoft.AspNetCore.SignalR;
using backend.Infrastructure.Hubs;

namespace backend.Infrastructure.Services
{
    /// <summary>
    /// Service for sending real-time notifications via SignalR
    /// </summary>
    public class NotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        /// <summary>
        /// Notify dealer when VIN becomes available for backordered orders
        /// </summary>
        public async Task NotifyVinAvailableForDealer(long dealerId, string vin, long productId, long? orderId = null)
        {
            await _hubContext.Clients
                .Group($"dealer-{dealerId}")
                .SendAsync("VinAvailable", new
                {
                    Vin = vin,
                    ProductId = productId,
                    OrderId = orderId,
                    Timestamp = DateTime.UtcNow
                });
        }

        /// <summary>
        /// Notify dealer about new VINs received (when delivery is confirmed)
        /// </summary>
        public async Task NotifyVinsReceived(long dealerId, int vinCount, List<string> vins)
        {
            await _hubContext.Clients
                .Group($"dealer-{dealerId}")
                .SendAsync("VinsReceived", new
                {
                    VinCount = vinCount,
                    Vins = vins,
                    Timestamp = DateTime.UtcNow
                });
        }
    }
}
