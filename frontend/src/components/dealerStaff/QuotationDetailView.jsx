import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./QuotationDetailView.css";
import quoteApiService from "../../services/quoteApi";
import customerApiService from "../../services/customerApi";
import orderApiService from "../../services/orderApi";

const QuotationDetailView = ({
  quotation,
  onClose,
  formatCurrency,
  onUpdateQuotation,
  onConvertToOrder,
  onReloadData,
  onReloadOrders,
  onNavigateToOrders,
  onConvertSuccess,
  onConvertError,
}) => {
  const [isSent, setIsSent] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isConvertedToOrder, setIsConvertedToOrder] = useState(false);
  const [checkingConversion, setCheckingConversion] = useState(true); // Start as true to prevent flash
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  useEffect(() => {
    if (quotation) {
      console.log("🔍 QuotationDetailView - Full quotation data:", quotation);
      console.log("👤 Customer data:", quotation.customer);
      console.log("🚗 Vehicle data:", quotation.vehicle);
      
      const hasLockedUntil = quotation.lockedUntil && quotation.lockedUntil !== null;
      const isQuotationSent =
        quotation.status === "Sent" ||
        quotation.status === "Finalized" ||
        (quotation.status === "Draft" && quotation.lockedUntil);

      setIsSent(hasLockedUntil || isQuotationSent);
      setIsFinalized(quotation.status === "Finalized");

      if (quotation.customer?.id) {
        loadCustomerDetails(quotation.customer.id);
      }

      // Only check conversion for Finalized quotes (Draft/Sent cannot be converted)
      if (quotation.status === "Finalized" && quotation.backendId) {
        setCheckingConversion(true); // Reset to true before checking
        checkIfConvertedToOrder(quotation.backendId);
      } else {
        // Not finalized, so definitely not converted - show buttons immediately
        setCheckingConversion(false);
        setIsConvertedToOrder(false);
      }
    }
  }, [quotation]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const loadCustomerDetails = async (customerId) => {
    try {
      setLoadingCustomer(true);
      const response = await customerApiService.getCustomerById(customerId);
      setCustomerDetails(response.data);
    } catch (error) {
      console.error("Error loading customer details:", error);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const checkIfConvertedToOrder = async (quoteId) => {
    try {
      setCheckingConversion(true);
      
      // Get orders with max pageSize allowed by backend (100)
      // We'll check multiple pages if needed
      let page = 1;
      let hasOrder = false;
      let totalChecked = 0;
      
      while (page <= 10 && !hasOrder) { // Check max 10 pages (1000 orders)
        const response = await orderApiService.getOrders({ 
          pageSize: 100,
          page: page 
        });
        const orders = response?.data?.items || [];
        const totalCount = response?.data?.totalCount || 0;
        
        totalChecked += orders.length;
        
        // Check if any order has this quoteId
        hasOrder = orders.some(order => 
          order.quoteId === quoteId || 
          order.QuoteId === quoteId
        );
        
        console.log(`🔍 Page ${page}: Checked ${orders.length} orders, total: ${totalChecked}/${totalCount}`);
        
        // If we found it or no more pages, break
        if (hasOrder || orders.length === 0 || totalChecked >= totalCount) {
          break;
        }
        
        page++;
      }
      
      console.log("🔍 Final result - Quote converted:", {
        quoteId,
        hasOrder,
        totalChecked
      });

      if (hasOrder) {
        setIsConvertedToOrder(true);
      }
    } catch (error) {
      console.error("Error checking if quote converted:", error);
      // Don't set error state, just fail silently
    } finally {
      setCheckingConversion(false);
    }
  };

  const handleSendQuotation = async () => {
    if (!isSent) {
      try {
        const quoteId = quotation.backendId;
        if (!quoteId) {
          throw new Error("Không tìm thấy ID báo giá để gửi");
        }

        const response = await quoteApiService.sendQuote(quoteId);
        setIsSent(true);

        // Calculate expiry date (7 days from now)
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const formattedExpiryDate = expiryDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (onUpdateQuotation) {
          onUpdateQuotation(quotation.id, {
            ...quotation,
            status: response.data?.status || "Draft",
            lockedUntil:
              response.data?.lockedUntil ||
              expiryDate.toISOString(),
          });
        }

        if (onReloadData) {
          await onReloadData();
        }

        showToast("success", `Báo giá đã được gửi thành công! Ngày hết hạn: ${formattedExpiryDate}`);
      } catch (error) {
        console.error("Error sending quote:", error);
        const msg = error?.response?.data?.errors?.[0] || error?.response?.data?.errors || error?.message || "Lỗi khi gửi báo giá";
        showToast("error", msg);
      }
    } else if (!isFinalized) {
      try {
        const quoteId = quotation.backendId;
        if (!quoteId) {
          throw new Error("Không tìm thấy ID báo giá để ghi nhận");
        }

        const response = await quoteApiService.finalizeQuote(quoteId);
        setIsFinalized(true);

        if (onUpdateQuotation) {
          onUpdateQuotation(quotation.id, {
            ...quotation,
            status: "Finalized",
          });
        }

        if (onReloadData) {
          await onReloadData();
        }

        showToast("success", "Báo giá đã được ghi nhận thành công!");
      } catch (error) {
        console.error("Error finalizing quote:", error);
        let errorMessage = "Có lỗi xảy ra khi ghi nhận báo giá";
        if (error.response?.status === 401) {
          errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error?.response?.data?.errors?.[0] || error?.response?.data?.errors || error?.message || errorMessage;
        }
        showToast("error", errorMessage);
      }
    }
  };

  const handleConvertToOrder = async () => {
    if (!isFinalized) {
      if (onConvertError) {
        onConvertError("Chỉ có thể chuyển đổi báo giá đã được ghi nhận thành đơn hàng!");
      } else {
        showToast("error", "Chỉ có thể chuyển đổi báo giá đã được ghi nhận thành đơn hàng!");
      }
      return;
    }

    try {
      const quoteId = quotation.backendId;
      if (!quoteId) {
        throw new Error("Không tìm thấy ID báo giá để chuyển đổi");
      }

      console.log("🔄 Converting quote to order, quoteId:", quoteId);

      // Call backend API to convert quote to order
      const response = await quoteApiService.convertToOrder(quoteId, {
        confirmChanges: false, // First attempt without confirmation
      });

      console.log("✅ Convert response:", response);

      const responseData = response?.data || response;

      // Check if requires confirmation (promotion changed)
      if (responseData.requiresConfirmation) {
        const changeSummary = responseData.changeSummary;
        const oldPromo = changeSummary?.oldLinePromo || 0;
        const newPromo = changeSummary?.newLinePromo || 0;
        const oldTotal = changeSummary?.oldTotalAmount || 0;
        const newTotal = changeSummary?.newTotalAmount || 0;

        const confirmMessage = `⚠️ Khuyến mãi đã thay đổi!\n\n` +
          `Giảm giá cũ: ${formatCurrency(oldPromo)}\n` +
          `Giảm giá mới: ${formatCurrency(newPromo)}\n\n` +
          `Tổng tiền cũ: ${formatCurrency(oldTotal)}\n` +
          `Tổng tiền mới: ${formatCurrency(newTotal)}\n\n` +
          `Bạn có muốn tiếp tục chuyển đổi với giá mới không?`;

        if (window.confirm(confirmMessage)) {
          // User confirmed, retry with confirmChanges = true
          const confirmedResponse = await quoteApiService.convertToOrder(quoteId, {
            confirmChanges: true,
          });
          const confirmedData = confirmedResponse?.data || confirmedResponse;
          handleSuccessfulConversion(confirmedData);
        }
      } else {
        // No confirmation needed, proceed with conversion
        handleSuccessfulConversion(responseData);
      }
    } catch (error) {
      console.error("❌ Error converting quote to order:", error);
      const msg = error?.response?.data?.errors?.[0] || error?.response?.data?.errors || error?.message || "Lỗi khi chuyển đổi báo giá sang đơn hàng";
      // Use callback from parent (QuotationManagement) to show toast there
      if (onConvertError) {
        onConvertError(msg);
      } else {
        // Fallback: show toast here if no callback provided
        showToast("error", msg);
      }
    }
  };

  const handleSuccessfulConversion = async (responseData) => {
    const orderIds = responseData.orderIds || (responseData.orderId ? [responseData.orderId] : []);
    
    if (orderIds.length > 0) {
      // Mark as converted to order
      setIsConvertedToOrder(true);
      
      // Use callback from parent (QuotationManagement) to show toast there
      if (onConvertSuccess) {
        await onConvertSuccess(orderIds, quotation);
      } else {
        // Fallback: show toast here if no callback provided
        showToast("success", `Đã chuyển đổi thành công sang ${orderIds.length} đơn hàng! Mã đơn hàng: ${orderIds.join(", ")}`);
        
        // Reload quotes data
        if (onReloadData) {
          await onReloadData();
        }

        // Reload orders data from backend to get correct status
        if (onReloadOrders) {
          await onReloadOrders();
        }

        // Close detail view
        if (onClose) {
          onClose();
        }

        // Navigate to order management
        if (onNavigateToOrders) {
          onNavigateToOrders();
        }
      }
    }
  };

  if (!quotation) {
    return null;
  }

  const isExpired = quotation.status === "Expired";

  const getStatusBadge = () => {
    if (isExpired) {
      return <span className="dealer-quote-status-badge status-expired">Hết hạn</span>;
    } else if (isFinalized) {
      return <span className="dealer-quote-status-badge status-finalized">Đã ghi nhận</span>;
    } else if (isSent) {
      return <span className="dealer-quote-status-badge status-sent">Đã gửi</span>;
    } else {
      return <span className="dealer-quote-status-badge status-draft">Nháp</span>;
    }
  };

  // Get pricing data - prefer pricingDetails, fallback to quotation properties
  const basePrice = quotation.pricingDetails?.basePrice || 
                   quotation.basePrice || 
                   quotation.vehicle?.price || 
                   quotation.amount || 0;
  
  const discountAmount = quotation.pricingDetails?.discountAmount || 
                        quotation.pricingDetails?.discount ||
                        quotation.discount || 
                        quotation.vehicle?.oemDiscountAmount || 0;
  
  const finalPrice = quotation.amount || (basePrice - discountAmount);

  return (
    <div className="dealer-staff-quote-detail-app">
      {toast && ReactDOM.createPortal(
        <div className={`quote-toast ${toast.type === 'error' ? 'quote-toast-error' : ''}`}>
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

      <div className="dealer-quote-modal-overlay" onClick={onClose}>
        <div
          className="dealer-quote-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="dealer-quote-modal-header">
            <div className="dealer-quote-modal-header-left">
              <div className="dealer-quote-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div>
                <h2 className="dealer-quote-modal-title">Chi Tiết Báo Giá</h2>
                <p className="dealer-quote-modal-subtitle">
                  #{quotation.quoteNumber || quotation.id}
                </p>
              </div>
            </div>
            <div className="dealer-quote-modal-header-actions">
              {getStatusBadge()}
              <button className="dealer-quote-secondary-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>

        {/* Body - 2-Column Layout */}
          <div className="dealer-quote-content-grid">
            {/* Left Column - Customer & Vehicle Info */}
            <div className="dealer-quote-content-col">
              {/* Customer Information */}
              <div className="dealer-quote-info-card">
                <div className="dealer-quote-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <h4>Thông Tin Khách Hàng</h4>
                </div>
                <div className="dealer-quote-info-body dealer-quote-grid-2col">
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Tên khách hàng</label>
                    <div className="dealer-quote-field-value">
                      {loadingCustomer ? (
                        <span className="loading-customer">Đang tải...</span>
                      ) : (
                        customerDetails?.fullName ||
                        quotation.customer?.name ||
                        quotation.customerName ||
                        "N/A"
                      )}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Số điện thoại</label>
                    <div className="dealer-quote-field-value">
                      {customerDetails?.phoneNumber ||
                        quotation.customer?.phone ||
                        quotation.phone ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Email</label>
                    <div className="dealer-quote-field-value">
                      {customerDetails?.email ||
                        quotation.customer?.email ||
                        quotation.email ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">CCCD/CMND</label>
                    <div className="dealer-quote-field-value">
                      {customerDetails?.idNumber ||
                        quotation.customer?.idNumber ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field dealer-quote-field-full">
                    <label className="dealer-quote-field-label">Địa chỉ</label>
                    <div className="dealer-quote-field-value">
                      {customerDetails?.address ||
                        quotation.customer?.address ||
                        "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="dealer-quote-info-card">
                <div className="dealer-quote-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <h4>Thông Tin Xe</h4>
                </div>
                <div className="dealer-quote-info-body dealer-quote-grid-2col">
                  <div className="dealer-quote-field dealer-quote-field-full">
                    <label className="dealer-quote-field-label">Model xe</label>
                    <div className="dealer-quote-field-value">
                      {quotation.vehicle?.name ||
                        quotation.vehicleModel ||
                        quotation.model ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Màu sắc</label>
                    <div className="dealer-quote-field-value">
                      {quotation.vehicle?.color ||
                        quotation.vehicle?.colorName ||
                        quotation.vehicleColor ||
                        quotation.color ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Dung lượng pin</label>
                    <div className="dealer-quote-field-value">
                      {quotation.vehicle?.batteryKwh ? `${quotation.vehicle.batteryKwh} kWh` : "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Công suất động cơ</label>
                    <div className="dealer-quote-field-value">
                      {quotation.vehicle?.motorKw ? `${quotation.vehicle.motorKw} kW` : "N/A"}
                    </div>
                  </div>
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Quãng đường</label>
                    <div className="dealer-quote-field-value">
                      {quotation.vehicle?.rangeKm ? `${quotation.vehicle.rangeKm} km` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Information Card */}
              <div className="dealer-quote-info-card">
                <div className="dealer-quote-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  <h4>Thông Tin Thời Gian</h4>
                </div>
                <div className="dealer-quote-info-body">
                  <div className="dealer-quote-field">
                    <label className="dealer-quote-field-label">Ngày tạo</label>
                    <div className="dealer-quote-field-value dealer-quote-date-value">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                      </svg>
                      {quotation.date || "N/A"}
                    </div>
                  </div>
                  {quotation.lockedUntil && isSent && !isExpired && !isFinalized && (
                    <div className="dealer-quote-field">
                      <label className="dealer-quote-field-label">Ngày hết hạn</label>
                      <div className="dealer-quote-field-value dealer-quote-date-value expiry">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {new Date(quotation.lockedUntil).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Price Summary & Quick Actions */}
            <div className="dealer-quote-content-col">

              {/* Price Summary Card */}
              <div className="dealer-quote-info-card dealer-quote-price-card">
                <div className="dealer-quote-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                  </svg>
                  <h4>Chi Tiết Giá</h4>
                </div>
                <div className="dealer-quote-price-body">
                  <div className="dealer-quote-price-row">
                    <span>Giá niêm yết</span>
                    <span>{formatCurrency(basePrice)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="dealer-quote-price-row discount">
                      <span>Giảm giá</span>
                      <span className="discount-value">{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="dealer-quote-price-divider"></div>
                  <div className="dealer-quote-price-row total">
                    <span>Tổng cộng</span>
                    <span className="total-value">{formatCurrency(finalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              {!checkingConversion && !isConvertedToOrder && (
                <div className="dealer-quote-actions-card">
                  <div className="dealer-quote-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" />
                    </svg>
                    <h4>Thao Tác Nhanh</h4>
                  </div>
                  <div className="dealer-quote-actions-body">
                    <button
                      type="button"
                      className={`dealer-quote-action-btn ${isSent ? "sent" : ""}`}
                      onClick={handleSendQuotation}
                      disabled={isFinalized || isExpired}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        {isFinalized ? (
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        ) : (
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        )}
                      </svg>
                      <div className="action-content">
                        <div className="action-title">
                          {isFinalized
                            ? "Đã ghi nhận"
                            : isSent
                            ? "Ghi nhận báo giá"
                            : "Gửi báo giá"}
                        </div>
                        <div className="action-subtitle">
                          {isFinalized
                            ? "Báo giá đã được ghi nhận"
                            : isSent
                            ? "Xác nhận khách hàng đồng ý"
                            : "Gửi báo giá cho khách hàng"}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`dealer-quote-action-btn ${
                        isFinalized ? "enabled" : ""
                      }`}
                      onClick={handleConvertToOrder}
                      disabled={!isFinalized || isExpired}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                      </svg>
                      <div className="action-content">
                        <div className="action-title">Chuyển sang đơn hàng</div>
                        <div className="action-subtitle">
                          {!isFinalized 
                            ? "Cần ghi nhận báo giá trước"
                            : "Tạo đơn hàng từ báo giá"}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailView;
