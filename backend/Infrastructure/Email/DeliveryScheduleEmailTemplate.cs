using System.Globalization;
using System.Text;
using backend.Common.Helpers;
using backend.Domain.Entities;

namespace backend.Infrastructure.Email
{
    /// <summary>
    /// Template builder cho email thông báo lịch giao xe cho khách hàng.
    /// </summary>
    public static class DeliveryScheduleEmailTemplate
    {
        public static string BuildEmailBody(Order order)
        {
            var customer = order.Customer;
            var dealer = order.Dealer;
            var branch = order.Branch;
            var inventory = order.Inventories.FirstOrDefault();
            var product = inventory?.Product;

            var scheduledAt = order.ScheduledDeliveryDate.HasValue
                ? DateTimeHelper.ToVietnamTime(order.ScheduledDeliveryDate.Value)
                : (DateTime?)null;

            string FormatDateTime(DateTime? dateTime)
            {
                if (!dateTime.HasValue)
                {
                    return "Chưa cập nhật";
                }

                return dateTime.Value.ToString("HH:mm 'ngày' dd/MM/yyyy", new CultureInfo("vi-VN"));
            }

            string FormatMoney(decimal amount)
            {
                return amount.ToString("N0", new CultureInfo("vi-VN")) + " ₫";
            }

            var vehicleInfo = new StringBuilder();
            if (product != null)
            {
                vehicleInfo.Append(product.Name);
                if (!string.IsNullOrWhiteSpace(product.ColorName))
                {
                    vehicleInfo.Append($" - {product.ColorName}");
                }
            }

            if (!string.IsNullOrWhiteSpace(inventory?.Vin))
            {
                vehicleInfo.Append(vehicleInfo.Length > 0 ? $" (VIN: {inventory.Vin})" : $"VIN: {inventory.Vin}");
            }

            var deliveryAddress = !string.IsNullOrWhiteSpace(order.DeliveryAddress)
                ? order.DeliveryAddress
                : branch?.Address ?? "Chưa cập nhật";

            var contactPerson = !string.IsNullOrWhiteSpace(order.ReceiverName)
                ? order.ReceiverName
                : customer?.FullName ?? "Quý khách";

            var contactPhone = !string.IsNullOrWhiteSpace(order.DeliveryContactPhone)
                ? order.DeliveryContactPhone
                : customer?.Phone ?? "Chưa cập nhật";

            var html = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    {GetEmailStyles()}
</head>
<body>
    <div class=""container"">
        {BuildHeader(dealer)}
        <div class=""content"">
            <p class=""greeting"">Xin chào <strong>{customer?.FullName ?? "Quý khách"}</strong>,</p>
            <p>Chúng tôi xin gửi thông tin chi tiết về lịch giao xe của quý khách như bên dưới:</p>

            <div class=""info-box"">
                <div class=""info-row"">
                    <span class=""label"">Thời gian giao xe</span>
                    <span class=""value"">{FormatDateTime(scheduledAt)}</span>
                </div>
                <div class=""info-row"">
                    <span class=""label"">Địa điểm</span>
                    <span class=""value"">{deliveryAddress}</span>
                </div>
                <div class=""info-row"">
                    <span class=""label"">Người nhận</span>
                    <span class=""value"">{contactPerson}</span>
                </div>
                <div class=""info-row"">
                    <span class=""label"">Số điện thoại liên hệ</span>
                    <span class=""value"">{contactPhone}</span>
                </div>
            </div>

            <h3>Thông tin xe</h3>
            <div class=""info-box secondary"">
                <div class=""info-row"">
                    <span class=""label"">Mẫu xe</span>
                    <span class=""value"">{vehicleInfo}</span>
                </div>
                <div class=""info-row"">
                    <span class=""label"">Giá trị đơn hàng</span>
                    <span class=""value"">{FormatMoney(order.TotalAmount)}</span>
                </div>
                {(order.DepositAmount > 0 ? $@"<div class=""info-row"">
                    <span class=""label"">Tiền đặt cọc</span>
                    <span class=""value"">{FormatMoney(order.DepositAmount)}</span>
                </div>" : string.Empty)}
            </div>

            <div class=""notice"">
                <p><strong>Lưu ý:</strong></p>
                <ul>
                    <li>Quý khách vui lòng mang theo giấy tờ tùy thân (CMND/CCCD) bản gốc để đối chiếu.</li>
                    <li>Đối với xe giao tại địa chỉ, vui lòng đảm bảo có người nhận xe tại thời điểm đã hẹn.</li>
                </ul>
            </div>

            <p>Chúng tôi rất mong được phục vụ quý khách và chúc quý khách có những trải nghiệm tuyệt vời cùng chiếc xe mới!</p>
            <p>Trân trọng,</p>
            <p><strong>{dealer?.Name ?? "EVDMS"}</strong></p>
        </div>
        {BuildFooter()}
    </div>
</body>
</html>";

            return html;
        }

        public static string GetEmailSubject(Order order)
        {
            var dealerName = order.Dealer?.Name ?? "EVDMS";
            var schedule = order.ScheduledDeliveryDate.HasValue
                ? DateTimeHelper.ToVietnamTime(order.ScheduledDeliveryDate.Value).ToString("dd/MM/yyyy", new CultureInfo("vi-VN"))
                : "sắp tới";

            return $"Thông báo lịch giao xe - {dealerName} ({schedule})";
        }

        private static string GetEmailStyles()
        {
            return @"
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 680px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); }
        .header { background: linear-gradient(135deg, #20c997 0%, #0ea5a6 100%); color: white; padding: 36px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.92; }
        .content { padding: 32px 34px; }
        .greeting { font-size: 18px; }
        .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
        .info-box.secondary { background: #f8fafc; border-color: #e2e8f0; }
        .info-row { display: flex; justify-content: space-between; gap: 18px; padding: 10px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.35); }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; }
        .value { color: #1f2937; font-weight: 500; text-align: right; font-size: 15px; }
        .notice { background: #fff7ed; border-left: 4px solid #fb923c; padding: 18px 22px; border-radius: 8px; margin: 28px 0; }
        .notice ul { padding-left: 18px; margin: 10px 0 0; }
        .footer { background: #0f172a; color: rgba(226, 232, 240, 0.9); padding: 24px; text-align: center; font-size: 13px; }
        .footer p { margin: 4px 0; }
    </style>";
        }

        private static string BuildHeader(Dealer? dealer)
        {
            var dealerName = dealer?.Name ?? "EVDMS";
            return $@"
        <div class=""header"">
            <h1>📦 Lịch Giao Xe Đã Được Xác Nhận</h1>
            <p>{dealerName}</p>
        </div>";
        }

        private static string BuildFooter()
        {
            return @"
        <div class=""footer"">
            <p><strong>Electric Vehicle Dealer Management System (EVDMS)</strong></p>
            <p>© 2024 EVDMS. All rights reserved.</p>
        </div>";
        }
    }
}

