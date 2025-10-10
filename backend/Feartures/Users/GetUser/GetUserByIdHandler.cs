using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users.GetUser
{
    public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, Result<GetUserDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        public GetUserByIdHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<GetUserDto>> Handle(GetUserByIdQuery request, CancellationToken ct)
        {
            var user = await _db.Users
                            .Where(u => u.UserId == request.UserId)
                            .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
                            .FirstOrDefaultAsync();
            if (user == null)
            {
                return Result.NotFound($"User with id {request.UserId} not found.");
            }

            return Result.Success(user);
        }
    }
}
