﻿using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Create
{
    public record CreatePricebookCommand(CreatePricebookRequest Request) : IRequest<Result<long>>;
    public class CreatePricebookHandler : IRequestHandler<CreatePricebookCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public CreatePricebookHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreatePricebookCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // Product phải tồn tại
            var productExists = await _dbContext.Products
                .AsNoTracking() // readonly
                .AnyAsync(p => p.ProductId == req.ProductId, ct);

            if (!productExists)
                return Result.NotFound($"Product {req.ProductId} does not exist");

            var checkExist = await _dbContext.Pricebooks.
                AsNoTracking()
                .AnyAsync(pb => pb.ProductId == req.ProductId, ct);

            if (checkExist)
            {
                return Result.Error($"ProductId {req.ProductId} has been had pricebook already");
            }

            if(req.MsrpPrice > req.FloorPrice)
            {
                return Result.Error($"MsrpPrice can not greather than FloorPrice!!!");
            }

            var pricebook = _mapper.Map<Pricebook>(req);


            pricebook.EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow);

            _dbContext.Pricebooks.Add(pricebook);
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success(pricebook.PricebookId);
        }

    }
}
