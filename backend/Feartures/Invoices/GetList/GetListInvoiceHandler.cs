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
            var invoices = await _dbContext.Invoices.ToListAsync(ct);
            
            var results = invoices.Select(i => new GetListInvoiceQuery
            {
                InvoiceId = i.InvoiceId,
                Type = Enum.Parse<InvoiceType>(i.InvoiceType),
                DealerId = i.DealerId,
                SaleDocId = null, // Field không tồn tại trong entity
                PoId = i.PoId,
                InvoiceNo = i.InvoiceNo,
                Currency = i.Currency,
                Amount = i.Amount,
                Status = Enum.Parse<InvoiceStatus>(i.Status),
                IssuedAt = i.IssuedAt,
                DueAt = i.DueAt ?? DateTime.MinValue, // Handle nullable
                Note = i.Note
            }).ToList();

            return Result.Success(results);
        }
    }
}
