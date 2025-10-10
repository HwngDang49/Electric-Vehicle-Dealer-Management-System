using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Dealers.Create;
using backend.Feartures.Dealers.GetDealer;
using backend.Feartures.Dealers.GetList;
using backend.Feartures.Dealers.Update;

namespace backend.Infrastructure.Mappings
{
    public class DealerMappingProfile : Profile
    {
        public DealerMappingProfile()
        {
            // Entity -> DTO (đọc)
            CreateMap<Dealer, GetDealersDto>();
            CreateMap<Dealer, GetDealerDetailDto>();

            // Request -> Entity (tạo)
            CreateMap<CreateDealerRequest, Dealer>()
                .ForMember(d => d.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(d => d.CreatedAt, opt => opt.Ignore())
                .ForMember(d => d.UpdatedAt, opt => opt.Ignore())
                .ForMember(d => d.DealerId, opt => opt.Ignore())
                ;

            // Request (PATCH) -> Entity (cập nhật chọn lọc, bỏ qua null)
            CreateMap<UpdateDealerRequest, Dealer>()
                .ForMember(d => d.DealerId, opt => opt.Ignore())
                .ForMember(d => d.CreatedAt, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
