using backend.Domain.Entities;

namespace backend.Infrastructure.Email
{
    /// <summary>
    /// Template builder cho email báo giá
    /// </summary>
    public static class QuotationEmailTemplate
    {
        public static string BuildEmailBody(Quote quote)
        {
            var customer = quote.Customer;
            var dealer = quote.Dealer;

            // Format currency VND
            string FormatCurrency(decimal amount)
            {
                return amount.ToString("N0", new System.Globalization.CultureInfo("vi-VN")) + " ₫";
            }

            // Format date
            string FormatDate(DateTime? date)
            {
                if (!date.HasValue) return "N/A";
                return date.Value.ToString("dd/MM/yyyy HH:mm", new System.Globalization.CultureInfo("vi-VN"));
            }

            // Build items table rows
            var itemsHtml = BuildItemsTable(quote.QuoteItems, FormatCurrency);

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    {GetEmailStyles()}
</head>
<body>
    <div class='container'>
        {BuildHeader()}
        <div class='content'>
            {BuildGreeting(customer.FullName)}
            {BuildQuoteInfo(quote, dealer, FormatDate)}
            {BuildItemsTableHtml(itemsHtml)}
            {BuildTotalSection(quote, FormatCurrency)}
            {BuildExpiryNotice(quote, FormatDate)}
            {BuildClosing()}
        </div>
        {BuildFooter()}
    </div>
</body>
</html>";

            return htmlBody;
        }

        private static string GetEmailStyles()
        {
            return @"
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 700px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #20c997 0%, #1ab085 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; margin-bottom: 10px; }
        .header p { margin: 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #20c997; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .info-row { display: flex; justify-content: space-between; margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #495057; font-size: 14px; }
        .value { color: #212529; font-weight: 500; text-align: right; font-size: 14px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
        .items-table th { background: #20c997; color: white; padding: 12px; text-align: left; font-weight: 600; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
        .total-section { background: #f0fdf4; border: 2px solid #20c997; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .total-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
        .total-row.grand { font-size: 20px; font-weight: 700; color: #20c997; margin-top: 15px; padding-top: 15px; border-top: 2px solid #20c997; }
        .expiry-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f8f9fa; padding: 25px; text-align: center; font-size: 13px; color: #6c757d; border-top: 1px solid #dee2e6; }
    </style>";
        }

        private static string BuildHeader()
        {
            return @"
        <div class='header'>
            <h1>📋 Báo Giá Xe Điện</h1>
            <p>Electric Vehicle Dealer Management System</p>
        </div>";
        }

        private static string BuildGreeting(string customerName)
        {
            return $@"
            <p style='font-size: 18px;'>Xin chào <strong>{customerName}</strong>,</p>
            <p>Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi. Dưới đây là báo giá chi tiết:</p>";
        }

        private static string BuildQuoteInfo(Quote quote, Dealer? dealer, Func<DateTime?, string> formatDate)
        {
            return $@"
            <div class='info-box'>
                <div class='info-row'>
                    <span class='label'>Mã báo giá:</span>
                    <span class='value'>#{quote.QuoteId}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Ngày tạo:</span>
                    <span class='value'>{formatDate(quote.CreatedAt)}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Ngày hết hạn:</span>
                    <span class='value'>{formatDate(quote.LockedUntil)}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Đại lý:</span>
                    <span class='value'>{dealer?.Name ?? "N/A"}</span>
                </div>
            </div>";
        }

        private static string BuildItemsTableHtml(string itemsRows)
        {
            return $@"
            <h3 style='color: #20c997; margin-top: 30px;'>Chi tiết sản phẩm</h3>
            <table class='items-table'>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style='text-align: center;'>Số lượng</th>
                        <th style='text-align: right;'>Đơn giá</th>
                        <th style='text-align: right;'>Giảm giá</th>
                        <th style='text-align: right;'>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsRows}
                </tbody>
            </table>";
        }

        private static string BuildItemsTable(ICollection<QuoteItem> items, Func<decimal, string> formatCurrency)
        {
            var itemsHtml = "";
            foreach (var item in items)
            {
                var productName = item.Product?.Name ?? "N/A";
                var colorName = item.Product?.ColorName ?? "";
                var productDisplay = string.IsNullOrWhiteSpace(colorName)
                    ? productName
                    : $"{productName} - {colorName}";

                itemsHtml += $@"
                    <tr>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef;'>{productDisplay}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;'>{item.Qty}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;'>{formatCurrency(item.UnitPrice)}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right; color: #28a745;'>{formatCurrency(item.LinePromo)}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600;'>{formatCurrency(item.LineTotal ?? 0)}</td>
                    </tr>";
            }
            return itemsHtml;
        }

        private static string BuildTotalSection(Quote quote, Func<decimal, string> formatCurrency)
        {
            return $@"
            <div class='total-section'>
                <div class='total-row'>
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(quote.SubtotalAmount)}</span>
                </div>
                <div class='total-row'>
                    <span>Giảm giá:</span>
                    <span style='color: #28a745;'>-{formatCurrency(quote.PromotionAmount)}</span>
                </div>
                <div class='total-row grand'>
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(quote.TotalAmount)}</span>
                </div>
            </div>";
        }

        private static string BuildExpiryNotice(Quote quote, Func<DateTime?, string> formatDate)
        {
            return $@"
            <div class='expiry-notice'>
                <strong>⚠️ Lưu ý:</strong><br/>
                Báo giá này có hiệu lực đến <strong>{formatDate(quote.LockedUntil)}</strong>.<br/>
                Vui lòng liên hệ với chúng tôi để đặt hàng trước khi hết hạn.
            </div>";
        }

        private static string BuildClosing()
        {
            return @"
            <p style='margin-top: 20px;'><strong>Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi!</strong></p>";
        }

        private static string BuildFooter()
        {
            return @"
        <div class='footer'>
            <p><strong>Electric Vehicle Dealer Management System (EVDMS)</strong></p>
            <p>© 2024 EVDMS. All rights reserved.</p>
        </div>";
        }

        public static string GetEmailSubject(Dealer? dealer)
        {
            return $"Báo giá xe điện - {dealer?.Name ?? "EVDMS"}";
        }
    }
}
