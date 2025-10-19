using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.Create
{
    public record CreateProductCommand(CreateProductRequest Request) : IRequest<Result<long>>;
    
    public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public CreateProductHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
           			_mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreateProductCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // Kiểm tra SKU đã tồn tại chưa (ModelCode + VariantCode + ColorCode)
            var existingProduct = await _dbContext.Products
                .AnyAsync(p => p.ModelCode == req.ModelCode && 
                              p.VariantCode == req.VariantCode && 
                              p.ColorCode == req.ColorCode, ct);

            if (existingProduct)
            {
                return Result.Error($"Product with SKU '{req.ModelCode}-{req.VariantCode}-{req.ColorCode}' already exists.");
            }

            // Tạo product
            var product = _mapper.Map<Product>(req);
            product.Status = req.Status.ToString();
            product.CreatedAt = DateTime.UtcNow;

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync(ct);
            
            return Result.Success(product.ProductId);
        }
    }
}
