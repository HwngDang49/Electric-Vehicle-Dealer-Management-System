using MediatR;

namespace backend.Feartures.Inventories.GetDetailVins
{
    public class GetDetailVinsQuery : IRequest<List<DetailVinDto>>
    {
        public long? BranchId { get; set; }
        public string? Status { get; set; }
        public long? ProductId { get; set; }
    }

    public class DetailVinDto
    {
        public string Vin { get; set; } = string.Empty;
        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ColorName { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ReceivedAt { get; set; }
        public long? OrderId { get; set; }
        public long? PoId { get; set; }
        public long? BranchId { get; set; }
        public string? BranchCode { get; set; }
        public string? BranchName { get; set; }
    }
}

