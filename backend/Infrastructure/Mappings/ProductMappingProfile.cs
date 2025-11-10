using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Products.Create;
using backend.Feartures.Products.Get;
using backend.Feartures.Products.GetList;
using backend.Feartures.Products.GetAllProducts;

namespace backend.Infrastructure.Mappings
{
    public class ProductMappingProfile : Profile
    {
        public ProductMappingProfile()
        {
            // entity -> get
            CreateMap<Product, GetProductQuery>()
                .ForMember(p => p.ProductId, o => o.MapFrom(s => s.ProductId))
                .ForMember(p => p.ProductCode, o => o.MapFrom(s => s.ProductId.ToString()))
                .ForMember(p => p.ModelCode, o => o.MapFrom(s => s.ModelCode))
                .ForMember(p => p.ModelName, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.ColorCode, o => o.MapFrom(s => s.ColorCode))
                .ForMember(p => p.ColorName, o => o.MapFrom(s => s.ColorName))
                .ForMember(p => p.ImageUrl, o => o.MapFrom(s => s.ImageUrl))
                .ForMember(p => p.BatteryKwh, o => o.MapFrom(s => s.BatteryKwh))
                .ForMember(p => p.MotorKw, o => o.MapFrom(s => s.MotorKw))
                .ForMember(p => p.RangeKm, o => o.MapFrom(s => s.RangeKm))
                .ForMember(p => p.Status, o => o.MapFrom(s => s.Status))
                .ForMember(p => p.CreateAt, o => o.MapFrom(s => s.CreatedAt))
                .ForMember(p => p.UpdatedAt, o => o.MapFrom(s => s.UpdatedAt))
                ;

            // entity -> get list
            CreateMap<Product, GetListProductQuery>()
                .ForMember(p => p.ProductId, o => o.MapFrom(s => s.ProductId))
                .ForMember(p => p.ModelCode, o => o.MapFrom(s => s.ModelCode))
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.VariantCode, o => o.MapFrom(s => s.VariantCode))
                .ForMember(p => p.ColorCode, o => o.MapFrom(s => s.ColorCode))
                .ForMember(p => p.ColorName, o => o.MapFrom(s => s.ColorName))
                .ForMember(p => p.ImageUrl, o => o.MapFrom(s => s.ImageUrl))
                .ForMember(p => p.BatteryKwh, o => o.MapFrom(s => s.BatteryKwh))
                .ForMember(p => p.MotorKw, o => o.MapFrom(s => s.MotorKw))
                .ForMember(p => p.RangeKm, o => o.MapFrom(s => s.RangeKm))
                .ForMember(p => p.Status, o => o.MapFrom(s => s.Status))
                .ForMember(p => p.CreatedAt, o => o.MapFrom(s => s.CreatedAt))
                .ForMember(p => p.UpdatedAt, o => o.MapFrom(s => s.UpdatedAt))
                ;

            // entity -> get all products
            CreateMap<Product, GetAllProductsQuery>()
                .ForMember(p => p.ProductId, o => o.MapFrom(s => s.ProductId))
                .ForMember(p => p.ModelCode, o => o.MapFrom(s => s.ModelCode))
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.VariantCode, o => o.MapFrom(s => s.VariantCode))
                .ForMember(p => p.ColorCode, o => o.MapFrom(s => s.ColorCode))
                .ForMember(p => p.ColorName, o => o.MapFrom(s => s.ColorName))
                .ForMember(p => p.ImageUrl, o => o.MapFrom(s => s.ImageUrl))
                .ForMember(p => p.BatteryKwh, o => o.MapFrom(s => s.BatteryKwh))
                .ForMember(p => p.MotorKw, o => o.MapFrom(s => s.MotorKw))
                .ForMember(p => p.RangeKm, o => o.MapFrom(s => s.RangeKm))
                .ForMember(p => p.Status, o => o.MapFrom(s => s.Status))
                .ForMember(p => p.CreatedAt, o => o.MapFrom(s => s.CreatedAt))
                ;

            // Create -> entity

            CreateMap<CreateProductRequest, Product>()
                .ForMember(p => p.ModelCode, o => o.MapFrom(s => s.ModelCode))
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.VariantCode, o => o.MapFrom(s => s.VariantCode))
                .ForMember(p => p.ColorCode, o => o.MapFrom(s => s.ColorCode))
                .ForMember(p => p.ColorName, o => o.MapFrom(s => s.ColorName))
                .ForMember(p => p.ImageUrl, o => o.MapFrom(s => s.ImageUrl))
                .ForMember(p => p.MotorKw, o => o.MapFrom(s => s.MotorKw))
                .ForMember(p => p.BatteryKwh, o => o.MapFrom(s => s.BatteryKwh))
                .ForMember(p => p.RangeKm, o => o.MapFrom(s => s.RangeKm))
            ;
        }
    }
}
