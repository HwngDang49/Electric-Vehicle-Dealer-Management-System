using Ardalis.Result;
using backend.Common.Markers;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Branches.Create
{
    public sealed class CreateBranchCommand : IRequest<Result<CreateBranchResponse>>, ITransactionalRequest
    {
        public long DealerId { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Address { get; set; }
        public BranchStatus? Status { get; set; }
    }
}
