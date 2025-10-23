import React, { useState, useEffect } from "react";
import "./OrderDetailView.css";
import ContractView from "./ContractView";
import PaymentPopup from "./PaymentPopup";
import apiClient from "../../services/api";

const OrderDetailView = ({
  order,
  onBack,
  onNavigateToVinAllocation,
  onContractCreated,
  onPaymentSuccess,
}) => {
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [hasContract, setHasContract] = useState(order.hasContract || false);
  const [localOrder, setLocalOrder] = useState(order);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  // Update hasContract when order data changes
  useEffect(() => {
    setHasContract(order.hasContract || false);
    setLocalOrder(order);
  }, [order.hasContract, order]);

  // Debug: Check if order exists
  if (!order) {
    return (
      <div className="order-detail-view">
        <div className="order-detail-content">
          <div className="error-message">
            <h2>Không tìm thấy đơn hàng</h2>
            <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
            <button className="back-btn" onClick={onBack}>
              Quay lại
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

  // Simple fallback for testing
  if (!order || !order.id) {
    return (
      <div style={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
        <h2>Error: Order data is missing</h2>
        <p>Order: {JSON.stringify(order)}</p>
        <button onClick={onBack}>Quay lại</button>
      </div>
    );
  }

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

  // Show contract view if requested
  if (showContract) {
    console.log("OrderDetailView - Showing ContractView with order:", order);
    console.log("OrderDetailView - order.contractData:", order.contractData);
    return (
      <ContractView
        order={order}
        onBack={() => setShowContract(false)}
        onContractCreated={handleContractCreated}
      />
    );
  }

  // No readonly mode for Confirmed orders

  return (
    <div className="order-detail-view">
      <div className="order-detail-content">
        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="header-info">
            <h1>Chi tiết đơn hàng {localOrder.id}</h1>
            <div className="header-actions">
              <span className={`status-badge ${localOrder.statusType}`}>
                {localOrder.status}
              </span>
              {(localOrder.statusType === "draft" ||
                localOrder.statusType === "confirmed") && (
                <button
                  className="view-contract-btn"
                  onClick={() => {
                    console.log("Viewing contract for order:", localOrder.id);
                    console.log("OrderDetailView - hasContract:", hasContract);
                    console.log(
                      "OrderDetailView - order.hasContract:",
                      localOrder.hasContract
                    );
                    setShowContract(true);
                  }}
                >
                  {hasContract ? "Xem hợp đồng" : "Tạo hợp đồng mới"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="info-section">
          <h2>Thông tin khách hàng</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Tên khách hàng:</label>
              <span>{localOrder.customer?.name || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Số điện thoại:</label>
              <span>{localOrder.customer?.phone || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Ngày đặt hàng:</label>
              <span>{localOrder.date}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="info-section">
          <h2>Thông tin xe</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Model xe:</label>
              <span>{localOrder.vehicle.name}</span>
            </div>
            <div className="info-item">
              <label>Màu sắc:</label>
              <span>{localOrder.vehicle.color}</span>
            </div>
            <div className="info-item">
              <label>Giá trị đơn hàng:</label>
              <span className="amount">{localOrder.amount} ₫</span>
            </div>
            {localOrder.depositAmount > 0 && (
              <>
                <div className="info-item">
                  <label>Số tiền đã đặt cọc:</label>
                  <span
                    className="amount"
                    style={{ color: "#10b981", fontWeight: "600" }}
                  >
                    {new Intl.NumberFormat("vi-VN").format(
                      localOrder.depositAmount
                    )}{" "}
                    ₫
                  </span>
                </div>
                <div className="info-item">
                  <label>Số tiền còn lại:</label>
                  <span
                    className="amount"
                    style={{ color: "#f59e0b", fontWeight: "600" }}
                  >
                    {new Intl.NumberFormat("vi-VN").format(
                      parseInt(
                        String(localOrder.amount || 0).replace(/\./g, "")
                      ) - (localOrder.depositAmount || 0)
                    )}{" "}
                    ₫
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Section - Show for Draft and Confirmed orders with contract */}
        {(localOrder.statusType === "draft" ||
          localOrder.statusType === "confirmed") &&
          hasContract && (
            <div className="info-section">
              <h2>Thanh toán cọc</h2>

              <div className="payment-policy">
                <div className="policy-header">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <h3>Chính sách thanh toán</h3>
                </div>
                <p className="policy-text">
                  Theo chính sách mua xe tại đại lý, quý khách vui lòng cọc
                  trước 10% trên tổng hóa đơn xe
                </p>
              </div>

              {/* Show payment button only if no deposit has been made */}
              {localOrder.statusType === "draft" &&
                (!localOrder.depositAmount ||
                  localOrder.depositAmount === 0) && (
                  <div className="payment-info">
                    <div className="payment-details">
                      <div className="payment-item">
                        <label>Tổng giá trị đơn hàng:</label>
                        <span className="total-amount">
                          {localOrder.amount} ₫
                        </span>
                      </div>
                      <div className="payment-item">
                        <label>Số tiền cọc (10%):</label>
                        <span className="deposit-amount">
                          {depositAmount.toLocaleString()} ₫
                        </span>
                      </div>
                    </div>

                    {!showPaymentForm ? (
                      <button className="payment-btn" onClick={handlePayment}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Thanh toán cọc
                      </button>
                    ) : (
                      <div className="payment-processing">
                        <div className="loading-spinner"></div>
                        <p>Đang xử lý thanh toán...</p>
                      </div>
                    )}
                  </div>
                )}

              {/* Show payment success if deposit has been made (from DB or just now) */}
              {(localOrder.depositAmount > 0 ||
                localOrder.statusType === "confirmed") && (
                <div className="payment-success">
                  <div className="success-icon">
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
                  <h3>Đã thanh toán cọc!</h3>
                  <p>
                    Số tiền cọc{" "}
                    {new Intl.NumberFormat("vi-VN").format(
                      localOrder.depositAmount || depositAmount
                    )}{" "}
                    ₫ đã được thanh toán thành công.
                  </p>

                  {/* Confirm Order Button - Only show for Draft orders */}
                  {localOrder.statusType === "draft" && (
                    <div style={{ marginTop: "24px" }}>
                      <button
                        className="confirm-order-btn"
                        onClick={handleConfirmOrder}
                        disabled={confirmingOrder}
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          padding: "12px 24px",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "16px",
                          fontWeight: "600",
                          cursor: confirmingOrder ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: "0 auto",
                          opacity: confirmingOrder ? 0.6 : 1,
                        }}
                      >
                        {confirmingOrder ? (
                          <>
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                border: "2px solid white",
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                              }}
                            ></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <svg
                              width="20"
                              height="20"
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
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Action Section - For Pending orders and Confirmed orders */}
        {(localOrder.statusType === "pending" ||
          localOrder.statusType === "confirmed") && (
          <div className="info-section">
            <h2>Thao tác đơn hàng</h2>
            <div className="action-section">
              <div className="action-info">
                <p>Đơn hàng đã được xác nhận và sẵn sàng để phân bổ VIN.</p>
              </div>
              <button
                className="allocate-btn"
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
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                </svg>
                Allocate VIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        order={localOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default OrderDetailView;
