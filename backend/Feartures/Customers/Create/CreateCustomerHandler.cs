using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
namespace backend.Feartures.Customers.Create
{
    public record CreateCustomerCommand(CreateCustomerRequest Request) : IRequest<Result<long>>;

    public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly CreateCustomerRuleChecker _ruleChecker;

        public CreateCustomerHandler(EVDmsDbContext db, IMapper mapper, CreateCustomerRuleChecker ruleChecker)
        {
            _db = db;
            _mapper = mapper;
            _ruleChecker = ruleChecker;
        }


        public async Task<Result<long>> Handle(CreateCustomerCommand cmd, CancellationToken ct)
        {
            // 1) Lấy req
            var req = cmd.Request;

            //2) Check rules
            await _ruleChecker.CheckAllRules(req, ct);

            // 3) Map DTO -> Entity
            var entity = _mapper.Map<Customer>(req);

            // 4) Status: nếu không gửi thì default "Contact"
            entity.Status = req.Status?.ToString() ?? entity.Status ?? "Contact";

            // 5) Timestamps
            entity.CreatedAt = DateTimeHelper.UtcNow();

            // 6) Thêm vào DbContext
            _db.Customers.Add(entity);

            await _db.SaveChangesAsync(ct);

            return entity.CustomerId; // EF sẽ gán ID khi SaveChanges (pipeline)
        }
    }
}
