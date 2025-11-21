using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.PurchaseOrders.Cancel
{
    public sealed class CancelPurchaseOrderCommand : IRequest<Result>
    {
        [JsonIgnore]
        public long PoId { get; set; } // Lấy từ route URL

        [JsonIgnore]
        public long DealerId { get; set; } // Lấy từ JWT Token
    }
}

