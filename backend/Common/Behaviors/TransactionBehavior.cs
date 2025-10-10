using backend.Common.Markers;
using backend.Infrastructure.Data;
using MediatR;

namespace backend.Common.Behaviors
{
    public sealed class TransactionBehavior<TRequest, TResponse>
        : IPipelineBehavior<TRequest, TResponse>
    {
        private readonly EVDmsDbContext _db;
        public TransactionBehavior(EVDmsDbContext db) => _db = db;

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken ct)
        {
            // Chỉ áp dụng cho request ghi
            if (request is not ITransactionalRequest)
                return await next();

            if (_db.Database.CurrentTransaction is not null)
                return await next();

            await using var tx = await _db.Database.BeginTransactionAsync(ct);
            var response = await next();
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return response;
        }
    }
}
