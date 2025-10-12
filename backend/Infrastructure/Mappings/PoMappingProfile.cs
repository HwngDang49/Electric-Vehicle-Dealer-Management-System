using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.PurchaseOrders.Create;

namespace backend.Infrastructure.Mappings
{
    public class PoMappingProfile : Profile
    {
        public PoMappingProfile()
        {

            CreateMap<CreatePoRequest, Dealer>();


            CreateMap<CreatePoRequest, PurchaseOrder>()
                .ForMember(d => d.DealerId, option => option.Ignore())
                .ForMember(b => b.BranchId, option => option.Ignore())
                .ForMember(po => po.Status, option => option.MapFrom(s => s.Status.ToString()))
                .ForMember(p => p.CreatedAt, option => option.Ignore())
                .ForMember(p => p.UpdatedAt, option => option.Ignore())

            ;

        }
    }
}
