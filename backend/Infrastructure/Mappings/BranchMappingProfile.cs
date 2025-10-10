using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Branches.Create;
using backend.Feartures.Dealers.GetList;

namespace backend.Infrastructure.Mappings
{
    public class BranchMappingProfile : Profile
    {
        public BranchMappingProfile()
        {
            // Entity -> DTO (đọc)

            // Request -> Entity (tạo)
            CreateMap<CreateBranchRequest, Branch>()
                .ForMember(b => b.Status, option => option.MapFrom(src => src.Status.ToString()))
                .ForMember(b => b.CreatedAt, option => option.Ignore())
                .ForMember(b => b.UpdatedAt, option => option.Ignore())
                .ForMember(b => b.BranchId, option => option.Ignore())
                .ForMember(b => b.DealerId, option => option.MapFrom(d => d.DealerId));
         

        }
    }
}
