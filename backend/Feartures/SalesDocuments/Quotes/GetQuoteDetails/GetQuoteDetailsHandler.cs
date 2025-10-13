using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Constants;
using backend.Common.Exceptions;
using backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.SalesDocuments.Details;

public sealed class GetQuoteDetailsHandler : IRequestHandler<GetQuoteByIdQuery, GetQuoteDetailDto>
{
    private readonly EVDmsDbContext _dbContext;
    private readonly IMapper _mapper;

    public GetQuoteDetailsHandler(EVDmsDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<GetQuoteDetailDto> Handle(GetQuoteByIdQuery query, CancellationToken cancellationToken)
    {
        var quoteDetail = await _dbContext.SalesDocuments
            .AsNoTracking()
            .Where(quote =>
                quote.SalesDocId == query.SalesDocId &&
                // 2. (Bảo mật) Phải thuộc về đại lý của người dùng đang đăng nhập.
                //    Điều này ngăn người dùng của đại lý A xem báo giá của đại lý B.
                quote.DealerId == query.DealerId &&
                quote.DocType == DocTypes.Quote)

            .ProjectTo<GetQuoteDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        // Kiểm tra xem báo giá có tồn tại hay không.
        if (quoteDetail is null)
        {
            // Nếu không tìm thấy, ném ra một ngoại lệ NotFoundException.
            // ErrorHandlingMiddleware sẽ bắt lỗi này và trả về response HTTP 404 Not Found.
            throw new NotFoundException($"Quote with ID #{query.SalesDocId} was not found.");
        }

        // Nếu tìm thấy, trả về đối tượng DTO chi tiết.
        return quoteDetail;
    }
}
