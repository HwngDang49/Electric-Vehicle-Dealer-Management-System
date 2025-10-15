using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Pricebooks.Create;
using Microsoft.OpenApi.Extensions;

namespace backend.Infrastructure.Mappings
{
    public class PricebookMappingProfile : Profile
    {
        public PricebookMappingProfile()
        {
            CreateMap<CreatePricebookRequest, Pricebook>()
                .ForMember(p => p.ProductId, o => o.MapFrom(s => s.ProductId))
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.MsrpPrice, o => o.MapFrom(s => s.MsrpPrice))
                .ForMember(p => p.FloorPrice, o => o.MapFrom(s => s.FloorPrice))
                .ForMember(P => P.Status, o => o.MapFrom(s => s.Status.ToString()))
                ;
        }
    }
}
