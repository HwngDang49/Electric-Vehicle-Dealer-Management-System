namespace backend.Feartures.Products.NewFolder
{
    public class GetListProductQuery
    {
        public string ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ModelCode { get; set; }
        public string ModelName { get; set; }
        public string VariantCode { get; set; }
        public string ColorCode { get; set; }
        public string ColorName { get; set; }
        public decimal BatteryKwh { get; set; }
        public decimal MotorKw { get; set; }
        public int RangeKm { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
