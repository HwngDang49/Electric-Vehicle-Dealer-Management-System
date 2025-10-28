using backend.Common.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace backend.Infrastructure.Email
{
    /// <summary>
    /// Implementation của IEmailService sử dụng MailKit (Shared service cho toàn hệ thống)
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly EmailOptions _options;

        public EmailService(IOptions<EmailOptions> options)
        {
            _options = options.Value;
        }

        public async Task<bool> SendEmailAsync(
            string toEmail,
            string toName,
            string subject,
            string htmlBody,
            CancellationToken ct = default)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_options.SmtpHost, _options.SmtpPort, SecureSocketOptions.StartTls, ct);
                await client.AuthenticateAsync(_options.Username, _options.AppPassword, ct);
                await client.SendAsync(message, ct);
                await client.DisconnectAsync(true, ct);

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(
            string toEmail,
            string fullName,
            string temporaryPassword,
            string role,
            CancellationToken ct = default)
        {
            var subject = "🎉 Chào mừng bạn đến với EVDMS - Thông tin tài khoản";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }}
        .container {{ max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; margin-bottom: 10px; }}
        .header p {{ margin: 0; opacity: 0.9; font-size: 16px; }}
        .content {{ padding: 40px 30px; }}
        .info-box {{ background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px; }}
        .info-row {{ display: flex; justify-content: space-between; margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e9ecef; }}
        .info-row:last-child {{ border-bottom: none; }}
        .label {{ font-weight: 600; color: #495057; font-size: 14px; }}
        .value {{ color: #212529; font-weight: 500; text-align: right; font-size: 14px; }}
        .password-box {{ background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }}
        .password-label {{ font-size: 14px; color: #856404; margin-bottom: 8px; font-weight: 600; }}
        .password-value {{ font-family: 'Courier New', monospace; font-size: 24px; color: #856404; font-weight: bold; letter-spacing: 2px; background: #fff; padding: 10px; border-radius: 4px; display: inline-block; }}
        .warning-box {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }}
        .steps {{ background: #e7f3ff; padding: 20px; border-radius: 6px; margin: 20px 0; }}
        .steps h3 {{ color: #0066cc; margin-top: 0; font-size: 16px; }}
        .footer {{ background: #f8f9fa; padding: 25px; text-align: center; font-size: 13px; color: #6c757d; border-top: 1px solid #dee2e6; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Chào mừng đến với EVDMS!</h1>
            <p>Electric Vehicle Dealer Management System</p>
        </div>
        <div class='content'>
            <p style='font-size: 18px;'>Xin chào <strong>{fullName}</strong>,</p>
            <p>Đây sẽ là tài khoản chính thức của bạn để truy cập vào trang hệ thống quản lý đại lý xe điện EVDMS.</p>
            
            <div class='info-box'>
                <div class='info-row'>
                    <span class='label'>Email đăng nhập:</span>
                    <span class='value'>{toEmail}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Họ và tên:</span>
                    <span class='value'>{fullName}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Vai trò:</span>
                    <span class='value'>{role}</span>
                </div>
            </div>
            
            <div class='password-box'>
                <div class='password-label'>🔑 Mật khẩu tạm thời của bạn:</div>
                <div class='password-value'>{temporaryPassword}</div>
            </div>
            
            <div class='warning-box'>
                <strong>⚠️ LƯU Ý BẢO MẬT:</strong><br/>
                • Vui lòng đổi mật khẩu này ngay sau lần đăng nhập đầu tiên<br/>
                • Không chia sẻ mật khẩu với bất kỳ ai
            </div>
            
            <div class='steps'>
                <h3>📋 Các bước tiếp theo:</h3>
                <ol>
                    <li>Truy cập vào hệ thống EVDMS</li>
                    <li>Đăng nhập bằng email và mật khẩu tạm thời</li>
                    <li>Đổi mật khẩu mới</li>
                    <li>Khám phá hệ thống</li>
                </ol>
            </div>
            
            <p style='margin-top: 20px;'><strong>Chúc bạn có trải nghiệm tốt với EVDMS!</strong></p>
        </div>
        <div class='footer'>
            <p><strong>Electric Vehicle Dealer Management System (EVDMS)</strong></p>
            <p>© 2024 EVDMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            return await SendEmailAsync(toEmail, fullName, subject, htmlBody, ct);
        }
    }
}

