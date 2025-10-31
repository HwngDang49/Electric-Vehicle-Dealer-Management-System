using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Constants;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    public sealed class CreateContractHandler : IRequestHandler<CreateContractCommand, Result<string>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CreateContractHandler> _logger;
        
        public CreateContractHandler(
            EVDmsDbContext db, 
            IHttpContextAccessor httpContextAccessor,
            ILogger<CreateContractHandler> logger)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
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

        // Tìm Active DealerAgreement cho Dealer này và gắn vào Order
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var activeAgreement = await _db.DealerAgreements
            .AsNoTracking()
            .Where(a => a.DealerId == dealerId
                        && a.Status == "Active"
                        && a.StartDate <= today
                        && (a.EndDate == null || a.EndDate >= today))
            .OrderByDescending(a => a.StartDate) // Lấy agreement mới nhất nếu có nhiều
            .FirstOrDefaultAsync(ct);

        if (activeAgreement != null)
        {
            order.AgreementId = activeAgreement.AgreementId;
            _logger.LogInformation(
                "Order {OrderId} assigned to Agreement {AgreementId} ({Code}) when creating contract",
                cmd.OrderId, activeAgreement.AgreementId, activeAgreement.Code);
        }
        else
        {
            _logger.LogWarning(
                "Order {OrderId} for Dealer {DealerId} has no Active rebate agreement. " +
                "Rebate calculation may not be applicable.",
                cmd.OrderId, dealerId);
        }

        // Cập nhật DepositRequirement vào Order
        order.DepositRequirement = cmd.RequiredDepositAmount;

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
