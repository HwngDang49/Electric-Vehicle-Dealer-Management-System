using System.ComponentModel.DataAnnotations.Schema;
using backend.Domain.Enums;

namespace backend.Domain.Entities
{
    public partial class Dealer
    {
        [NotMapped]
        public DealerStatus StatusEnum
        {
            get => Enum.TryParse<DealerStatus>(Status, true, out var v) ? v : DealerStatus.Onboarding;
            set => Status = value.ToString();
        }
    }
}
