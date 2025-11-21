using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerHandler : IRequestHandler<CreateDealerCommand, Result<CreateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateDealerHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<CreateDealerResponse>> Handle(CreateDealerCommand command, CancellationToken ct)
        {
            // Kiểm tra trùng mã đại lý
            var codeExists = await _db.Dealers
                .AnyAsync(d => d.Code == command.Code, ct);

            if (codeExists)
                return Result.Error("Mã đại lý đã tồn tại trong hệ thống.");

            // Load existing dealers once for duplicate checking (Name, LegalName, TaxId)
            var existingDealers = await _db.Dealers
                .Select(d => new { d.Name, d.LegalName, d.TaxId })
                .ToListAsync(ct);

            // Kiểm tra trùng tên đại lý (case-insensitive, trim)
            if (!string.IsNullOrWhiteSpace(command.Name))
            {
                var normalizedName = command.Name.Trim().ToLowerInvariant();
                var nameExists = existingDealers.Any(d => 
                    !string.IsNullOrWhiteSpace(d.Name) && 
                    d.Name.Trim().ToLowerInvariant() == normalizedName);

                if (nameExists)
                    return Result.Error("Tên đại lý đã tồn tại trong hệ thống.");
            }

            // Kiểm tra trùng tên pháp lý (case-insensitive, trim)
            if (!string.IsNullOrWhiteSpace(command.LegalName))
            {
                var normalizedLegalName = command.LegalName.Trim().ToLowerInvariant();
                var legalNameExists = existingDealers.Any(d => 
                    d.LegalName != null && 
                    d.LegalName.Trim().ToLowerInvariant() == normalizedLegalName);

                if (legalNameExists)
                    return Result.Error("Tên pháp lý đã tồn tại trong hệ thống.");
            }

            // Kiểm tra trùng mã số thuế (normalize: remove dashes and spaces)
            if (!string.IsNullOrWhiteSpace(command.TaxId))
            {
                var normalizedTaxId = command.TaxId.Replace("-", "").Replace(" ", "").Trim();
                var taxIdExists = existingDealers.Any(d => 
                    d.TaxId != null && 
                    d.TaxId.Replace("-", "").Replace(" ", "").Trim() == normalizedTaxId);

                if (taxIdExists)
                    return Result.Error("Mã số thuế đã tồn tại trong hệ thống.");
            }

            var dealer = _mapper.Map<Dealer>(command); // Sử dụng AutoMapper để chuyển đổi CreateDealerRequest thành đối tượng Dealer
            dealer.CreatedAt = DateTime.UtcNow; // Thiết lập thời gian tạo đại lý là thời gian hiện tại
            dealer.UpdatedAt = DateTime.UtcNow; // Thiết lập thời gian cập nhật đại lý là thời gian hiện tại

            _db.Dealers.Add(dealer);
            await _db.SaveChangesAsync(ct);

            var dealerResponse = new CreateDealerResponse
            {
                DealerId = dealer.DealerId,
                Status = dealer.Status ?? DealerStatus.Onboarding.ToString(),
                CreatedAt = DateTimeHelper.ToVietnamTime(dealer.CreatedAt),
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(dealerResponse);
        }
    }
}
