namespace backend.Infrastructure.Email
{
    /// <summary>
    /// Service để gửi email (có thể tái sử dụng cho toàn bộ hệ thống)
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email cơ bản với HTML content
        /// </summary>
        Task<bool> SendEmailAsync(
            string toEmail,
            string toName,
            string subject,
            string htmlBody,
            CancellationToken ct = default);

        /// <summary>
        /// Gửi email chào mừng khi tạo tài khoản mới
        /// </summary>
        Task<bool> SendWelcomeEmailAsync(
            string toEmail,
            string fullName,
            string temporaryPassword,
            string role,
            CancellationToken ct = default);
    }
}

