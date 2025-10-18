using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Pricebooks.Create;
using backend.Feartures.Pricebooks.Get;
using backend.Feartures.Pricebooks.Update;
using backend.Feartures.Products.NewFolder;
using Microsoft.OpenApi.Extensions;

namespace backend.Infrastructure.Mappings
{
    public class PricebookMappingProfile : Profile
    {
        public PricebookMappingProfile()
        {


            CreateMap<CreatePricebookRequest, Pricebook>()
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.Status, o => o.MapFrom(s => s.Status.ToString()))
                ;

            CreateMap<Pricebook, GetPricebookQuery>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status))
                .ForMember(d => d.EffectiveTo, o => o.MapFrom(s => s.EffectiveTo))
                ;


            // update từ request -> entity
            CreateMap<UpdatePricebookRequest, Pricebook>()
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.EffectiveTo, o => o.MapFrom(s => s.EffectiveTo))
                ;

            // Map từ Entity -> DTO (để TRẢ VỀ)
            CreateMap<Pricebook, UpdatePricebookRequest>();

            CreateMap<Product, GetListProductQuery>();
        }
    }
}
