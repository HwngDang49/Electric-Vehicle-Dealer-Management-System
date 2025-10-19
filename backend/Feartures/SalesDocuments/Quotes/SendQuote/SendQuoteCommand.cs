using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.SendQuote
{
    /// <summary>
    /// Command để gửi báo giá - cập nhật locked_until nhưng giữ nguyên status Draft
    /// </summary>
    public sealed class SendQuoteCommand : IRequest<Result<bool>>
    {
        public long QuoteId { get; set; }
    }
}
