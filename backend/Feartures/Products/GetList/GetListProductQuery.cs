namespace backend.Feartures.Products.GetList
{
    public class GetListProductQuery
    {
        public long ProductId { get; set; }
        public string ModelCode { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string VariantCode { get; set; } = default!;
        public string? ColorCode { get; set; }
        public string? ColorName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? BatteryKwh { get; set; }
        public decimal? MotorKw { get; set; }
        public int? RangeKm { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
