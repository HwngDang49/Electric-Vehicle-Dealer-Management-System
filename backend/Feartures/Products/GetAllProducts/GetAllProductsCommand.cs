using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Products.GetAllProducts
{
    public sealed class GetAllProductsCommand : IRequest<Result<List<GetAllProductsQuery>>>
    {
        // Command không cần parameters, sẽ trả về tất cả products
    }

    public sealed class GetAllProductsQuery
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
    }
}
