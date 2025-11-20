using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Invoices.GetList
{
    public record GetListInvoiceCommand : IRequest<Result<List<GetListInvoiceQuery>>>;
    public class GetListInvoiceHandler : IRequestHandler<GetListInvoiceCommand, Result<List<GetListInvoiceQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetListInvoiceHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<List<GetListInvoiceQuery>>> Handle(GetListInvoiceCommand cmd, CancellationToken ct)
        {
            var invoices = await _dbContext.Invoices
                .Include(i => i.Payments)
                .ToListAsync(ct);
            
            var results = invoices.Select(i => 
            {
                // Tính PaidAt từ payment có PaidAt mới nhất (Captured hoặc Paid)
                var latestPayment = i.Payments
                    .Where(p => (p.Status == "Captured" || p.Status == "Paid") && p.PaidAt.HasValue)
                    .OrderByDescending(p => p.PaidAt)
                    .FirstOrDefault();

                return new GetListInvoiceQuery
                {
                    InvoiceId = i.InvoiceId,
                    Type = Enum.Parse<InvoiceType>(i.InvoiceType),
                    DealerId = i.DealerId,
                    SaleDocId = i.SalesDocId, // Sử dụng SalesDocId từ entity
                    PoId = i.PoId,
                    InvoiceNo = i.InvoiceNo,
                    Currency = i.Currency,
                    Amount = i.Amount,
                    Status = Enum.Parse<InvoiceStatus>(i.Status),
                    IssuedAt = i.IssuedAt,
                    DueAt = i.DueAt ?? DateTime.MinValue, // Handle nullable
                    Note = i.Note,
                    BranchId = i.BranchId,
                    PaidAt = latestPayment?.PaidAt
                };
            }).ToList();

            return Result.Success(results);
        }
    }
}
