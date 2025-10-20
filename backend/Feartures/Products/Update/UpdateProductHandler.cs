using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.Update
{
    public sealed class UpdateProductHandler : IRequestHandler<UpdateProductCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public UpdateProductHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result> Handle(UpdateProductCommand request, CancellationToken ct)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId, ct);

            if (product == null)
            {
                return Result.NotFound($"Product with ID {request.ProductId} not found.");
            }

            // Check if SKU already exists for a different product
            var existingProduct = await _db.Products
                .AnyAsync(p => p.ProductId != request.ProductId && 
                              p.ModelCode == request.Request.ModelCode && 
                              p.VariantCode == request.Request.VariantCode && 
                              p.ColorCode == request.Request.ColorCode, ct);

            if (existingProduct)
            {
                return Result.Error($"Product with SKU '{request.Request.ModelCode}-{request.Request.VariantCode}-{request.Request.ColorCode}' already exists.");
            }

            // Update product properties
            product.ModelCode = request.Request.ModelCode;
            product.Name = request.Request.Name;
            product.VariantCode = request.Request.VariantCode;
            product.ColorCode = request.Request.ColorCode;
            product.ColorName = request.Request.ColorName;
            product.BatteryKwh = request.Request.BatteryKwh;
            product.MotorKw = request.Request.MotorKw;
            product.RangeKm = request.Request.RangeKm;
            product.Status = request.Request.Status.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}