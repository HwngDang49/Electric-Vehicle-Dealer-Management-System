using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Inventories.Create;

namespace backend.Infrastructure.Mappings
{
    public class InventoryMappingProfile : Profile
    {
        public InventoryMappingProfile()
        {
            // CreateInventoryRequest -> Inventory
            CreateMap<CreateInventoryRequest, Inventory>()
                .ForMember(i => i.ProductId, o => o.MapFrom(s => s.ProductId))
                .ForMember(i => i.Status, o => o.MapFrom(s => s.Status.ToString()))
                // Ignore các field sẽ được set trong handler
                .ForMember(i => i.OwnerType, o => o.Ignore())
                .ForMember(i => i.OwnerId, o => o.Ignore())
                .ForMember(i => i.LocationType, o => o.Ignore())
                .ForMember(i => i.DealerId, o => o.Ignore())
                .ForMember(i => i.BranchId, o => o.Ignore())
                .ForMember(i => i.ReceivedAt, o => o.Ignore())
                .ForMember(i => i.OrderId, o => o.Ignore())
                .ForMember(i => i.PoId, o => o.Ignore())
                .ForMember(i => i.CreatedAt, o => o.Ignore())
                // Ignore navigation properties
                .ForMember(i => i.Branch, o => o.Ignore())
                .ForMember(i => i.Dealer, o => o.Ignore())
                .ForMember(i => i.Order, o => o.Ignore())
                .ForMember(i => i.PurchaseOrder, o => o.Ignore())
                .ForMember(i => i.Product, o => o.Ignore());
        }
    }
}
