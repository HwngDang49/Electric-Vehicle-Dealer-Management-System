using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Update
{
    public record UpdatePricebookCommand(long pricebookId, UpdatePricebookRequest Request) : IRequest<Result<UpdatePricebookRequest>>;
    public class UpdatePricebookHandler : IRequestHandler<UpdatePricebookCommand, Result<UpdatePricebookRequest>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public UpdatePricebookHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<UpdatePricebookRequest>> Handle(UpdatePricebookCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var updatePricebook = await _db.Pricebooks
                                    .FirstOrDefaultAsync(p => p.PricebookId == cmd.pricebookId, ct);

            if (updatePricebook == null)
            {
                return Result.NotFound($"Pricebook {cmd.pricebookId} was not found");
            }

            //checkPricebook = _mapper.Map<Pricebook>(req);
            _mapper.Map(cmd.Request, updatePricebook);

            updatePricebook.EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow);

            if (updatePricebook.EffectiveFrom > updatePricebook.EffectiveTo)
            {
                return Result.Error("EffectiveTo can not greater than EffectiveFrom");
            }

            // Tường minh báo cho EF Core rằng entity này đã bị thay đổi
            _db.Entry(updatePricebook).State = EntityState.Modified;

            await _db.SaveChangesAsync(ct);

            var updatedDto = _mapper.Map<UpdatePricebookRequest>(updatePricebook);

            return Result.Success(updatedDto);
        }
    }
}
