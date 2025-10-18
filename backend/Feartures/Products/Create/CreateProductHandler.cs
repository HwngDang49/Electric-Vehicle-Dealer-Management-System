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

            //tạo product
            var product = _mapper.Map<Product>(req);

            product.Status = "Active";
            product.CreatedAt = DateTime.Now;


            if (product == null)
            {
                return Result.Error("Create product fail");
            }

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync(ct);
            return Result.Success(product.ProductId);
        }
    }
}
