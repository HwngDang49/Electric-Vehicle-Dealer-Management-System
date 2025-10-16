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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    // ... (hàm này giữ nguyên)
  };

  return (
    <div className="customer-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          {/* ... svg icon */}
          Quay lại
        </button>
        <h1>Chi tiết khách hàng</h1>
      </div>

      {/* Customer Info */}
      <div className="customer-info-form">
        <div className="form-fields">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer ID</label>
              {/* ✅ SỬA LỖI 1: Hiển thị đúng ID */}
              <div className="form-value">
                {customer.id || customer.customerId || "N/A"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              {/* ✅ SỬA LỖI 2: Dùng 'fullName' thay vì 'name' */}
              <div className="form-value">{customer.fullName}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <div className="form-value">{customer.phone}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-value">{customer.email}</div>
            </div>
          </div>

          {/* ... các hàng còn lại không đổi ... */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số CMND/CCCD</label>
              <div className="form-value">{customer.idNumber}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <div className="form-value">{customer.address}</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <div className="form-value">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(customer.status) }}
                >
                  {customer.status}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày tạo</label>
              <div className="form-value">
                {formatDate(customer.createdAt ?? customer.CreatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            className="action-btn create-quote-btn"
            onClick={handleCreateQuotation}
          >
            Tạo báo giá
          </button>
          <button
            className="action-btn create-order-btn"
            onClick={handleCreateOrder}
          >
            Tạo đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
