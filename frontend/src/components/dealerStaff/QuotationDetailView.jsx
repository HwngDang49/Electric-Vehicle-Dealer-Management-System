import React, { useState, useEffect } from "react";
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
}) => {
  const [isSent, setIsSent] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isConvertedToOrder, setIsConvertedToOrder] = useState(false);
  const [checkingConversion, setCheckingConversion] = useState(true); // Start as true to prevent flash
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    if (quotation) {
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

        alert(`✅ Báo giá đã được gửi thành công!\n\n📅 Ngày hết hạn: ${formattedExpiryDate}\n\n⏰ Báo giá sẽ tự động hết hạn sau 7 ngày nếu khách hàng không liên hệ.`);
      } catch (error) {
        console.error("Error sending quote:", error);
        alert("Lỗi khi gửi báo giá: " + (error.message || "Vui lòng thử lại"));
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

        alert("Báo giá đã được ghi nhận thành công!");
      } catch (error) {
        console.error("Error finalizing quote:", error);
        let errorMessage = "Có lỗi xảy ra khi ghi nhận báo giá";
        if (error.response?.status === 401) {
          errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        alert(`Lỗi: ${errorMessage}`);
      }
    }
  };

  const handleConvertToOrder = async () => {
    if (!isFinalized) {
      alert("Chỉ có thể chuyển đổi báo giá đã được ghi nhận thành đơn hàng!");
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
      alert("Lỗi khi chuyển đổi báo giá sang đơn hàng: " + (error.message || "Vui lòng thử lại"));
    }
  };

  const handleSuccessfulConversion = async (responseData) => {
    const orderIds = responseData.orderIds || (responseData.orderId ? [responseData.orderId] : []);
    
    if (orderIds.length > 0) {
      // Mark as converted to order
      setIsConvertedToOrder(true);
      
      alert(`✅ Đã chuyển đổi thành công sang ${orderIds.length} đơn hàng!\n\nMã đơn hàng: ${orderIds.join(", ")}`);
      
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
  };

  if (!quotation) {
    return null;
  }

  const isExpired = quotation.status === "Expired";

  const getStatusBadge = () => {
    if (isExpired) {
      return <span className="quotation-status-badge expired">Hết hạn</span>;
    } else if (isFinalized) {
      return <span className="quotation-status-badge finalized">Đã ghi nhận</span>;
    } else if (isSent) {
      return <span className="quotation-status-badge sent">Đã gửi</span>;
    } else {
      return <span className="quotation-status-badge draft">Nháp</span>;
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
    <div className="quotation-detail-modal-overlay" onClick={onClose}>
      <div
        className="quotation-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="quotation-detail-modal-header">
          <h2>Chi tiết báo giá</h2>
          <button className="quotation-detail-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="quotation-detail-modal-body">
          {/* Header Card */}
          <div className="quotation-header-card">
            <div className="quotation-header-info">
              <h3>Báo giá #{quotation.quoteNumber || quotation.id}</h3>
              <div className="quotation-header-meta">
                <span>Ngày tạo: {quotation.date || "N/A"}</span>
                {quotation.lockedUntil && isSent && !isExpired && !isFinalized && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="expiry-date">
                      ⏰ Hết hạn: {new Date(quotation.lockedUntil).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Details */}
          <div className="quotation-details">
            {/* Left Column - Customer & Vehicle Info */}
            <div className="quotation-info-column">
              {/* Customer Information */}
              <div className="quotation-detail-section">
                <h4>Thông tin khách hàng</h4>
                <div className="quotation-detail-grid">
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Tên khách hàng</span>
                    <span className="quotation-detail-value">
                      {loadingCustomer ? (
                        <span className="loading-customer">Đang tải...</span>
                      ) : (
                        customerDetails?.fullName ||
                        quotation.customer?.name ||
                        quotation.customerName ||
                        "N/A"
                      )}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Số điện thoại</span>
                    <span className="quotation-detail-value">
                      {customerDetails?.phoneNumber ||
                        quotation.customer?.phone ||
                        quotation.phone ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Email</span>
                    <span className="quotation-detail-value">
                      {customerDetails?.email ||
                        quotation.customer?.email ||
                        quotation.email ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">CCCD/CMND</span>
                    <span className="quotation-detail-value">
                      {customerDetails?.idNumber ||
                        quotation.customer?.idNumber ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item full-width">
                    <span className="quotation-detail-label">Địa chỉ</span>
                    <span className="quotation-detail-value">
                      {customerDetails?.address ||
                        quotation.customer?.address ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="quotation-detail-section">
                <h4>Thông tin xe</h4>
                <div className="quotation-detail-grid">
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Model xe</span>
                    <span className="quotation-detail-value">
                      {quotation.vehicle?.name ||
                        quotation.vehicleModel ||
                        quotation.model ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Màu sắc</span>
                    <span className="quotation-detail-value">
                      {quotation.vehicle?.color ||
                        quotation.vehicle?.colorName ||
                        quotation.vehicleColor ||
                        quotation.color ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Dung lượng pin</span>
                    <span className="quotation-detail-value">
                      {quotation.vehicle?.batteryKwh ? `${quotation.vehicle.batteryKwh} kWh` : "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Công suất động cơ</span>
                    <span className="quotation-detail-value">
                      {quotation.vehicle?.motorKw ? `${quotation.vehicle.motorKw} kW` : "N/A"}
                    </span>
                  </div>
                  <div className="quotation-detail-item">
                    <span className="quotation-detail-label">Quãng đường</span>
                    <span className="quotation-detail-value">
                      {quotation.vehicle?.rangeKm ? `${quotation.vehicle.rangeKm} km` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price Summary */}
            <div className="quotation-price-summary">
              <h4>Chi tiết giá</h4>
              <div className="price-breakdown-row">
                <span>Giá niêm yết</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="price-breakdown-row discount-row">
                  <span>Giảm giá</span>
                  <span className="discount-amount-value">{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="price-breakdown-row total">
                <span>Tổng cộng</span>
                <span className="total-amount-value">{formatCurrency(finalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {!checkingConversion && !isConvertedToOrder && (
          <div className="quotation-detail-modal-footer">
            <button
              type="button"
              className={`quotation-action-btn send-quote-btn ${isSent ? "sent" : ""}`}
              onClick={handleSendQuotation}
              disabled={isFinalized || isExpired}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                {isFinalized ? (
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                ) : (
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                )}
              </svg>
              {isFinalized
                ? "Đã ghi nhận"
                : isSent
                ? "Ghi nhận báo giá"
                : "Gửi báo giá"}
            </button>

            <button
              type="button"
              className={`quotation-action-btn convert-order-btn ${
                isFinalized ? "enabled" : ""
              }`}
              onClick={handleConvertToOrder}
              disabled={!isFinalized || isExpired}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
              </svg>
              Chuyển sang đơn hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationDetailView;
