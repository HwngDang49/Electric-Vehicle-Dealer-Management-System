using Ardalis.Result;
using backend.Common.Helpers;
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
                var baseQuery = _dbContext.Invoices
                    .Where(i => i.InvoiceType == "Retail");

                if (request.DealerId.HasValue)
                {
                    baseQuery = baseQuery.Where(i => i.DealerId == request.DealerId.Value);
                }

                if (!string.IsNullOrEmpty(request.Status))
                {
                    baseQuery = baseQuery.Where(i => i.Status == request.Status);
                }

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchTerm = request.Search.ToLower();
                    baseQuery = baseQuery.Where(i =>
                        i.InvoiceNo.ToLower().Contains(searchTerm) ||
                        (i.SalesDoc != null && i.SalesDoc.Customer != null &&
                         (i.SalesDoc.Customer.FullName.ToLower().Contains(searchTerm) ||
                          i.SalesDoc.Customer.Phone.ToLower().Contains(searchTerm))));
                }

                var totalCount = await baseQuery.CountAsync(ct);

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
                    .ToListAsync(ct);

                var invoiceDtos = invoices.Select(i => 
                {
                    // Tính PaidAt từ payment có PaidAt mới nhất (Captured hoặc Paid)
                    var latestPayment = i.Payments
                        .Where(p => (p.Status == "Captured" || p.Status == "Paid") && p.PaidAt.HasValue)
                        .OrderByDescending(p => p.PaidAt)
                        .FirstOrDefault();

                    return new RetailInvoiceDto
                    {
                        InvoiceId = i.InvoiceId,
                        InvoiceNo = i.InvoiceNo,
                        SalesDocId = i.SalesDocId ?? 0,
                        DealerId = i.DealerId,
                        CustomerName = i.SalesDoc != null && i.SalesDoc.Customer != null ? i.SalesDoc.Customer.FullName : "N/A",
                        CustomerPhone = i.SalesDoc != null && i.SalesDoc.Customer != null && i.SalesDoc.Customer.Phone != null ? i.SalesDoc.Customer.Phone : "N/A",
                        CustomerEmail = i.SalesDoc != null && i.SalesDoc.Customer != null ? i.SalesDoc.Customer.Email : "N/A",
                        CustomerIdNumber = i.SalesDoc != null && i.SalesDoc.Customer != null ? i.SalesDoc.Customer.IdNumber : "N/A",
                        OrderName = i.SalesDoc != null && i.SalesDoc.OrderItems != null && i.SalesDoc.OrderItems.Any()
                            ? i.SalesDoc.OrderItems.First().Product.Name ?? "N/A"
                            : "N/A",
                        Amount = i.SalesDoc != null ? i.SalesDoc.TotalAmount : 0,
                        DepositAmount = i.SalesDoc != null ? i.SalesDoc.DepositAmount : 0,
                        OutstandingAmount = i.SalesDoc != null ? i.SalesDoc.TotalAmount - i.SalesDoc.DepositAmount : 0,
                        Status = i.Status,
                        IssuedAt = DateTimeHelper.ToVietnamTime(i.IssuedAt),
                        DueAt = i.DueAt.HasValue ? DateTimeHelper.ToVietnamTime(i.DueAt.Value) : null,
                        PaidAt = latestPayment?.PaidAt.HasValue == true ? DateTimeHelper.ToVietnamTime(latestPayment.PaidAt.Value) : null,
                        Currency = i.Currency ?? "VND"
                    };
                }).ToList();

                var response = new GetRetailInvoicesResponse
                {
                    Data = invoiceDtos,
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
