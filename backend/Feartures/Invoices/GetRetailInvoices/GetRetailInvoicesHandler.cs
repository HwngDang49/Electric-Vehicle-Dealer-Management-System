using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Invoices.GetRetailInvoices
{
    public record GetRetailInvoicesQuery(GetRetailInvoicesRequest Request) : IRequest<Result<GetRetailInvoicesResponse>>;

    public class GetRetailInvoicesHandler : IRequestHandler<GetRetailInvoicesQuery, Result<GetRetailInvoicesResponse>>
    {
        private readonly EVDmsDbContext _dbContext;

        public GetRetailInvoicesHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<GetRetailInvoicesResponse>> Handle(GetRetailInvoicesQuery query, CancellationToken ct)
        {
            var request = query.Request;

            try
            {
                // Base query for retail invoices
                var baseQuery = _dbContext.Invoices
                    .Where(i => i.InvoiceType == "Retail");

                // Apply dealer filter if provided
                if (request.DealerId.HasValue)
                {
                    baseQuery = baseQuery.Where(i => i.DealerId == request.DealerId.Value);
                }

                // Apply status filter if provided
                if (!string.IsNullOrEmpty(request.Status))
                {
                    baseQuery = baseQuery.Where(i => i.Status == request.Status);
                }

                // Apply search filter if provided
                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchTerm = request.Search.ToLower();
                    baseQuery = baseQuery.Where(i => 
                        i.InvoiceNo.ToLower().Contains(searchTerm) ||
                        (i.SalesDoc != null && i.SalesDoc.Customer != null && 
                         (i.SalesDoc.Customer.FullName.ToLower().Contains(searchTerm) ||
                          i.SalesDoc.Customer.Phone.ToLower().Contains(searchTerm))));
                }

                // Get total count
                var totalCount = await baseQuery.CountAsync(ct);

                // Apply pagination with includes
                var invoices = await baseQuery
                    .Include(i => i.SalesDoc)
                        .ThenInclude(o => o.Customer)
                    .Include(i => i.SalesDoc)
                        .ThenInclude(o => o.OrderItems)
                            .ThenInclude(oi => oi.Product)
                    .Include(i => i.Payments)
                    .OrderByDescending(i => i.IssuedAt)
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .Select(i => new RetailInvoiceDto
                    {
                        InvoiceId = i.InvoiceId,
                        InvoiceNo = i.InvoiceNo,
                        SalesDocId = i.SalesDocId ?? 0,
                        DealerId = i.DealerId,
                        CustomerName = i.SalesDoc != null && i.SalesDoc.Customer != null ? i.SalesDoc.Customer.FullName : "N/A",
                        CustomerPhone = i.SalesDoc != null && i.SalesDoc.Customer != null ? i.SalesDoc.Customer.Phone : "N/A",
                        CustomerEmail = i.SalesDoc != null && i.SalesDoc.Customer != null ? i.SalesDoc.Customer.Email : "N/A",
                        OrderName = i.SalesDoc != null && i.SalesDoc.OrderItems != null && i.SalesDoc.OrderItems.Any() 
                            ? i.SalesDoc.OrderItems.First().Product.Name ?? "N/A" 
                            : "N/A",
                        Amount = i.Amount,
                        OutstandingAmount = i.Amount - (i.Payments != null ? i.Payments.Sum(p => p.Amount) : 0),
                        Status = i.Status,
                        IssuedAt = i.IssuedAt,
                        DueAt = i.DueAt,
                        Currency = i.Currency ?? "VND"
                    })
                    .ToListAsync(ct);

                var response = new GetRetailInvoicesResponse
                {
                    Data = invoices,
                    TotalCount = totalCount,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
                };

                return Result.Success(response);
            }
            catch (Exception ex)
            {
                return Result.Error($"Error retrieving retail invoices: {ex.Message}");
            }
        }
    }
}
