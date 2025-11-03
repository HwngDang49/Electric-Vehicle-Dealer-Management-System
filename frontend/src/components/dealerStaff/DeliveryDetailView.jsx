import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./DeliveryDetailView.css";
import deliveryApiService from "../../services/deliveryApiService";
import invoiceApiService from "../../services/invoiceApiService";
import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import DeliveryDocView from "./DeliveryDocView";

const DeliveryDetailView = ({ delivery, onClose, onScheduleSuccess, onCreateInvoice }) => {
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
  const [showDocumentView, setShowDocumentView] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(delivery);
  const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Check if order has invoice
  const checkInvoiceExists = async (orderId) => {
    if (!orderId) return false;
    try {
      const response = await invoiceApiService.getRetailInvoices({
        page: 1,
        pageSize: 100,
      });
      const invoices = response.data?.items || response.data || response.value || [];
      // Check if any invoice matches this orderId
      return invoices.some(invoice => 
        invoice.orderId === orderId || 
        invoice.salesDocId === orderId ||
        invoice.orderId?.toString() === orderId?.toString()
      );
    } catch (error) {
      console.error("Error checking invoice:", error);
      return false;
    }
  };

  // Update currentDelivery when delivery prop changes
  useEffect(() => {
    if (delivery) {
      setCurrentDelivery(delivery);
      // Check if delivery is already completed
      const isCompleted = delivery.statusType === "delivered" || delivery.status === "Delivered";
      setIsDeliveryCompleted(isCompleted);
      
      // Check if invoice exists for this order
      const orderId = delivery.orderId || delivery.backendId;
      if (orderId && isCompleted) {
        checkInvoiceExists(orderId).then((exists) => {
          setHasInvoice(exists);
        });
      } else {
        setHasInvoice(false);
      }
    }
  }, [delivery]);

  // Refresh invoice status when delivery is completed
  useEffect(() => {
    if (isDeliveryCompleted && currentDelivery) {
      const orderId = currentDelivery.orderId || currentDelivery.backendId;
      if (orderId) {
        checkInvoiceExists(orderId).then((exists) => {
          setHasInvoice(exists);
        });
      }
    }
  }, [isDeliveryCompleted, currentDelivery]);

  const isReadonly = currentDelivery?.statusType === "ready" || currentDelivery?.statusType === "delivered";

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Refresh delivery data
  const refreshDeliveryData = async () => {
    try {
      // Try to find delivery in all statuses
      const result = await deliveryApiService.getDeliveryList({});
      if (result.success && result.data?.items) {
        const updatedDelivery = result.data.items.find(item => 
          item.orderId === delivery?.orderId || 
          item.id === delivery?.id ||
          item.backendId === delivery?.backendId
        );
        if (updatedDelivery) {
          console.log("Found updated delivery:", updatedDelivery);
          const transformedDelivery = {
            id: `DLV-${updatedDelivery.orderId}`,
            orderId: updatedDelivery.orderId,
            backendId: updatedDelivery.orderId,
            customer: {
              name: updatedDelivery.customerName,
              phone: updatedDelivery.customerPhone,
            },
            vehicle: {
              name: updatedDelivery.vehicleName,
              color: updatedDelivery.vehicleColor,
            },
            vin: updatedDelivery.vin || "N/A",
            status: updatedDelivery.status,
            statusType: updatedDelivery.status.toLowerCase(),
            scheduledDate: updatedDelivery.scheduledDeliveryDate,
            deliveryAddress: updatedDelivery.deliveryAddress,
            contactPhone: updatedDelivery.deliveryContactPhone,
            receiverName: updatedDelivery.receiverName,
            deliveryDocUrl: updatedDelivery.deliveryDocUrl,
            totalAmount: updatedDelivery.totalAmount,
            createdAt: updatedDelivery.createdAt,
          };
          setCurrentDelivery(transformedDelivery);
        } else {
          console.log("No updated delivery found, keeping current data");
          // Keep current delivery data if not found - don't update
        }
      }
    } catch (error) {
      console.error("Error refreshing delivery data:", error);
      // Keep current delivery data on error
    }
  };

  // Format date - Backend đã convert sang VN time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      let date;
      if (typeof dateString === "string") {
        // Backend đã convert sang VN time, nếu không có timezone info, thêm +07:00 để parse đúng
        let dateStr = dateString.trim();
        if (!dateStr.match(/[Z+-]\d{2}:?\d{2}$/)) {
          dateStr += "+07:00";
        }
        date = new Date(dateStr);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      if (isNaN(date.getTime())) {
        return "N/A";
      }

      // Format với timezone VN (Asia/Ho_Chi_Minh)
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "N/A";
    }
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
        // Pass success message to parent for toast display
        if (onScheduleSuccess) {
          onScheduleSuccess({
            type: "success",
            message: "Đã lên lịch giao xe thành công!"
          });
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

  const handleCompleteDelivery = async () => {
    setSubmitting(true);
    setError(null);

    // Validation: Cần có delivery_doc_url trước khi hoàn thành
    if (!currentDelivery?.deliveryDocUrl) {
      showToast("error", "Vui lòng upload tài liệu bàn giao xe trước khi hoàn thành giao hàng!");
      setSubmitting(false);
      return;
    }

    try {
      const result = await deliveryApiService.completeDelivery(currentDelivery.orderId, {
        deliveryDocUrl: currentDelivery.deliveryDocUrl,
        notes: deliveryData.notes,
        actualDeliveryTime: new Date().toISOString(),
      });

      if (result.success) {
        showToast("success", "Đã hoàn thành giao hàng thành công!");
        // Update delivery status to completed
        setCurrentDelivery(prev => ({
          ...prev,
          status: "Delivered",
          statusType: "delivered",
          deliveredAt: new Date().toISOString()
        }));
        setIsDeliveryCompleted(true);
        // Don't close modal, stay in DeliveryDetailView
      } else {
        const errorMsg = result.error || "Không thể hoàn thành giao hàng";
        showToast("error", errorMsg);
      }
    } catch (err) {
      console.error("Error completing delivery:", err);
      const errorMessage =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.errors ||
        err.response?.data?.message ||
        err.message ||
        "Đã xảy ra lỗi khi hoàn thành giao hàng";
      showToast("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentDelivery) {
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
      {toast && ReactDOM.createPortal(
        <div className={`delivery-detail-toast ${toast.type === 'error' ? 'delivery-detail-toast-error' : ''}`} style={{ zIndex: 99999 }}>
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {toast.type === 'error' ? (<path d="M18 6L6 18M6 6l12 12" />) : (<path d="M20 6L9 17l-5-5" />)}
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.type === 'error' ? 'Thất bại' : 'Thành công'}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div className="toast-progress"></div>
        </div>, document.body)}
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
              <h2 className="delivery-modal-title">Lịch Giao Xe - {currentDelivery.id}</h2>
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
                    {!isReadonly ? (
                      // Form for scheduling delivery
                      <>
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
                      </>
                    ) : (
                      // Read-only display for scheduled delivery
                      <div className="info-display">
                        <div className="info-row">
                          <div className="info-field">
                            <label>Ngày giao xe</label>
                            <div className="field-value">{deliveryData.deliveryDate ? deliveryData.deliveryDate.toLocaleDateString("vi-VN") : "Chưa cập nhật"}</div>
                          </div>
                          <div className="info-field">
                            <label>Giờ giao xe</label>
                            <div className="field-value">{deliveryData.deliveryTime ? deliveryData.deliveryTime.toLocaleTimeString("vi-VN", {hour: '2-digit', minute: '2-digit'}) : "Chưa cập nhật"}</div>
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-field">
                            <label>Số điện thoại liên hệ</label>
                            <div className="field-value">{deliveryData.contactPhone || "Chưa cập nhật"}</div>
                          </div>
                          <div className="info-field">
                            <label>Tên người nhận</label>
                            <div className="field-value">{deliveryData.contactName || "Chưa cập nhật"}</div>
                          </div>
                        </div>
                        <div className="info-field full-width">
                          <label>Địa chỉ giao xe</label>
                          <div className="field-value">{deliveryData.deliveryAddress || "Chưa cập nhật"}</div>
                        </div>
                        <div className="info-field full-width">
                          <label>Ghi chú</label>
                          <div className="field-value">{deliveryData.notes || "Không có ghi chú"}</div>
                        </div>
                        
                        {/* Action buttons for read-only mode */}
                        <div className="delivery-actions">
                          <button
                            className={`schedule-btn ${isDeliveryCompleted ? 'completed' : 'success'}`}
                            onClick={handleCompleteDelivery}
                            disabled={submitting || !currentDelivery?.deliveryDocUrl || isDeliveryCompleted}
                            title={
                              isDeliveryCompleted 
                                ? "Đã hoàn thành giao hàng" 
                                : !currentDelivery?.deliveryDocUrl 
                                  ? "Vui lòng upload tài liệu bàn giao xe trước" 
                                  : ""
                            }
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                            </svg>
                            {isDeliveryCompleted ? "Đã Giao Hàng Thành Công" : "Đã Giao Hàng Thành Công"}
                          </button>
                          
                          {/* Show Create Invoice button after delivery completion and if no invoice exists */}
                          {isDeliveryCompleted && !hasInvoice && (
                            <button
                              className="schedule-btn primary"
                              onClick={() => {
                                if (onCreateInvoice) {
                                  onCreateInvoice(delivery);
                                }
                              }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                              </svg>
                              Tạo Hóa Đơn
                            </button>
                          )}
                        </div>
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
                      <div className="field-value">{currentDelivery.customer?.name || "N/A"}</div>
                    </div>
                    <div className="info-field">
                      <label>Số điện thoại</label>
                      <div className="field-value">{currentDelivery.customer?.phone || "N/A"}</div>
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
                        <div className="field-value">{currentDelivery.vehicle?.name || "N/A"}</div>
                      </div>
                      <div className="info-field">
                        <label>Màu sắc</label>
                        <div className="field-value">{currentDelivery.vehicle?.color || "N/A"}</div>
                      </div>
                    </div>
                    <div className="info-field full-width">
                      <label>VIN</label>
                      <div className="field-value vin-code">{currentDelivery.vin || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Delivery Documents Card - Only show when delivery is scheduled */}
                {isReadonly && (
                  <div className="delivery-section">
                    <div className="delivery-section-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      <h3>Tài liệu bàn giao xe</h3>
                    </div>
                    <div className="delivery-doc-content">
                      <p className="delivery-doc-description">
                        Upload tài liệu bàn giao xe sau khi hoàn thành giao hàng
                      </p>
                      <button 
                        className="delivery-doc-btn"
                        onClick={() => setShowDocumentView(true)}
                      >
                        Xem tài liệu
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document View Modal - Render inside overlay like ContractView */}
      {showDocumentView && (
        <div className="delivery-doc-modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="delivery-doc-modal-wrapper">
            <DeliveryDocView
              delivery={{
                id: currentDelivery?.id || "",
                backendId: currentDelivery?.backendId || currentDelivery?.orderId || 0,
                hasDocument: !!(currentDelivery?.deliveryDocUrl),
                documentData: {
                  documentUrl: currentDelivery?.deliveryDocUrl || "",
                  uploadedAt: currentDelivery?.deliveredAt || "",
                  isUploaded: !!(currentDelivery?.deliveryDocUrl),
                }
              }}
              onBack={() => {
                setShowDocumentView(false);
                // Refresh delivery data when coming back from document view
                refreshDeliveryData();
              }}
              onDeliveryCompleted={async (deliveryId, data) => {
                setShowDocumentView(false);
                // Update only the deliveryDocUrl in current delivery
                if (data?.documentUrl) {
                  setCurrentDelivery(prev => ({
                    ...prev,
                    deliveryDocUrl: data.documentUrl
                  }));
                  // Also update deliveryData to reflect the change
                  setDeliveryData(prev => ({
                    ...prev,
                    notes: prev.notes || "Tài liệu đã được upload"
                  }));
                }
                // Show toast if message provided
                if (data?.toastMessage) {
                  showToast(data.toastMessage.type || "success", data.toastMessage.message);
                }
                // Refresh delivery data
                await refreshDeliveryData();
                // Re-check invoice status after refresh
                const orderId = currentDelivery?.orderId || currentDelivery?.backendId;
                if (orderId && isDeliveryCompleted) {
                  checkInvoiceExists(orderId).then((exists) => {
                    setHasInvoice(exists);
                  });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDetailView;
