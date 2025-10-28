using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users.GetListUsers
{
    public class GetListUsersHandler : IRequestHandler<GetListUsersQuery, Result<List<UserListDto>>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetListUsersHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<List<UserListDto>>> Handle(GetListUsersQuery request, CancellationToken ct)
        {
            var users = await _db.Users
                .OrderByDescending(u => u.CreateAt)
                .ProjectTo<UserListDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(users);
        }
    }
}

