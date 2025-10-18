using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Constants;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    public sealed class CreateContractHandler : IRequestHandler<CreateContractCommand, Result<string>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public CreateContractHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<string>> Handle(CreateContractCommand cmd, CancellationToken ct)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            
            var order = await _db.Orders.FirstOrDefaultAsync(o =>
                o.OrderId == cmd.OrderId &&
                o.DealerId == dealerId, ct);

        if (order is null)
            return Result.NotFound($"Order #{cmd.OrderId} not found.");

        // Kiểm tra xem đã có contract chưa
        var existingContract = await _db.Contracts
            .FirstOrDefaultAsync(c => c.OrderId == cmd.OrderId, ct);

        if (existingContract != null)
            return Result.Error("Contract already exists for this order.");

        // Tạo contract mới
        var now = DateTime.UtcNow;
        var contractNo = $"CONTRACT-{now:yyyy}-{now:MMddHHmmss}";

        var contract = new Contract
        {
            OrderId = cmd.OrderId,
            ContractNo = contractNo,
            FileUrl = cmd.ContractFileUrl // Nếu có file URL từ request
        };

        _db.Contracts.Add(contract);
        order.UpdatedAt = DateTimeHelper.UtcNow();

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return Result.Success(contractNo);
        }
    }
}
