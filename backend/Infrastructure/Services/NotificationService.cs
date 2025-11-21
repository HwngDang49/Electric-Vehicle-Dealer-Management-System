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

        /// <summary>
        /// Notify EVM Staff when a new purchase order is submitted and needs processing
        /// </summary>
        public async Task NotifyNewPurchaseOrder(long poId, string poCode, long dealerId, string dealerName, decimal totalAmount, DateTime createdAt)
        {
            await _hubContext.Clients
                .Group("evm-staff")
                .SendAsync("NewPurchaseOrder", new
                {
                    PoId = poId,
                    PoCode = poCode,
                    DealerId = dealerId,
                    DealerName = dealerName,
                    TotalAmount = totalAmount,
                    CreatedAt = createdAt,
                    Timestamp = DateTime.UtcNow
                });
        }

        /// <summary>
        /// Notify EVM Staff when a new claim is created and needs approval
        /// </summary>
        public async Task NotifyNewClaim(long claimId, long dealerId, string dealerName, decimal amount, string period, DateTime createdAt)
        {
            var notificationData = new
            {
                ClaimId = claimId,
                DealerId = dealerId,
                DealerName = dealerName,
                Amount = amount,
                Period = period,
                CreatedAt = createdAt,
                Timestamp = DateTime.UtcNow
            };
            
            Console.WriteLine($"[NotificationService] Sending NewClaim notification to evm-staff group: ClaimId={claimId}, DealerId={dealerId}, DealerName={dealerName}, Amount={amount}, Period={period}");
            
            await _hubContext.Clients
                .Group("evm-staff")
                .SendAsync("NewClaim", notificationData);
        }
    }
}
