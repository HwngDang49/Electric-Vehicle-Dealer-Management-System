using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Users;
namespace backend.Infrastructure.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {

            // Entity -> DTO (đọc)
            // Request -> Entity (tạo)
            CreateMap<CreateUserRequest, User>()
                .ForMember(u => u.CreatedAt, option => option.Ignore())
                .ForMember(u => u.UpdatedAt, option => option.Ignore())
                .ForMember(u => u.UserId, option => option.Ignore())
                .ForMember(u => u.Role, option => option.MapFrom(r => r.Role.ToString()))
                .ForMember(u => u.DealerId, option => option.MapFrom(d => d.DealerId))
                .ForMember(u => u.BranchId, option => option.MapFrom(b => b.BranchId))
                .ForMember(u => u.PasswordHash, o => o.Ignore());
            ;
        }
    }
}
