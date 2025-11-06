using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.Create
{
    public class CreateBranchHandler : IRequestHandler<CreateBranchCommand, Result<CreateBranchResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateBranchHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<CreateBranchResponse>> Handle(CreateBranchCommand command, CancellationToken ct)
        {
            var exists = await _db.Branches
                .AnyAsync(b => b.Code == command.Code, ct);

            if (exists)
            {
                return Result.Error("Mã chi nhánh đã tồn tại");
            }

            var branch = _mapper.Map<Branch>(command);

            branch.CreatedAt = DateTime.UtcNow;
            branch.UpdatedAt = DateTime.UtcNow;


            _db.Branches.Add(branch);
            await _db.SaveChangesAsync(ct);

            var response = new CreateBranchResponse
            {
                BranchId = branch.BranchId,
                DealerId = branch.DealerId,
                Code = branch.Code,
                Name = branch.Name,
                Address = branch.Address,
                Status = branch.Status ?? BranchStatus.Inactive.ToString(),
                CreatedAt = DateTimeHelper.ToVietnamTime(branch.CreatedAt),
                UpdatedAt = DateTimeHelper.ToVietnamTime(branch.UpdatedAt)
            };

            return Result.Success(response);
        }
    }
}
