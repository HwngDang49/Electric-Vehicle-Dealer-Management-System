using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Branches.Update;

public record UpdateBranchCommand(UpdateBranchRequest Request) : IRequest<Result>;


