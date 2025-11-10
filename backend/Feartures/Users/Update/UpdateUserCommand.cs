using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Users.Update
{
    public record UpdateUserCommand(long UserId, UpdateUserRequest Request) : IRequest<Result<UpdateUserResponse>>;
}

