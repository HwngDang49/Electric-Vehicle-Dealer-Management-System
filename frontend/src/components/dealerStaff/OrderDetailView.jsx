import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./OrderDetailView.css";
import ContractView from "./ContractView";
import PaymentPopup from "./PaymentPopup";
import apiClient from "../../services/api";
import orderApiService from "../../services/orderApi";
import { API_ENDPOINTS } from "../../services/constants";

const OrderDetailView = ({
  order,
  onClose,
  onNavigateToVinAllocation,
  onNavigateToDelivery,
  onContractCreated,
  onPaymentSuccess,
}) => {
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [hasContract, setHasContract] = useState(order.hasContract || false);
  const [localOrder, setLocalOrder] = useState(order);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [contractViewKey, setContractViewKey] = useState(0); // For forcing ContractView reload
  const [contractToastMessage, setContractToastMessage] = useState(null); // Toast message for ContractView after reload
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Format currency function
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date function - Backend đã convert sang VN time
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
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

  // Load full order details from API
  const loadOrderDetail = async () => {
      if (!order.backendId) {
        setLoadingDetail(false);
        return;
      }

      try {
        setLoadingDetail(true);
        console.log("📥 Loading order detail for:", order.backendId);
        
        const response = await apiClient.get(`/orders/${order.backendId}`);
        const detailData = response.data?.value || response.data?.data || response.data;
        
        console.log("✅ Order detail loaded:", detailData);

        // Transform backend data to match frontend structure
        const transformedOrder = {
          ...order,
          customer: {
            name: detailData.customer?.fullName || order.customer?.name,
            phone: detailData.customer?.phone || order.customer?.phone,
            email: detailData.customer?.email || order.customer?.email,
            idNumber: detailData.customer?.idNumber,
            address: detailData.customer?.address,
          },
          vehicle: {
            name: detailData.item?.productName || order.vehicle?.name,
            color: detailData.item?.productColor || order.vehicle?.color,
            colorName: detailData.item?.productColor || order.vehicle?.colorName,
            batteryKwh: detailData.item?.batteryKwh,
            motorKw: detailData.item?.motorKw,
            rangeKm: detailData.item?.rangeKm,
            modelCode: detailData.item?.modelCode,
            colorCode: detailData.item?.colorCode,
          },
          depositAmount: detailData.depositAmount || order.depositAmount || 0,
          depositRequirement: detailData.depositRequirement || 0, // Số tiền cọc yêu cầu
          amount: order.amount, // Keep from list
          backendId: order.backendId,
          deliveredAt: detailData.deliveredAt || order.deliveredAt,
          hasContract: detailData.contract != null,
          contractData: detailData.contract ? {
            contractNumber: detailData.contract.contractNo,
            fileUrl: detailData.contract.fileUrl,
            signedAt: detailData.contract.signedAt || null, // Có thể là null nếu chưa ký
            isSigned: detailData.contract.signedAt != null,
            depositAmount: detailData.depositRequirement || 0, // Số tiền cọc yêu cầu trong hợp đồng
          } : null,
        };

        setLocalOrder(transformedOrder);
        setHasContract(detailData.contract != null);
      } catch (error) {
        console.error("❌ Error loading order detail:", error);
        // Keep using order from list if API fails
        setLocalOrder(order);
      } finally {
        setLoadingDetail(false);
      }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [order.backendId]);

  // Expose loadOrderDetail for ContractView to reload
  const reloadOrderDetail = async () => {
    await loadOrderDetail();
  };

  // Update hasContract when order data changes
  useEffect(() => {
    setHasContract(order.hasContract || false);
  }, [order.hasContract]);

  // Debug: Check if order exists
  if (!order || !order.id) {
    return (
      <div className="order-detail-modal-overlay" onClick={onClose}>
        <div
          className="order-detail-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="order-error-message">
            <h2>Không tìm thấy đơn hàng</h2>
            <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
            <button className="order-back-btn" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    setShowPaymentPopup(true);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handlePaymentSuccess = async (paymentData) => {
    // Show toast first (before closing modal to avoid delay)
    if (paymentData && paymentData.amount) {
      const formattedAmount = new Intl.NumberFormat("vi-VN").format(paymentData.amount);
      showToast("success", `Đặt cọc thành công! Số tiền: ${formattedAmount} ₫`);
    } else {
      showToast("success", "Đặt cọc thành công!");
    }

    // Close modal immediately
    setShowPaymentPopup(false);
    setPaymentStatus("success");

    console.log("Payment successful, reloading order data...");

    // Reload order data from backend to get updated deposit amount
    try {
      const response = await apiClient.get(`/orders/${order.backendId}`);
      const orderData =
        response.data?.value || response.data?.data || response.data;

      console.log("✅ Order reloaded after deposit:", orderData);

      // Update local order with fresh data
      const updatedOrder = {
        ...localOrder,
        depositAmount: orderData.depositAmount || 0,
        depositRequirement: orderData.depositRequirement || 0,
      };

      setLocalOrder(updatedOrder);

      // Call parent handler to update orders state
      if (onPaymentSuccess) {
        onPaymentSuccess(order.id);
      }
    } catch (error) {
      console.error("❌ Error reloading order:", error);
      // Continue anyway - deposit was successful
    }
  };

  // Get deposit requirement from contract data or order data
  const depositAmount = localOrder.contractData?.depositAmount || 
                       localOrder.depositRequirement || 
                       0;

  console.log("Rendering OrderDetailView with order:", order);

  // Handle contract creation or update
  const handleContractCreated = async (orderId, contractInfo) => {
    console.log("Contract created/updated for order:", orderId, contractInfo);
    
    // Don't close modal - keep ContractView open to show toast and updated contract
    // User can manually close it by clicking "Quay lại" button
    
    // Reload order detail to get fresh contract data
    if (order.backendId) {
      try {
        console.log("📥 Reloading order detail after contract action...");
        const response = await apiClient.get(`/orders/${order.backendId}`);
        const detailData = response.data?.value || response.data?.data || response.data;
        
        console.log("✅ Order detail reloaded:", detailData);

        // Transform and update local order
        const transformedOrder = {
          ...order,
          customer: {
            name: detailData.customer?.fullName || order.customer?.name,
            phone: detailData.customer?.phone || order.customer?.phone,
            email: detailData.customer?.email || order.customer?.email,
            idNumber: detailData.customer?.idNumber,
            address: detailData.customer?.address,
          },
          vehicle: {
            name: detailData.item?.productName || order.vehicle?.name,
            color: detailData.item?.productColor || order.vehicle?.color,
            colorName: detailData.item?.productColor || order.vehicle?.colorName,
            batteryKwh: detailData.item?.batteryKwh,
            motorKw: detailData.item?.motorKw,
            rangeKm: detailData.item?.rangeKm,
            modelCode: detailData.item?.modelCode,
            colorCode: detailData.item?.colorCode,
          },
          depositAmount: detailData.depositAmount || order.depositAmount || 0,
          depositRequirement: detailData.depositRequirement || 0,
          amount: order.amount,
          backendId: order.backendId,
          statusType: order.statusType,
          deliveredAt: detailData.deliveredAt || order.deliveredAt,
          hasContract: detailData.contract != null,
          contractData: detailData.contract ? {
            contractNumber: detailData.contract.contractNo,
            fileUrl: detailData.contract.fileUrl,
            signedAt: detailData.contract.signedAt,
            isSigned: detailData.contract.signedAt != null,
            depositAmount: detailData.depositRequirement || 0,
          } : null,
        };

        setLocalOrder(transformedOrder);
        setHasContract(detailData.contract != null);
        
        // Force ContractView to reload by changing key
        if (contractInfo.contractNumber) {
          // Set toast message before reloading ContractView
          setContractToastMessage({
            type: "success",
            message: `Hợp đồng đã được tạo thành công! Mã hợp đồng: ${contractInfo.contractNumber}`
          });
          setContractViewKey(prev => prev + 1);
        }
        
        console.log("✅ Local order updated with fresh contract data");
      } catch (error) {
        console.error("❌ Error reloading order after contract action:", error);
      }
    }
    
    if (onContractCreated) {
      console.log("OrderDetailView - Calling parent onContractCreated");
      onContractCreated(orderId, contractInfo);
    }
  };

  // Handle confirm order
  const handleConfirmOrder = async () => {
    if (!order.backendId) {
      showToast("error", "Không tìm thấy thông tin đơn hàng!");
      return;
    }

    setConfirmingOrder(true);

    try {
      console.log("📤 Confirming order:", order.backendId);

      // Call backend API to confirm order
      const response = await apiClient.patch(
        `/orders/${order.backendId}/confirm`
      );

      console.log("✅ Order confirmed successfully:", response.data);

      // Update local state
      const updatedOrder = {
        ...localOrder,
        status: "Confirmed",
        statusType: "confirmed",
      };
      setLocalOrder(updatedOrder);

      // Show success toast
      showToast("success", "Đơn hàng đã được xác nhận thành công! Bạn có thể tiếp tục phân bổ VIN.");

      // Call parent handler to update orders state
      if (onPaymentSuccess) {
        onPaymentSuccess(order.id);
      }
    } catch (error) {
      console.error("❌ Error confirming order:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể xác nhận đơn hàng";
      showToast("error", errorMessage);
    } finally {
      setConfirmingOrder(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    // Only allow cancel for Draft orders
    if (localOrder.statusType !== "draft" && localOrder.status !== "Draft") {
      showToast("error", "Chỉ có thể hủy đơn hàng ở trạng thái nháp!");
      return;
    }

    // Show confirmation modal
    setShowConfirmCancel(true);
  };

  const confirmCancelOrder = async () => {
    setShowConfirmCancel(false);
    setIsCancellingOrder(true);
    try {
      const orderId = localOrder.backendId;
      if (!orderId) {
        throw new Error("Không tìm thấy ID đơn hàng để hủy");
      }

      // Cancel order
      await orderApiService.cancelOrder(orderId, {});

      showToast("success", "Đơn hàng đã được hủy thành công!");

      // Update local state
      const updatedOrder = {
        ...localOrder,
        status: "Canceled",
        statusType: "canceled",
      };
      setLocalOrder(updatedOrder);

      // Call parent handler to update orders state
      if (onPaymentSuccess) {
        onPaymentSuccess(localOrder.id);
      }

      // Close the detail view after a delay
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      const msg = error?.response?.data?.errors?.[0] || error?.response?.data?.errors || error?.message || "Lỗi khi hủy đơn hàng";
      showToast("error", msg);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Check if order is canceled
  const isCanceled = () => {
    const status = String(localOrder.statusType || localOrder.status || "").toLowerCase();
    return status === "canceled" || status === "cancelled";
  };

  const orderIsCanceled = isCanceled();

  // Get status badge
  const getStatusBadge = () => {
    const statusMap = {
      draft: { text: "Nháp", class: "draft" },
      pending: { text: "Chờ xử lý", class: "pending" },
      confirmed: { text: "Đã xác nhận", class: "confirmed" },
      allocated: { text: "Đã phân bổ", class: "allocated" },
      backordered: { text: "Chờ xe về", class: "backordered" },
      ready: { text: "Sẵn sàng", class: "ready" },
      delivered: { text: "Đã giao xe", class: "delivered" },
      closed: { text: "Đã hoàn thành", class: "completed" },
      canceled: { text: "Đã hủy", class: "canceled" },
    };

    // Lowercase check for localOrder.statusType
    const typeKey = String(localOrder.statusType || localOrder.status).toLowerCase();
    const status = statusMap[typeKey] || { text: localOrder.status, class: "draft" };
    return (
      <span className={`order-status-badge ${status.class}`}>
        {status.text}
      </span>
    );
  };

  return (
    <div className="order-detail-view-app">
      {toast && ReactDOM.createPortal(
        <div className={`order-toast ${toast.type === 'error' ? 'order-toast-error' : ''}`} style={{ zIndex: 99999 }}>
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

    <div className="order-detail-modal-overlay" onClick={onClose}>
      <div
        className="order-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="order-detail-modal-header">
          <div className="order-detail-modal-header-left">
            <div className="order-detail-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
              </svg>
            </div>
            <div>
              <h2 className="order-detail-modal-title">Chi tiết đơn hàng</h2>
              <p className="order-detail-modal-subtitle">
                #{localOrder.id}
              </p>
            </div>
          </div>
          <div className="order-detail-modal-header-actions">
            {getStatusBadge()}
            <button className="order-detail-close-btn" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="order-detail-modal-body">
          {loadingDetail ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '60px 20px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div className="order-loading-spinner"></div>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải thông tin đơn hàng...</p>
            </div>
          ) : (
            <>
          {/* Details */}
          <div className="order-details">
            {/* Left Column - Customer & Vehicle Info */}
            <div className="order-info-column">
              {/* Customer Information */}
              <div className="order-detail-section">
                <div className="order-detail-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <h4>Thông Tin Khách Hàng</h4>
                </div>
                <div className="order-detail-grid">
                  <div className="order-detail-item">
                    <span className="order-detail-label">Tên khách hàng</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.name || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Số điện thoại</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Email</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.email || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">CCCD/CMND</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.idNumber || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item full-width">
                    <span className="order-detail-label">Địa chỉ</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="order-detail-section">
                <div className="order-detail-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <h4>Thông Tin Xe</h4>
                </div>
                <div className="order-detail-grid">
                  <div className="order-detail-item full-width">
                    <span className="order-detail-label">Model xe</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.name || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Màu sắc</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.color || localOrder.vehicle?.colorName || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Dung lượng pin</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.batteryKwh ? `${localOrder.vehicle.batteryKwh} kWh` : "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Công suất động cơ</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.motorKw ? `${localOrder.vehicle.motorKw} kW` : "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Quãng đường</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.rangeKm ? `${localOrder.vehicle.rangeKm} km` : "N/A"}
                    </span>
                  </div>
                  {localOrder.depositAmount > 0 && (
                    <>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Đã đặt cọc</span>
                        <span
                          className="order-detail-value"
                          style={{ color: "#10b981", fontWeight: "600" }}
                        >
                          {formatCurrency(localOrder.depositAmount)}
                        </span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Còn lại</span>
                        <span
                          className="order-detail-value"
                          style={{ color: "#f59e0b", fontWeight: "600" }}
                        >
                          {formatCurrency(
                            parseInt(
                              String(localOrder.amount || 0).replace(/\./g, "")
                            ) - (localOrder.depositAmount || 0)
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="order-actions-column">
              {/* Contract Section - Show for all statuses */}
              <div className="order-action-card">
                <div className="order-action-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <h4>Hợp đồng</h4>
                </div>
                <p className="order-action-description">
                  Xem hoặc tạo hợp đồng cho đơn hàng này
                </p>
                <button
                  className="order-action-btn primary"
                  onClick={() => setShowContract(true)}
                  disabled={orderIsCanceled}
                >
                  Xem hợp đồng
                </button>
              </div>

              {/* Quick Actions Card - Only show for Draft status and when contract is not signed */}
              {(localOrder.statusType === "draft" || localOrder.status === "Draft") && 
               !(hasContract && localOrder.contractData?.isSigned) && (
                <div className="order-quick-actions-card">
                  <div className="order-quick-actions-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" />
                    </svg>
                    <h4>Thao Tác Nhanh</h4>
                  </div>
                  <div className="order-quick-actions-body">
                    <button
                      type="button"
                      className={`order-quick-action-btn cancel-btn ${isCancellingOrder ? "loading" : ""}`}
                      onClick={handleCancelOrder}
                      disabled={isCancellingOrder || confirmingOrder || orderIsCanceled}
                    >
                      {isCancellingOrder ? (
                        <div className="order-quote-spinner"></div>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      )}
                      <div className="action-content">
                        <div className="action-title">
                          {isCancellingOrder ? "Đang hủy..." : "Hủy đơn hàng"}
                        </div>
                        <div className="action-subtitle">
                          {isCancellingOrder
                            ? "Đang xử lý hủy đơn hàng"
                            : "Hủy đơn hàng nháp này"}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Section - Show when contract is signed */}
              {hasContract &&
                localOrder.contractData?.isSigned && (
                  <div className="order-action-card">
                    <div className="order-action-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <h4>Thanh toán cọc</h4>
                    </div>

                    {/* Show payment button if deposit is insufficient */}
                    {localOrder.statusType === "draft" &&
                      (localOrder.depositAmount < depositAmount) && (
                        <>
                          <div className="order-payment-details">
                            <div className="order-payment-item">
                              <span>Tổng giá trị:</span>
                              <span className="order-payment-value">
                                {formatCurrency(
                                  parseInt(String(localOrder.amount || 0).replace(/\./g, ""))
                                )}
                              </span>
                            </div>
                            <div className="order-payment-item">
                              <span>Số tiền cọc yêu cầu:</span>
                              <span className="order-payment-value highlight">
                                {formatCurrency(depositAmount)}
                              </span>
                            </div>
                            {localOrder.depositAmount > 0 && (
                              <>
                                <div className="order-payment-item">
                                  <span>Đã đặt cọc:</span>
                                  <span className="order-payment-value">
                                    {formatCurrency(localOrder.depositAmount)}
                                  </span>
                                </div>
                                <div className="order-payment-item">
                                  <span>Còn thiếu:</span>
                                  <span className="order-payment-value highlight">
                                    {formatCurrency(depositAmount - localOrder.depositAmount)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {!showPaymentForm ? (
                            <button
                              className="order-action-btn success"
                              onClick={handlePayment}
                              disabled={orderIsCanceled}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                              </svg>
                              {localOrder.depositAmount > 0 ? "Thanh toán thêm" : "Thanh toán cọc"}
                            </button>
                          ) : (
                            <div className="order-payment-processing">
                              <div className="order-loading-spinner"></div>
                              <p>Đang xử lý thanh toán...</p>
                            </div>
                          )}
                        </>
                      )}

                    {/* Show payment success if deposit is sufficient */}
                    {(localOrder.depositAmount >= depositAmount ||
                      localOrder.statusType === "confirmed") && (
                      <div className="order-payment-success">
                        <div className="order-success-icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                          </svg>
                        </div>
                        <h5>Đã đặt cọc đủ!</h5>
                        <p>
                          Đã đặt cọc: {formatCurrency(localOrder.depositAmount || depositAmount)}
                        </p>

                        {/* Confirm Order Button - Only show for Draft orders with sufficient deposit */}
                        {localOrder.statusType === "draft" && localOrder.depositAmount >= depositAmount && (
                          <button
                            className="order-action-btn success"
                            onClick={handleConfirmOrder}
                            disabled={confirmingOrder || orderIsCanceled}
                            style={{
                              marginTop: "16px",
                              opacity: confirmingOrder || orderIsCanceled ? 0.6 : 1,
                            }}
                          >
                            {confirmingOrder ? (
                              <>
                                <div className="order-loading-spinner small"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Xác nhận đơn hàng
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Delivery Schedule - For Ready orders only (not delivered) */}
              {localOrder.statusType === "ready" && (
                <div className="order-action-card">
                  <div className="order-action-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <h4>Lịch Giao Xe</h4>
                  </div>
                  <p className="order-action-description">
                    Đơn hàng đã sẵn sàng. Xem và quản lý lịch giao xe.
                  </p>
                  <button
                    className="order-action-btn primary"
                    onClick={() => {
                      if (onNavigateToDelivery) {
                        onClose();
                        onNavigateToDelivery(localOrder);
                      }
                    }}
                    disabled={orderIsCanceled}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                    </svg>
                    Xem lịch giao xe
                  </button>
                </div>
              )}

              {/* Delivery Completed - For Delivered orders */}
              {localOrder.statusType === "delivered" && (
                <div className="order-action-card">
                  <div className="order-action-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22,4 12,14.01 9,11.01" />
                    </svg>
                    <h4>Giao Hàng Hoàn Thành</h4>
                  </div>
                  <p className="order-action-description">
                    Đơn hàng đã được giao thành công cho khách hàng.
                  </p>
                  <div className="order-delivery-completed">
                    <div className="order-success-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                    </div>
                    <h5>Đã giao xe thành công!</h5>
                    <p>Xe đã được bàn giao cho khách hàng</p>
                    <p>vào ngày {formatDate(localOrder.deliveredAt)}</p>
                  </div>
                </div>
              )}

              {/* VIN Allocation - For Pending, Confirmed, Backordered and Allocated orders */}
              {(localOrder.statusType === "pending" ||
                localOrder.statusType === "confirmed" ||
                localOrder.statusType === "backordered" ||
                localOrder.statusType === "allocated") && (
                <div className="order-action-card">
                  <div className="order-action-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                    <h4>Phân bổ VIN</h4>
                  </div>
                  <p className="order-action-description">
                    {localOrder.statusType === "allocated"
                      ? `VIN đã phân bổ: ${localOrder.vin || "N/A"}`
                      : "Đơn hàng đã được xác nhận và sẵn sàng để phân bổ VIN"}
                  </p>
                  <button
                    className="order-action-btn primary"
                    onClick={() => {
                      console.log("Navigate to VIN Allocation page for order:", localOrder.id);
                      onClose(); // Close OrderDetailView
                      if (onNavigateToVinAllocation) {
                        onNavigateToVinAllocation(localOrder);
                      }
                    }}
                    disabled={orderIsCanceled}
                  >
                    {localOrder.statusType === "allocated" ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        Xem VIN
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        Phân bổ VIN
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        order={localOrder}
        onPaymentSuccess={handlePaymentSuccess}
        onError={(errorMessage) => {
          showToast("error", errorMessage || "Có lỗi xảy ra khi thanh toán cọc");
        }}
      />

      {/* Contract View Modal */}
      {showContract && (
        <div className="contract-modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="contract-modal-wrapper">
            <ContractView
              key={`contract-${localOrder.backendId}-${contractViewKey}`}
              order={localOrder}
              onBack={() => setShowContract(false)}
              onContractCreated={handleContractCreated}
              onReloadOrder={reloadOrderDetail}
              initialToastMessage={contractToastMessage}
              onToastShown={() => setContractToastMessage(null)}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancel Order */}
      {showConfirmCancel && ReactDOM.createPortal(
        <div
          className="order-confirm-overlay"
          onClick={() => setShowConfirmCancel(false)}
        >
          <div
            className="order-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-confirm-header">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: "#f59e0b" }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <h3>Xác nhận hủy đơn hàng</h3>
            </div>
            <div className="order-confirm-body">
              <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
            </div>
            <div className="order-confirm-footer">
              <button
                className="order-confirm-cancel-btn"
                onClick={() => setShowConfirmCancel(false)}
              >
                Hủy
              </button>
              <button
                className="order-confirm-ok-btn order-confirm-cancel-order-btn"
                onClick={confirmCancelOrder}
                disabled={isCancellingOrder || orderIsCanceled}
              >
                {isCancellingOrder ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    </div>
  );
};

export default OrderDetailView;
