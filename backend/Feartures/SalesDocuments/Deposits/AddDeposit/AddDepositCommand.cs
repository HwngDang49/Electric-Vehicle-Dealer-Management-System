using System.Text.Json.Serialization;
using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.SalesDocuments.Deposits.AddDeposit
{
    public sealed class AddDepositCommand : IRequest<Result<long>>, ITransactionalRequest
    {
        [JsonIgnore]
        public long SalesDocId { get; set; }

        [JsonIgnore]
        public long DealerId { get; set; }

        // Dữ liệu từ form của UI
        public decimal Amount { get; set; }
        public string? ReferenceNo { get; set; }
    }
}
