using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    public sealed class CreateContractCommand : IRequest<Result<string>>
    {
        [JsonIgnore]
        public long DealerId { get; set; }

        public long SalesDocId { get; set; }

        public string? ContractFileUrl { get; set; }
        public DateTime? SignedAt { get; set; }
    }
}
