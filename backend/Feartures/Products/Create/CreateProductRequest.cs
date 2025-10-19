using backend.Domain.Enums;

namespace backend.Feartures.Products.Create
{
    public class CreateProductRequest
    {
        public string ModelCode { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string VariantCode { get; set; } = default!;
        public string? ColorCode { get; set; }
        public string? ColorName { get; set; }
        public decimal? BatteryKwh { get; set; }
        public decimal? MotorKw { get; set; }
        public int? RangeKm { get; set; }
        public ProductStatus Status { get; set; } = ProductStatus.Active;
    }
}
