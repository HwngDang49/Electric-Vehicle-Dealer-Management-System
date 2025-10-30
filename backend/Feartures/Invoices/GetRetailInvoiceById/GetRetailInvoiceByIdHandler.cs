using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Feartures.Invoices.GetRetailInvoiceById
{
    public class GetRetailInvoiceByIdHandler : IRequestHandler<GetRetailInvoiceByIdQuery, Result<GetRetailInvoiceByIdResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        public GetRetailInvoiceByIdHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<GetRetailInvoiceByIdResponse>> Handle(GetRetailInvoiceByIdQuery query, CancellationToken cancellationToken)
        {
            var id = query.Request.InvoiceId;

            var invoice = await (
                from i in _dbContext.Invoices.AsNoTracking()
                where i.InvoiceId == id
                join sd in _dbContext.Orders on i.SalesDocId equals sd.OrderId into sdj
                from salesDoc in sdj.DefaultIfEmpty()
                select new
                {
                    Invoice = i,
                    SalesDoc = salesDoc,
                    Customer = salesDoc != null ? salesDoc.Customer : null,
                    OrderItems = salesDoc != null ? salesDoc.OrderItems : null
                }
            ).FirstOrDefaultAsync(cancellationToken);

            if (invoice == null)
                return Result<GetRetailInvoiceByIdResponse>.NotFound("Invoice not found!");

            // Lấy OrderItem đầu tiên (nếu có)  
            var firstOrderItem = invoice.OrderItems?.FirstOrDefault();
            string vin = "N/A";
            string orderName = "N/A";
            string vehicleColor = "N/A";
            decimal? vehicleBatteryKwh = null;
            decimal? vehicleMotorKw = null;
            decimal? vehicleRangeKm = null;

            if (firstOrderItem != null)
            {
                // Lấy Inventory kèm Product
                var inventory = await _dbContext.Inventories
                    .Include(inv => inv.Product)
                    .Where(inv => inv.OrderId == firstOrderItem.OrderId && inv.ProductId == firstOrderItem.ProductId)
                    .FirstOrDefaultAsync(cancellationToken);

                vin = inventory?.Vin ?? "N/A";
                var product = inventory?.Product;

                orderName = product?.Name ?? "N/A";
                vehicleColor = product?.ColorName ?? "N/A";
                vehicleBatteryKwh = product?.BatteryKwh;
                vehicleMotorKw = product?.MotorKw;
                vehicleRangeKm = product?.RangeKm;
            }


            var payments = await _dbContext.Set<Payment>()
                .Where(p => p.InvoiceId == invoice.Invoice.InvoiceId)
                .ToListAsync(cancellationToken);

            var totalPaid = payments?.Where(p => p.Status == "Captured" || p.Status == "Paid").Sum(p => p.Amount) ?? 0;

            var dto = new RetailInvoiceDto
            {
                InvoiceId = invoice.Invoice.InvoiceId,
                InvoiceNo = invoice.Invoice.InvoiceNo,
                SalesDocId = invoice.Invoice.SalesDocId ?? 0,
                DealerId = invoice.Invoice.DealerId,
                CustomerName = invoice.Customer?.FullName ?? "N/A",
                CustomerPhone = invoice.Customer?.Phone ?? "N/A",
                CustomerEmail = invoice.Customer?.Email ?? "N/A",
                CustomerIdNumber = invoice.Customer?.IdNumber ?? "N/A",
                CustomerAddress = invoice.Customer?.Address ?? "N/A",
                OrderName = orderName,
                VehicleColor = vehicleColor,
                VehicleBatteryKwh = vehicleBatteryKwh,
                VehicleMotorKw = vehicleMotorKw,
                VehicleRangeKm = vehicleRangeKm.HasValue ? (int?)vehicleRangeKm.Value : null,
                Vin = vin,
                Amount = invoice.SalesDoc != null ? invoice.SalesDoc.TotalAmount : invoice.Invoice.Amount,
                DepositAmount = invoice.SalesDoc != null ? invoice.SalesDoc.DepositAmount : 0,
                OutstandingAmount = Math.Max(0,
                    ((invoice.SalesDoc != null ? (invoice.SalesDoc.TotalAmount - invoice.SalesDoc.DepositAmount) : invoice.Invoice.Amount)
                     - totalPaid)
                ),
                Status = invoice.Invoice.Status,
                IssuedAt = invoice.Invoice.IssuedAt,
                DueAt = invoice.Invoice.DueAt,
                Currency = invoice.Invoice.Currency ?? "VND"
            };

            return Result<GetRetailInvoiceByIdResponse>.Success(new GetRetailInvoiceByIdResponse { Invoice = dto });
        }
    }
}
