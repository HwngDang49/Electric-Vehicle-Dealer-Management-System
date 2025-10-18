using System.ComponentModel.DataAnnotations.Schema;
using backend.Domain.Enums;

namespace backend.Domain.Entities
{
    public partial class Customer
    {
        [NotMapped]
        public CustomerStatus? StatusEnum
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Status)) return null;
                return Enum.TryParse<CustomerStatus>(Status, true, out var v) ? v : null;
            }
            set
            {
                Status = value?.ToString();
            }
        }
    }
}
