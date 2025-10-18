using Ardalis.Result;
using backend.Common.Markers;
using MediatR;
using System.Text.Json.Serialization;

namespace backend.Feartures.SalesDocuments.Orders.ConfirmOrders
{
    public sealed class ConfirmOrderCommand : IRequest<Result>, ITransactionalRequest
    {
        [JsonIgnore]
        public long OrderId { get; set; }

        [JsonIgnore]
        public long DealerId { get; set; }
    }
}
