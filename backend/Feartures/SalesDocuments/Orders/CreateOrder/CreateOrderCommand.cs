using System.Text.Json.Serialization;
using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.CreateOrder
{
    /// <summary>
    /// Command để tạo một Đơn hàng (Order) trực tiếp không qua Báo giá.
    /// </summary>
    public sealed class CreateOrderCommand : IRequest<Result<CreateOrderResponse>>, ITransactionalRequest
    {
        [JsonIgnore]
        public long DealerId { get; set; }

        public long CustomerId { get; set; }
        public long ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public sealed class CreateOrderResponse
    {
        public long OrderId { get; set; }

        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

    }
}
