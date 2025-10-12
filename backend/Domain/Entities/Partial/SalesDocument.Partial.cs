using System.ComponentModel.DataAnnotations.Schema;
using backend.Domain.Enums;

namespace backend.Domain.Entities
{
    public partial class SalesDocument
    {
        [NotMapped]
        public DocTypeEnum DocTypeEnum
        {
            get => Enum.TryParse<DocTypeEnum>(DocType, ignoreCase: true, out var v) ? v : DocTypeEnum.Quote;
            set => DocType = value.ToString();
        }

        /// <summary>
        /// Chỉ áp dụng khi là Quote; Order thì trả null.
        /// </summary>
        [NotMapped]
        public QuoteStatus? QuoteStatusEnum
        {
            get => DocTypeEnum == DocTypeEnum.Quote
                ? (Enum.TryParse<QuoteStatus>(Status, true, out var v) ? v : QuoteStatus.Draft)
                : null;
            set
            {
                if (DocTypeEnum == DocTypeEnum.Quote && value.HasValue)
                    Status = value.Value.ToString();
            }
        }

        /// <summary>
        /// Quote đã hết hạn chưa (dựa vào locked_until). Không map DB.
        /// </summary>
        [NotMapped]
        public bool IsQuoteExpired => LockedUntil.HasValue && DateTime.UtcNow > LockedUntil.Value;
    }
}
