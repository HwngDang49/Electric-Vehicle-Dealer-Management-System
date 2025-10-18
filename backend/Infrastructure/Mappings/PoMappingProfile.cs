using AutoMapper;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Feartures.PurchaseOrders.Create;
using backend.Feartures.PurchaseOrders.GetPo;
using backend.Feartures.PurchaseOrders.Submit;

namespace backend.Infrastructure.Mappings
{
    public class PoMappingProfile : Profile
    {
        public PoMappingProfile()
        {
            // DTO -> Entity (cho Create)

            CreateMap<CreatePoRequest, PurchaseOrder>()
                .ForMember(p => p.PoId, o => o.Ignore())
                .ForMember(p => p.Status, o => o.MapFrom(s => POStatus.Draft.ToString()))
            //.ForMember(p => p.PoItems, o => o.MapFrom())
            ;

            CreateMap<CreatePoItem, PoItem>()
                .ForMember(p => p.Qty, o => o.MapFrom(s => s.Qty))
                .ForMember(p => p.LineTotal, o => o.Ignore())
                ;


            // Entity -> DTO (GET)
            CreateMap<PurchaseOrder, GetPoDetailDto>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.SubmittedByUserId, o => o.MapFrom(s => s.SubmittedBy))
                .ForMember(d => d.Items, o => o.MapFrom(s => s.PoItems))
            ;

            // PoItem -> PoItemDto
            CreateMap<PoItem, PoItemDto>()
                .ForMember(d => d.UnitPrice, o => o.MapFrom(s => s.UnitWholesale))
                .ForMember(d => d.Quantity, o => o.MapFrom(s => s.Qty))
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
                .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.UnitWholesale * s.Qty));
        }
    }
}
