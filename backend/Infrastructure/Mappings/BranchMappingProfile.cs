using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Branches.Create;
using backend.Feartures.Branches.GetBranch;
using backend.Feartures.Branches.GetListBranch;
using backend.Feartures.Branches.Update;
using backend.Feartures.Dealers.GetList;

namespace backend.Infrastructure.Mappings
{
    public class BranchMappingProfile : Profile
    {
        public BranchMappingProfile()
        {
            // Entity -> DTO (đọc)
            CreateMap<Branch, GetBranchDetailDto>();
            CreateMap<Branch, GetListBranchDto>();

            // Request -> Entity (tạo)
            CreateMap<CreateBranchCommand, Branch>()
                .ForMember(b => b.Status, option => option.MapFrom(src => src.Status.ToString()))
                .ForMember(b => b.CreatedAt, option => option.Ignore())
                .ForMember(b => b.UpdatedAt, option => option.Ignore())
                .ForMember(b => b.BranchId, option => option.Ignore())
                .ForMember(b => b.DealerId, option => option.MapFrom(d => d.DealerId));

            // Request -> Entity (cập nhật)
            CreateMap<UpdateBranchRequest, Branch>()
                .ForMember(b => b.BranchId, opt => opt.Ignore())
                .ForMember(b => b.DealerId, opt => opt.Ignore())
                .ForMember(b => b.CreatedAt, opt => opt.Ignore())
                .ForMember(b => b.UpdatedAt, opt => opt.Ignore())
                .ForMember(b => b.Dealer, opt => opt.Ignore())
                .ForMember(b => b.Inventories, opt => opt.Ignore())
                .ForMember(b => b.PurchaseOrders, opt => opt.Ignore())
                .ForMember(b => b.Users, opt => opt.Ignore());

        }
    }
}
