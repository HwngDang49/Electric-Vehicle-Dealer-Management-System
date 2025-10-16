import React, { useState } from "react";
import "./QuotationDetailView.css";
import quoteApiService from "../../services/quoteApi";

const QuotationDetailView = ({
  quotation,
  onClose,
  formatCurrency,
  onUpdateQuotation,
  onConvertToOrder,
}) => {
  console.log("QuotationDetailView received quotation:", quotation);
  const [isSent, setIsSent] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  // Debug: Check if quotation exists
  if (!quotation) {
    console.log("Quotation is null or undefined");
    return (
      <div className="quotation-detail-view">
        <div className="error-message">
          <h2>Không tìm thấy báo giá</h2>
          <p>Báo giá không tồn tại hoặc đã bị xóa.</p>
          <button className="back-btn" onClick={onClose}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleSendQuotation = async () => {
    if (!isSent) {
      setIsSent(true);
    } else if (!isFinalized) {
      // Ghi nhận báo giá - gọi API finalizeQuote
      try {
        // Sử dụng backendId thay vì id để gọi API
        const quoteId = quotation.backendId || quotation.id;
        console.log("🌐 Finalizing quote with ID:", quoteId);
        console.log("🌐 Quote object:", quotation);
        const response = await quoteApiService.finalizeQuote(quoteId);
        console.log("✅ Quote finalized successfully:", response);
        
        setIsFinalized(true);
        if (onUpdateQuotation) {
          onUpdateQuotation(quotation.id, { ...quotation, status: "Finalized" });
        }
      } catch (error) {
        console.error("❌ Error finalizing quote:", error);
        // Có thể thêm thông báo lỗi cho user ở đây
        alert("Có lỗi xảy ra khi ghi nhận báo giá. Vui lòng thử lại.");
      }
    }
  };

  const handleConvertToOrder = () => {
    if (isFinalized && onConvertToOrder) {
      // Convert quotation to order format
      const orderData = {
        id: `DH${Date.now()}`, // Generate new order ID
        customer: {
          name: quotation.customer.name,
          phone: quotation.customer.phone,
        },
        vehicle: {
          name: quotation.vehicle.name,
          color: quotation.vehicle.color,
        },
        amount: `${
          quotation.quotation?.finalPrice || quotation.vehicle?.price || 0
        }`,
        status: "Draft",
        statusType: "draft",
        date: new Date().toISOString().split("T")[0],
        // Additional fields for order
        deposit: quotation.quotation?.discountAmount || 0,
        finalPrice:
          quotation.quotation?.finalPrice || quotation.vehicle?.price || 0,
        discount: quotation.quotation?.discount || 0,
        tax: 0, // Default tax
      };

      onConvertToOrder(orderData);
    }
  };

  return (
    <div className="quotation-detail-view">
      <div className="detail-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Chi tiết báo giá</h1>
            <p>Xem thông tin chi tiết báo giá #{quotation.id}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-layout">
          {/* Left Column - Details */}
          <div className="detail-left">
            <div className="detail-sections">
              {/* Customer Information */}
              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ và tên:</label>
                    <span>{quotation.customer.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{quotation.customer.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{quotation.customer.email || "Chưa cập nhật"}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mẫu xe:</label>
                    <span>{quotation.vehicle.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Màu sắc:</label>
                    <span>{quotation.vehicle.color}</span>
                  </div>
                </div>
              </div>

              {/* Quotation Information */}
              <div className="detail-section">
                <h3>Thông tin báo giá</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>QuoteID:</label>
                    <span className="quotation-id">#{quotation.id}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <button
                      className={`status-button ${
                        isFinalized ? "finalized-btn" : "draft-btn"
                      }`}
                      disabled
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        {isFinalized ? (
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        ) : (
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        )}
                      </svg>
                      {isFinalized ? "Finalized" : "Draft"}
                    </button>
                  </div>
                  <div className="info-item">
                    <label>Ngày tạo:</label>
                    <span>{quotation.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="detail-right">
            <div className="quotation-summary">
              <h3>Tóm tắt báo giá</h3>
              <div className="summary-content">
                <div className="summary-item">
                  <label>Tổng giá trị:</label>
                  <span className="total-amount">
                    {formatCurrency(quotation.amount)}
                  </span>
                </div>
                {quotation.discount > 0 && (
                  <div className="summary-item">
                    <label>Giảm giá:</label>
                    <span className="discount-amount">
                      -{quotation.discount}%
                    </span>
                  </div>
                )}
                <div className="summary-divider"></div>
                <div className="summary-item total">
                  <label>Thành tiền:</label>
                  <span className="final-amount">
                    {formatCurrency(quotation.amount)}
                  </span>
                </div>
              </div>

              <div className="summary-actions">
                <button
                  type="button"
                  className={`send-quotation-btn ${
                    isSent
                      ? isFinalized
                        ? "confirmed-btn"
                        : "confirm-btn"
                      : ""
                  }`}
                  onClick={handleSendQuotation}
                  disabled={isFinalized}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  {isFinalized
                    ? "Đã ghi nhận"
                    : isSent
                    ? "Ghi nhận báo giá"
                    : "Gửi báo giá"}
                </button>

                <button
                  type="button"
                  className={`convert-order-btn ${
                    !isFinalized ? "disabled" : ""
                  }`}
                  onClick={handleConvertToOrder}
                  disabled={!isFinalized}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
                  </svg>
                  Chuyển sang đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailView;
