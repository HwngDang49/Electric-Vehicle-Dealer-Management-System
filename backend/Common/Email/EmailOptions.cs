namespace backend.Common.Email
{
    /// <summary>
    /// Cấu hình SMTP Email từ appsettings.json
    /// Map với section "Email" trong appsettings
    /// </summary>
    public class EmailOptions
    {
        /// <summary>
        /// Tên người gửi hiển thị trong email
        /// </summary>
        public string FromName { get; set; } = string.Empty;

        /// <summary>
        /// Địa chỉ email người gửi
        /// </summary>
        public string FromAddress { get; set; } = string.Empty;

        /// <summary>
        /// SMTP Server host
        /// VD: "smtp.gmail.com"
        /// </summary>
        public string SmtpHost { get; set; } = string.Empty;

        /// <summary>
        /// SMTP Server port
        /// VD: 587 (TLS)
        /// </summary>
        public int SmtpPort { get; set; }

        /// <summary>
        /// Username để đăng nhập SMTP
        /// VD: Email Gmail của bạn
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// App Password từ Google (KHÔNG phải password thường!)
        /// VD: "abcd efgh ijkl mnop"
        /// </summary>
        public string AppPassword { get; set; } = string.Empty;
    }
}

