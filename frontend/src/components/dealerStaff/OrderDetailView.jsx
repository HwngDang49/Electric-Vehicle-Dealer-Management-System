import React, { useState, useEffect } from "react";
import "./OrderDetailView.css";
import ContractView from "./ContractView";
import PaymentPopup from "./PaymentPopup";

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

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    setShowPaymentPopup(false);
    // Update order status to Confirmed after successful payment
    if (order.statusType === "draft") {
      // Update local order state immediately for real-time UI update
      const updatedOrder = {
        ...order,
        status: "Confirmed",
        statusType: "confirmed",
      };
      setLocalOrder(updatedOrder);

      console.log("Order status updated to Confirmed after payment");

      // Call parent handler to update orders state
      if (onPaymentSuccess) {
        onPaymentSuccess(order.id);
      }
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

              {localOrder.statusType === "draft" &&
                paymentStatus === "pending" && (
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

              {(paymentStatus === "success" ||
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
                  <h3>Thanh toán thành công!</h3>
                  <p>
                    Số tiền cọc {depositAmount.toLocaleString()} ₫ đã được thanh
                    toán thành công.
                  </p>
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
