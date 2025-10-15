using System.Text.Json.Serialization;
using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.GetOrders;

public sealed class GetOrdersQuery : IRequest<PagedResult<GetOrdersListItemDto>>
{
    [JsonIgnore]
    public long DealerId { get; set; }

    public string? Status { get; set; }
    public string? SearchTerm { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public sealed class GetOrdersListItemDto
{
    public long OrderId { get; set; }
    public string OrderCode { get; set; } = default!;
    public string CustomerName { get; set; } = default!;
    public string? CustomerPhone { get; set; }
    public string VehicleName { get; set; } = default!;
    public string? VehicleColor { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}