namespace backend.Feartures.Products.Create
{
    public class CreateProductRequest
    {
        public string ModelCode { get; set; }
        public string? ModelName { get; set; }
        public string Name { get; set; }
        public string VariantCode { get; set; }
        public string? ColorCode { get; set; }
        public string ColorName { get; set; }
        public decimal? BatteryKwh { get; set; }
        public decimal? MotorKw { get; set; }
        public int? RangeKm { get; set; }
    }
}
