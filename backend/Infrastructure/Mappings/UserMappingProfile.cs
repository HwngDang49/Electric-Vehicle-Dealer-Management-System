using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Users;
using backend.Feartures.Users.GetUser;
namespace backend.Infrastructure.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {

            // Entity -> DTO (đọc)

            CreateMap<User, GetUserDto>();



            // Request -> Entity (tạo)
            CreateMap<CreateUserRequest, User>()
                .ForMember(u => u.UserId, option => option.Ignore())
                .ForMember(u => u.Role, option => option.MapFrom(r => r.Role.ToString()))
                .ForMember(u => u.DealerId, option => option.MapFrom(d => d.DealerId))
                .ForMember(u => u.BranchId, option => option.MapFrom(b => b.BranchId))
                .ForMember(u => u.PasswordHash, o => o.Ignore());

            ;
        }
    }
}
