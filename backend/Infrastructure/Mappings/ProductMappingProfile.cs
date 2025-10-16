using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Products.Create;
using backend.Feartures.Products.Get;

namespace backend.Infrastructure.Mappings
{
    public class ProductMappingProfile : Profile
    {
        public ProductMappingProfile()
        {
            // entity -> get
            CreateMap<Product, GetProductQuery>()
                .ForMember(p => p.ProductCode, o => o.MapFrom(s => s.ProductCode))
                .ForMember(p => p.ModelCode, o => o.MapFrom(s => s.ModelCode))
                .ForMember(p => p.ModelName, o => o.MapFrom(s => s.ModelName))
                .ForMember(p => p.ColorCode, o => o.MapFrom(s => s.ColorCode))
                .ForMember(p => p.ColorName, o => o.MapFrom(s => s.ColorName))
                .ForMember(p => p.BatteryKwh, o => o.MapFrom(s => s.BatteryKwh))
                .ForMember(p => p.MotorKw, o => o.MapFrom(s => s.MotorKw))
                .ForMember(p => p.RangeKm, o => o.MapFrom(s => s.RangeKm))
                .ForMember(p => p.CreateAt, o => o.MapFrom(s => s.CreatedAt))
                ;

            // Create -> entity

            CreateMap<CreateProductRequest, Product>()
                .ForMember(p => p.ModelCode, o => o.MapFrom(s => s.ModelCode))
                .ForMember(p => p.ModelName, o => o.MapFrom(s => s.ModelName))
                .ForMember(p => p.Name, o => o.MapFrom(s => s.Name))
                .ForMember(p => p.ColorCode, o => o.MapFrom(s => s.ColorCode))
                .ForMember(p => p.ColorName, o => o.MapFrom(s => s.ColorName))
                .ForMember(p => p.MotorKw, o => o.MapFrom(s => s.MotorKw))
                .ForMember(p => p.BatteryKwh, o => o.MapFrom(s => s.BatteryKwh))
                .ForMember(p => p.RangeKm, o => o.MapFrom(s => s.RangeKm))
            ;
        }
    }
}
