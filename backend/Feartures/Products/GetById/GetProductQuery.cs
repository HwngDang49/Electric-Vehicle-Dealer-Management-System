namespace backend.Feartures.Products.Get
{
    public class GetProductQuery
    {
        public long ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ModelCode { get; set; }
        public string ModelName { get; set; }
        public string VariantCode { get; set; }
        public string ColorCode { get; set; }
        public string ColorName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal BatteryKwh { get; set; }
        public decimal MotorKw { get; set; }
        public int RangeKm { get; set; }
        public string Status { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
