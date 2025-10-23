import React from "react";
import "./CustomerDetailView.css";

const CustomerDetailView = ({
  customer,
  onBack,
  onCreateQuotation,
  onCreateOrder,
}) => {
  const handleCreateQuotation = () => {
    if (onCreateQuotation) {
      onCreateQuotation(customer);
    }
  };

  const handleCreateOrder = () => {
    if (onCreateOrder) {
      onCreateOrder(customer);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
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
    <div className="modal-overlay" onClick={onBack}>
      <div className="modal-content customer-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Chi tiết khách hàng</h2>
          <button className="close-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Customer Header */}
          <div className="customer-header">
            <div className="customer-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>{customer?.fullName || "N/A"}</h3>
                {getStatusBadge(customer?.status)}
              </div>
              <p className="customer-id" style={{ margin: 0, color: '#6c757d' }}>
                ID: {customer?.customerId || customer?.id || "N/A"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="customer-details">
            {/* Thông tin liên hệ */}
            <div className="detail-section">
              <h4>Thông tin liên hệ</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Họ và tên:</span>
                  <span className="detail-value">{customer?.fullName || "-"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Số điện thoại:</span>
                  <span className="detail-value">{customer?.phone || "-"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{customer?.email || "-"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Số CMND/CCCD:</span>
                  <span className="detail-value">{customer?.idNumber || "-"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Địa chỉ:</span>
                  <span className="detail-value">{customer?.address || "-"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng thái:</span>
                  <div className="detail-value">
                    {getStatusBadge(customer?.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin hệ thống */}
            <div className="detail-section">
              <h4>Thông tin hệ thống</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">ID Khách hàng:</span>
                  <span className="detail-value">{customer?.customerId || customer?.id || "-"}</span>
                </div>
                {customer?.createdAt && (
                  <div className="detail-item">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">{formatDate(customer?.createdAt)}</span>
                  </div>
                )}
                {customer?.updatedAt && (
                  <div className="detail-item">
                    <span className="detail-label">Cập nhật lần cuối:</span>
                    <span className="detail-value">{formatDate(customer?.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="modal-footer">
          <div className="customer-actions">
            {!customer?.hasQuote && (
              <button className="action-btn quote-btn" onClick={handleCreateQuotation}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Tạo báo giá
              </button>
            )}
            <button className="action-btn order-btn" onClick={handleCreateOrder}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
              </svg>
              Tạo đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
