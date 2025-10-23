import React, { useState, useEffect } from "react";
import "./OrderDetailView.css";
import ContractView from "./ContractView";
import PaymentPopup from "./PaymentPopup";
import apiClient from "../../services/api";

const OrderDetailView = ({
  order,
  onClose,
  onNavigateToVinAllocation,
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

  // Load full order details from API
  useEffect(() => {
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
          amount: order.amount, // Keep from list
          backendId: order.backendId,
        };

        setLocalOrder(transformedOrder);
        setHasContract(order.hasContract || false);
      } catch (error) {
        console.error("❌ Error loading order detail:", error);
        // Keep using order from list if API fails
        setLocalOrder(order);
      } finally {
        setLoadingDetail(false);
      }
    };

    loadOrderDetail();
  }, [order.backendId]);

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

  const handlePaymentSuccess = async () => {
    setPaymentStatus("success");
    setShowPaymentPopup(false);

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

  const depositAmount = Math.round(
    parseInt(String(localOrder.amount || 0).replace(/\./g, "")) * 0.1
  );

  console.log("Rendering OrderDetailView with order:", order);

  // Handle contract creation
  const handleContractCreated = (orderId, contractInfo) => {
    console.log("Contract created for order:", orderId, contractInfo);
    console.log("OrderDetailView - Setting hasContract to true");
    setHasContract(true);
    if (onContractCreated) {
      console.log("OrderDetailView - Calling parent onContractCreated");
      onContractCreated(orderId, contractInfo);
    }
  };

  // Handle confirm order
  const handleConfirmOrder = async () => {
    if (!order.backendId) {
      alert("Không tìm thấy thông tin đơn hàng!");
      return;
    }

    // Confirm with user
    const confirmed = window.confirm(
      "Xác nhận đơn hàng này?\n\n" +
        "Điều kiện để xác nhận:\n" +
        "✓ Đã có hợp đồng\n" +
        "✓ Hợp đồng đã được ký\n" +
        "✓ Đã đặt cọc đủ số tiền yêu cầu\n\n" +
        "Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái 'Confirmed'."
    );

    if (!confirmed) return;

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

      // Show success message
      alert(
        "✅ Đơn hàng đã được xác nhận thành công!\n\nBạn có thể tiếp tục phân bổ VIN."
      );

      // Call parent handler to update orders state
      if (onPaymentSuccess) {
        onPaymentSuccess(order.id);
      }
    } catch (error) {
      console.error("❌ Error confirming order:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể xác nhận đơn hàng";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setConfirmingOrder(false);
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    const statusMap = {
      draft: { text: "Nháp", class: "draft" },
      pending: { text: "Chờ xử lý", class: "pending" },
      confirmed: { text: "Đã xác nhận", class: "confirmed" },
    };

    const status = statusMap[localOrder.statusType] || {
      text: localOrder.status,
      class: "draft",
    };

    return (
      <span className={`order-status-badge ${status.class}`}>
        {status.text}
      </span>
    );
  };

  return (
    <div className="order-detail-modal-overlay" onClick={onClose}>
      <div
        className="order-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="order-detail-modal-header">
          <h2>Chi tiết đơn hàng</h2>
          <button className="order-detail-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
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
          {/* Header Card */}
          <div className="order-header-card">
            <div className="order-header-info">
              <h3>Đơn hàng #{localOrder.id}</h3>
              <div className="order-header-meta">
                <span>Ngày tạo: {localOrder.date || "N/A"}</span>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Details */}
          <div className="order-details">
            {/* Left Column - Customer & Vehicle Info */}
            <div className="order-info-column">
              {/* Customer Information */}
              <div className="order-detail-section">
                <h4>Thông tin khách hàng</h4>
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
                    <span className="order-detail-label">Địa chỉ</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.address || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item full-width">
                    <span className="order-detail-label">CCCD/CMND</span>
                    <span className="order-detail-value">
                      {localOrder.customer?.idNumber || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="order-detail-section">
                <h4>Thông tin xe</h4>
                <div className="order-detail-grid">
                  <div className="order-detail-item">
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
                  <div className="order-detail-item">
                    <span className="order-detail-label">Giá trị đơn hàng</span>
                    <span className="order-detail-value order-amount">
                      {formatCurrency(
                        parseInt(String(localOrder.amount || 0).replace(/\./g, ""))
                      )}
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
              {/* Contract Section */}
              {(localOrder.statusType === "draft" ||
                localOrder.statusType === "confirmed") && (
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
                  >
                    Xem hợp đồng
                  </button>
                </div>
              )}

              {/* Payment Section - Show for Draft and Confirmed orders with contract */}
              {(localOrder.statusType === "draft" ||
                localOrder.statusType === "confirmed") &&
                hasContract && (
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

                    <div className="order-payment-policy">
                      <p>
                        Theo chính sách mua xe tại đại lý, quý khách vui lòng
                        cọc trước <strong>10%</strong> trên tổng hóa đơn xe
                      </p>
                    </div>

                    {/* Show payment button only if no deposit has been made */}
                    {localOrder.statusType === "draft" &&
                      (!localOrder.depositAmount ||
                        localOrder.depositAmount === 0) && (
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
                              <span>Số tiền cọc (10%):</span>
                              <span className="order-payment-value highlight">
                                {formatCurrency(depositAmount)}
                              </span>
                            </div>
                          </div>

                          {!showPaymentForm ? (
                            <button
                              className="order-action-btn success"
                              onClick={handlePayment}
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
                              Thanh toán cọc
                            </button>
                          ) : (
                            <div className="order-payment-processing">
                              <div className="order-loading-spinner"></div>
                              <p>Đang xử lý thanh toán...</p>
                            </div>
                          )}
                        </>
                      )}

                    {/* Show payment success if deposit has been made */}
                    {(localOrder.depositAmount > 0 ||
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
                        <h5>Đã thanh toán cọc!</h5>
                        <p>
                          Số tiền{" "}
                          {formatCurrency(localOrder.depositAmount || depositAmount)}{" "}
                          đã được thanh toán thành công.
                        </p>

                        {/* Confirm Order Button - Only show for Draft orders */}
                        {localOrder.statusType === "draft" && (
                          <button
                            className="order-action-btn success"
                            onClick={handleConfirmOrder}
                            disabled={confirmingOrder}
                            style={{
                              marginTop: "16px",
                              opacity: confirmingOrder ? 0.6 : 1,
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

              {/* VIN Allocation - For Confirmed orders */}
              {(localOrder.statusType === "pending" ||
                localOrder.statusType === "confirmed") && (
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
                    Đơn hàng đã được xác nhận và sẵn sàng để phân bổ VIN
                  </p>
                  <button
                    className="order-action-btn primary"
                    onClick={() => {
                      console.log("Allocate VIN clicked for order:", localOrder.id);
                      if (onNavigateToVinAllocation) {
                        onNavigateToVinAllocation(localOrder);
                      } else {
                        console.log(
                          "onNavigateToVinAllocation prop is not available"
                        );
                      }
                    }}
                  >
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
      />

      {/* Contract View Modal */}
      {showContract && (
        <div className="contract-modal-overlay" onClick={() => setShowContract(false)}>
          <div className="contract-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <ContractView
              order={localOrder}
              onBack={() => setShowContract(false)}
              onContractCreated={handleContractCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailView;
