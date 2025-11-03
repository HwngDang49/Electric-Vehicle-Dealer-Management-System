import React, { useState } from "react";
import "./CustomerDetailView.css";

const CustomerDetailView = ({
  customer,
  onBack,
  onCreateQuotation,
  onCreateOrder,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      let date;
      if (typeof dateString === "string") {
        // Backend đã convert sang VN time, nếu không có timezone info, thêm +07:00 để parse đúng
        // VD: "2024-11-03T11:32:00" -> "2024-11-03T11:32:00+07:00"
        let dateStr = dateString.trim();
        // Nếu không có timezone indicator (Z hoặc +-XX:XX)
        if (!dateStr.match(/[Z+-]\d{2}:?\d{2}$/)) {
          // Thêm +07:00 (VN timezone) để parse đúng
          dateStr += "+07:00";
        }
        date = new Date(dateStr);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      if (isNaN(date.getTime())) {
        return "-";
      }

      // Format với timezone VN (Asia/Ho_Chi_Minh)
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Contact: { text: "Contact", class: "status-contact" },
      Prospect: { text: "Prospect", class: "status-prospect" },
      Customer: { text: "Customer", class: "status-customer" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="dealer-staff-customer-detail-app">
      <div className="dealer-customer-modal-overlay">
        <div className="dealer-customer-modal-container">
          {/* Header */}
          <div className="dealer-customer-modal-header">
            <div className="dealer-customer-modal-header-left">
              <div className="dealer-customer-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <div>
                <h2 className="dealer-customer-modal-title">Chi Tiết Khách Hàng</h2>
                <p className="dealer-customer-modal-subtitle">
                  Quản lý thông tin khách hàng
                </p>
              </div>
            </div>
            <div className="dealer-customer-modal-header-actions">
              <button className="dealer-customer-secondary-btn" onClick={onBack}>
                Đóng
              </button>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="dealer-customer-content-grid">
            {/* Left Column - Main Info */}
            <div className="dealer-customer-content-col">
              <div className="dealer-customer-info-card">
                <div className="dealer-customer-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <h4>Thông Tin Cơ Bản</h4>
                </div>
                <div className="dealer-customer-info-body">
                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      Họ và Tên
                    </label>
                    <div className="dealer-customer-field-value">
                      {customer?.fullName || "-"}
                    </div>
                  </div>

                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      Số Điện Thoại
                    </label>
                    <div className="dealer-customer-field-value">
                      {customer?.phone || "-"}
                    </div>
                  </div>

                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      Email
                    </label>
                    <div className="dealer-customer-field-value">
                      {customer?.email || "-"}
                    </div>
                  </div>

                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      Số CMND/CCCD
                    </label>
                    <div className="dealer-customer-field-value">
                      {customer?.idNumber || "-"}
                    </div>
                  </div>

                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      Địa Chỉ
                    </label>
                    <div className="dealer-customer-field-value">
                      {customer?.address || "-"}
                    </div>
                  </div>

                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      Trạng Thái
                    </label>
                    <div className="dealer-customer-field-value">
                      {getStatusBadge(customer?.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - System Info */}
            <div className="dealer-customer-content-col">
              {/* System Info Card */}
              <div className="dealer-customer-info-card">
                <div className="dealer-customer-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                  <h4>Thông Tin Hệ Thống</h4>
                </div>
                <div className="dealer-customer-info-body">
                  <div className="dealer-customer-field">
                    <label className="dealer-customer-field-label">
                      ID Khách Hàng
                    </label>
                    <div className="dealer-customer-field-value">
                      {customer?.customerId || customer?.id || "-"}
                    </div>
                  </div>

                  {customer?.createdAt && (
                    <div className="dealer-customer-field">
                      <label className="dealer-customer-field-label">
                        Ngày Tạo
                      </label>
                      <div className="dealer-customer-field-value dealer-customer-date-value">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                        {formatDate(customer?.createdAt)}
                      </div>
                    </div>
                  )}

                  {customer?.updatedAt && (
                    <div className="dealer-customer-field">
                      <label className="dealer-customer-field-label">
                        Cập Nhật Lần Cuối
                      </label>
                      <div className="dealer-customer-field-value dealer-customer-date-value">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(customer?.updatedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="dealer-customer-actions-card">
                <div className="dealer-customer-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" />
                  </svg>
                  <h4>Thao Tác Nhanh</h4>
                </div>
                <div className="dealer-customer-actions-body">
                  {!customer?.hasQuote && (
                    <button 
                      className="dealer-customer-action-btn quote-btn"
                      onClick={() => onCreateQuotation(customer)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <div className="action-content">
                        <div className="action-title">Tạo Báo Giá</div>
                        <div className="action-subtitle">Lập báo giá cho khách hàng</div>
                      </div>
                    </button>
                  )}
                  <button 
                    className="dealer-customer-action-btn order-btn"
                    onClick={() => onCreateOrder(customer)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                    </svg>
                    <div className="action-content">
                      <div className="action-title">Tạo Đơn Hàng</div>
                      <div className="action-subtitle">Tạo đơn hàng mới</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dealer-customer-modal-footer">
            <div className="dealer-customer-view-actions"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
