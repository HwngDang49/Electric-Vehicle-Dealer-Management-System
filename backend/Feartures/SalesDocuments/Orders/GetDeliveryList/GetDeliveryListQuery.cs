using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.GetDeliveryList
{
    public record GetDeliveryListQuery(
        string? Status = null,  // "allocated", "ready", "all"
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<Result<DeliveryListResponse>>;

    public class DeliveryListResponse
    {
        public List<DeliveryListItemDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }

    public class DeliveryListItemDto
    {
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        // Customer Info
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        
        // Vehicle Info
        public string VehicleName { get; set; } = string.Empty;
        public string? VehicleColor { get; set; }
        public string? Vin { get; set; }
        
        // Delivery Info
        public DateTime? ScheduledDeliveryDate { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? DeliveryContactPhone { get; set; }
        public string? ReceiverName { get; set; }
        public string? DeliveryDocUrl { get; set; }
        
        // Other
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

