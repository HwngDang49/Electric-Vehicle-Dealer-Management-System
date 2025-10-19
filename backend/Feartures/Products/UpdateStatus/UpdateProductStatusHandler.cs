using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.UpdateStatus
{
    public sealed class UpdateProductStatusHandler : IRequestHandler<UpdateProductStatusCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public UpdateProductStatusHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(UpdateProductStatusCommand request, CancellationToken ct)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId, ct);

            if (product == null)
            {
                return Result.NotFound($"Product with ID {request.ProductId} not found.");
            }

            product.Status = request.Status.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
