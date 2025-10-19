using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Pricebooks.Create;
using backend.Feartures.Pricebooks.Get;
using backend.Feartures.Pricebooks.GetActive;
using backend.Feartures.Pricebooks.Update;
using backend.Feartures.Products.GetList;
using Microsoft.OpenApi.Extensions;

namespace backend.Infrastructure.Mappings
{
    public class PricebookMappingProfile : Profile
    {
        public PricebookMappingProfile()
        {


            CreateMap<CreatePricebookRequest, Pricebook>()
                .ForMember(p => p.PricebookId, o => o.Ignore())
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.Status, o => o.MapFrom(s => s.Status.ToString()))
                ;

            // Create PricebookItem mapping
            CreateMap<PricebookItemUpsertDto, PricebookItem>()
                .ForMember(pi => pi.PricebookItemId, o => o.Ignore()) // Auto-generated
                .ForMember(pi => pi.PricebookId, o => o.Ignore()) // Will be set in handler
                .ForMember(pi => pi.ProductId, o => o.MapFrom(s => s.ProductId))
                .ForMember(pi => pi.MsrpPrice, o => o.MapFrom(s => s.MsrpPrice))
                .ForMember(pi => pi.FloorPrice, o => o.MapFrom(s => s.FloorPrice))
                .ForMember(pi => pi.OemDiscountAmount, o => o.MapFrom(s => s.OemDiscountAmount))
                .ForMember(pi => pi.OemDiscountPercent, o => o.MapFrom(s => s.OemDiscountPercent))
                .ForMember(pi => pi.CreatedAt, o => o.Ignore()) // Will be set in handler
                .ForMember(pi => pi.Pricebook, o => o.Ignore())
                .ForMember(pi => pi.Product, o => o.Ignore());

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
                CreateMap<Product, backend.Feartures.Products.GetAllProducts.GetAllProductsQuery>();

            // GetActivePricebook mappings
            CreateMap<Pricebook, GetActivePricebookQuery>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status))
                .ForMember(d => d.EffectiveTo, o => o.MapFrom(s => s.EffectiveTo));

            CreateMap<PricebookItem, GetActivePricebookItemQuery>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
                .ForMember(d => d.ModelCode, o => o.MapFrom(s => s.Product.ModelCode))
                .ForMember(d => d.VariantCode, o => o.MapFrom(s => s.Product.VariantCode));

        }
    }
}
