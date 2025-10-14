﻿using Ardalis.Result;
using backend.Common.Constants;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    public sealed class CreateContractHandler : IRequestHandler<CreateContractCommand, Result<string>>
    {
        private readonly EVDmsDbContext _db;
        public CreateContractHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<string>> Handle(CreateContractCommand cmd, CancellationToken ct)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

            var order = await _db.SalesDocuments.FirstOrDefaultAsync(sd =>
                sd.SalesDocId == cmd.SalesDocId &&
                sd.DealerId == cmd.DealerId &&
                sd.DocType == DocTypeEnum.Order.ToString(), ct);

            if (order is null)
                return Result.NotFound($"Order #{cmd.SalesDocId} not found.");

            if (!string.IsNullOrWhiteSpace(order.ContractNo))
                return Result.Error("A contract has already been created for this order.");

            var now = DateTime.UtcNow;
            var prefix = $"{ContractConstants.Prefix}-{now.ToString(ContractConstants.YearFormat)}-";

            var lastContractNo = await _db.SalesDocuments
                .Where(sd => sd.ContractNo != null && sd.ContractNo.StartsWith(prefix))
                .OrderByDescending(sd => sd.ContractNo)
                .Select(sd => sd.ContractNo)
                .FirstOrDefaultAsync(ct);

            var nextNumber = 1;
            if (lastContractNo != null)
            {
                var lastNumberStr = lastContractNo.Substring(prefix.Length);
                if (int.TryParse(lastNumberStr, out var lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            order.ContractNo = $"{prefix}{nextNumber.ToString($"D{ContractConstants.PaddingWidth}")}";


            if (!string.IsNullOrWhiteSpace(cmd.ContractFileUrl))
                order.ContractFileUrl = cmd.ContractFileUrl.Trim();

            // Lưu lại số tiền cọc yêu cầu vào đơn hàng
            order.RequiredDepositAmount = cmd.RequiredDepositAmount;

            if (!string.IsNullOrWhiteSpace(cmd.ContractFileUrl))
                order.ContractFileUrl = cmd.ContractFileUrl.Trim();

            order.UpdatedAt = DateTimeHelper.UtcNow();

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return Result.Success(order.ContractNo);
        }
    }
}
