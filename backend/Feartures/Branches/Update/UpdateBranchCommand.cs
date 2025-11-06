using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.Branches.Update;

public record UpdateBranchCommand(long BranchId, UpdateBranchRequest Body) : IRequest<Result<UpdateBranchResponse>>, ITransactionalRequest;


