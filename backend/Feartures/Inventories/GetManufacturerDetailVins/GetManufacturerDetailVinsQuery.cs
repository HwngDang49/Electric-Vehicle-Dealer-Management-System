using MediatR;

namespace backend.Feartures.Inventories.GetManufacturerDetailVins
{
    public class GetManufacturerDetailVinsQuery : IRequest<List<ManufacturerDetailVinDto>>
    {
        public long? ProductId { get; set; }
        public string? Status { get; set; }
        public string? Color { get; set; }
    }

    public class ManufacturerDetailVinDto
    {
        public string Vin { get; set; } = null!;
        public long ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ColorName { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? ReceivedAt { get; set; }
        public long? OrderId { get; set; }
        public long? PoId { get; set; }
    }
}

