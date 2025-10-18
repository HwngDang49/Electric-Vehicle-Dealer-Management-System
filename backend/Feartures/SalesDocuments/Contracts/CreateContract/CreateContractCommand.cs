using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    public sealed class CreateContractCommand : IRequest<Result<string>>
    {
        public long OrderId { get; set; }

        // Chỉ giữ lại FileUrl, SignedAt đã được chuyển sang feature MarkAsSigned
        public string? ContractFileUrl { get; set; }
        public decimal RequiredDepositAmount { get; set; }
    }
}
