import React, { useState } from "react";
import "./DeliveryDetailView.css";
import deliveryApiService from "../../services/deliveryApiService";
import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const DeliveryDetailView = ({ delivery, onClose, onScheduleSuccess }) => {
  const [deliveryData, setDeliveryData] = useState({
    deliveryDate: delivery?.scheduledDate ? new Date(delivery.scheduledDate) : null,
    deliveryTime: delivery?.scheduledDate ? new Date(delivery.scheduledDate) : null,
    deliveryAddress: delivery?.deliveryAddress || "",
    contactPhone: delivery?.contactPhone || delivery?.customer?.phone || "",
    contactName: delivery?.receiverName || delivery?.customer?.name || "",
    notes: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isReadonly = delivery?.statusType === "ready" || delivery?.statusType === "delivered";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleInputChange = (field, value) => {
    setDeliveryData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleScheduleDelivery = async () => {
    // Validate
    if (!deliveryData.deliveryDate) {
      setError("Vui lòng chọn ngày giao xe");
      return;
    }
    if (!deliveryData.deliveryTime) {
      setError("Vui lòng chọn giờ giao xe");
      return;
    }
    if (!deliveryData.deliveryAddress) {
      setError("Vui lòng nhập địa chỉ giao xe");
      return;
    }
    if (!deliveryData.contactPhone) {
      setError("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Combine date and time
      const combinedDateTime = new Date(deliveryData.deliveryDate);
      const timeDate = new Date(deliveryData.deliveryTime);
      combinedDateTime.setHours(timeDate.getHours());
      combinedDateTime.setMinutes(timeDate.getMinutes());

      // Convert to ISO string for API
      const formattedData = {
        deliveryDate: combinedDateTime.toISOString(),
        deliveryAddress: deliveryData.deliveryAddress,
        contactPhone: deliveryData.contactPhone,
        contactName: deliveryData.contactName,
        notes: deliveryData.notes,
      };

      const result = await deliveryApiService.scheduleDelivery(delivery.orderId, formattedData);

      if (result.success) {
        alert("Đã lên lịch giao xe thành công!");
        if (onScheduleSuccess) {
          onScheduleSuccess();
        }
        // Close modal after success
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.error || "Không thể lên lịch giao xe");
      }
    } catch (err) {
      console.error("Error scheduling delivery:", err);
      setError("Đã xảy ra lỗi khi lên lịch giao xe");
    } finally {
      setSubmitting(false);
    }
  };

  if (!delivery) {
    return (
      <div className="delivery-detail-view-app">
        <div className="delivery-modal-overlay" onClick={onClose}>
          <div className="delivery-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="error-message">
              <h2>Không tìm thấy thông tin</h2>
              <p>Không thể tải thông tin lịch giao xe.</p>
              <button className="close-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-detail-view-app">
      <div className="delivery-modal-overlay" onClick={onClose}>
        <div className="delivery-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="delivery-modal-header">
            <div className="delivery-header-left">
              <div className="delivery-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <h2 className="delivery-modal-title">Lịch Giao Xe - {delivery.id}</h2>
            </div>
            <button className="delivery-close-btn" onClick={onClose}>
              Đóng
            </button>
          </div>

          {/* Body */}
          <div className="delivery-modal-body">
            {error && (
              <div className="error-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            <div className="delivery-content-grid">
              {/* Left Column - Delivery Form */}
              <div className="delivery-left-column">
                <div className="delivery-section">
                  <div className="delivery-section-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" fill="none" strokeWidth="2"/>
                    </svg>
                    <h3>Thông tin giao xe</h3>
                  </div>

                  <div className="delivery-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ngày giao xe *</label>
                        <DatePicker
                          selected={deliveryData.deliveryDate}
                          onChange={(date) => handleInputChange("deliveryDate", date)}
                          dateFormat="dd/MM/yyyy"
                          locale={vi}
                          minDate={new Date()}
                          disabled={isReadonly}
                          placeholderText="Chọn ngày giao xe"
                          className="form-input"
                          calendarClassName="custom-calendar"
                          wrapperClassName="date-picker-wrapper"
                        />
                      </div>

                      <div className="form-group">
                        <label>Giờ giao xe *</label>
                        <DatePicker
                          selected={deliveryData.deliveryTime}
                          onChange={(date) => handleInputChange("deliveryTime", date)}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Giờ"
                          dateFormat="HH:mm"
                          timeFormat="HH:mm"
                          disabled={isReadonly}
                          placeholderText="Chọn giờ"
                          className="form-input"
                          calendarClassName="custom-time-picker"
                          wrapperClassName="date-picker-wrapper"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Số điện thoại liên hệ *</label>
                        <input
                          type="tel"
                          value={deliveryData.contactPhone}
                          onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                          placeholder="Nhập số điện thoại"
                          disabled={isReadonly}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Tên người nhận</label>
                        <input
                          type="text"
                          value={deliveryData.contactName}
                          onChange={(e) => handleInputChange("contactName", e.target.value)}
                          placeholder="Nhập tên người nhận"
                          disabled={isReadonly}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Địa chỉ giao xe *</label>
                      <input
                        type="text"
                        value={deliveryData.deliveryAddress}
                        onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                        placeholder="Nhập địa chỉ giao xe"
                        disabled={isReadonly}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Ghi chú</label>
                      <textarea
                        value={deliveryData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Nhập ghi chú (nếu có)"
                        rows="3"
                        disabled={isReadonly}
                        className="form-textarea"
                      />
                    </div>

                    {!isReadonly && (
                      <button
                        className="schedule-btn"
                        onClick={handleScheduleDelivery}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="btn-spinner"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                            </svg>
                            Xác nhận lịch hẹn
                          </>
                        )}
                      </button>
                    )}

                    {isReadonly && (
                      <div className="readonly-notice">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <p>Lịch giao xe đã được lên. Trạng thái: <strong>{delivery.status}</strong></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Info */}
              <div className="delivery-right-column">
                {/* Customer Info */}
                <div className="delivery-section">
                  <div className="delivery-section-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <h3>Thông tin khách hàng</h3>
                  </div>
                  <div className="info-display">
                    <div className="info-row">
                      <div className="info-field">
                        <label>Tên khách hàng</label>
                        <div className="field-value">{delivery.customer?.name || "N/A"}</div>
                      </div>
                      <div className="info-field">
                        <label>Số điện thoại</label>
                        <div className="field-value">{delivery.customer?.phone || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="delivery-section">
                  <div className="delivery-section-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                    <h3>Thông tin xe</h3>
                  </div>
                  <div className="info-display">
                    <div className="info-row">
                      <div className="info-field">
                        <label>Tên xe</label>
                        <div className="field-value">{delivery.vehicle?.name || "N/A"}</div>
                      </div>
                      <div className="info-field">
                        <label>Màu sắc</label>
                        <div className="field-value">{delivery.vehicle?.color || "N/A"}</div>
                      </div>
                    </div>
                    <div className="info-field full-width">
                      <label>VIN</label>
                      <div className="field-value vin-code">{delivery.vin || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Scheduled Info (if already scheduled) */}
                {delivery.scheduledDate && (
                  <div className="delivery-section scheduled-info">
                    <div className="delivery-section-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <h3>Lịch đã hẹn</h3>
                    </div>
                    <div className="info-display">
                      <div className="info-field">
                        <label>Ngày hẹn</label>
                        <div className="field-value">{formatDate(delivery.scheduledDate)}</div>
                      </div>
                      {delivery.deliveryAddress && (
                        <div className="info-field full-width">
                          <label>Địa chỉ</label>
                          <div className="field-value">{delivery.deliveryAddress}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailView;
