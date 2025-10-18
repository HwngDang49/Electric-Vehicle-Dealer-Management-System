import React, { useState } from "react";
import "./VinAllocationDetail.css";

const VinAllocationDetail = ({
  order,
  onBack,
  onAllocateSuccess,
  onNavigateToDelivery,
}) => {
  const [selectedVin, setSelectedVin] = useState(null);
  const [allocationStatus, setAllocationStatus] = useState("pending"); // pending, success

  // Check if order is already allocated (readonly mode)
  const isReadonly =
    order.statusType === "allocated" ||
    order.status === "Allocated" ||
    order.status === "ALLOCATED";

  // Debug: Check if order exists
  if (!order) {
    return (
      <div className="vin-allocation-detail">
        <div className="error-message">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          <button className="back-btn" onClick={onBack}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Sample available VINs data
  const availableVins = [
    {
      id: "VFX-001",
      vin: "VFX-001",
      vehicle: "VinFast VF8 Plus",
      color: "Đỏ Ruby",
      arrivalDate: "2025-01-05",
      status: "available",
    },
    {
      id: "VFX-002",
      vin: "VFX-002",
      vehicle: "VinFast VF8 Plus",
      color: "Đỏ Ruby",
      arrivalDate: "2025-01-08",
      status: "available",
    },
    {
      id: "VFX-005",
      vin: "VFX-005",
      vehicle: "VinFast VF8 Plus",
      color: "Đỏ Ruby",
      arrivalDate: "2025-01-12",
      status: "available",
    },
  ];

  const handleVinSelect = (vin) => {
    setSelectedVin(vin);
  };

  const handleAllocateVin = () => {
    if (!selectedVin) {
      alert("Vui lòng chọn VIN để phân bổ");
      return;
    }

    // Simulate allocation process
    setAllocationStatus("success");

    // Call success callback after 2 seconds
    setTimeout(() => {
      if (onAllocateSuccess) {
        onAllocateSuccess(order.id, selectedVin.vin);
      }
    }, 2000);
  };

  return (
    <div className="vin-allocation-detail">
      <div className="vin-allocation-detail-content">
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
            <h1>Phân bổ VIN - Đơn hàng {order.id}</h1>
          </div>
        </div>

        <div className="detail-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Order Information */}
            <div className="info-card">
              <h2>Thông tin đơn hàng</h2>
              <div className="vin-allocation-info-grid">
                <div className="vin-allocation-info-item">
                  <label>Mã đơn hàng:</label>
                  <span>{order.id}</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Trạng thái:</label>
                  <span className={`status-badge ${order.statusType}`}>
                    {order.status}
                  </span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Khách hàng:</label>
                  <span>{order.customer?.name || "N/A"}</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Email:</label>
                  <span>nguyenvanan@email.com</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Số điện thoại:</label>
                  <span>{order.customer?.phone || "N/A"}</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Ngày đặt hàng:</label>
                  <span>{order.date}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="info-card">
              <h2>Thông tin xe</h2>
              <div className="vin-allocation-info-grid">
                <div className="vin-allocation-info-item">
                  <label>Dòng xe:</label>
                  <span>
                    {order.vehicle?.name || order.item?.name || "N/A"}
                  </span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Màu sắc:</label>
                  <span>
                    {order.vehicle?.color || order.item?.color || "N/A"}
                  </span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Giá trị đơn hàng:</label>
                  <span>{order.amount} ₫</span>
                </div>
              </div>
            </div>

            {/* Available VINs or Allocated VIN */}
            <div className="info-card">
              <h2>{isReadonly ? "VIN đã phân bổ" : "Kho VIN khả dụng"}</h2>
              {isReadonly ? (
                <div className="allocated-vin-display">
                  <div className="allocated-vin-item">
                    <div className="vin-header">
                      <span className="vin-code">{order.vin}</span>
                      <div className="vin-status allocated">Đã phân bổ</div>
                    </div>
                    <div className="vin-details">
                      <div className="vin-vehicle">
                        {order.vehicle?.name || order.item?.name || "N/A"} -{" "}
                        {order.vehicle?.color || order.item?.color || "N/A"}
                      </div>
                      <div className="vin-arrival">
                        Ngày phân bổ: {new Date().toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vin-list">
                  {availableVins.map((vin) => (
                    <div
                      key={vin.id}
                      className={`vin-item ${
                        selectedVin?.id === vin.id ? "selected" : ""
                      }`}
                      onClick={() => handleVinSelect(vin)}
                    >
                      <div className="vin-header">
                        <span className="vin-code">{vin.vin}</span>
                        <div className="vin-status available">Khả dụng</div>
                      </div>
                      <div className="vin-details">
                        <div className="vin-vehicle">
                          {vin.vehicle?.name || vin.vehicle || "N/A"} -{" "}
                          {vin.color || "N/A"}
                        </div>
                        <div className="vin-arrival">
                          Ngày đến kho: {vin.arrivalDate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Allocation Actions - Only show for non-allocated orders */}
            {!isReadonly && (
              <div className="info-card">
                <h2>Hành động phân bổ</h2>
                <div className="allocation-section">
                  <div className="selected-vin">
                    <label>VIN đã chọn:</label>
                    <span className="selected-vin-value">
                      {selectedVin ? selectedVin.vin : "Chưa chọn"}
                    </span>
                  </div>

                  <div className="allocation-options">
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="allocation"
                          value="allocate"
                          defaultChecked
                        />
                        <span>Phân bổ VIN</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="allocation"
                          value="preorder"
                        />
                        <span>Đặt hàng trước + ETA</span>
                      </label>
                      <label className="radio-option">
                        <input type="radio" name="allocation" value="suggest" />
                        <span>Đề xuất tạo PO (Quản lý)</span>
                      </label>
                    </div>
                  </div>

                  {allocationStatus === "pending" && (
                    <button
                      className="allocate-btn"
                      onClick={handleAllocateVin}
                      disabled={!selectedVin}
                    >
                      Phân bổ VIN
                    </button>
                  )}

                  {allocationStatus === "success" && (
                    <div className="allocation-success">
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
                      <h3>Phân bổ VIN thành công!</h3>
                      <p>
                        VIN {selectedVin?.vin} đã được phân bổ cho đơn hàng{" "}
                        {order.id}
                      </p>
                      <div className="success-status">
                        <span className="status-badge allocated">
                          Allocated
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Allocation Status - Only show for allocated orders */}
            {isReadonly && (
              <div className="info-card">
                <h2>Trạng thái phân bổ</h2>
                <div className="allocation-status-section">
                  <div className="status-info">
                    <div className="status-item">
                      <label>Trạng thái:</label>
                      <span className="status-badge allocated">Đã phân bổ</span>
                    </div>
                    <div className="status-item">
                      <label>VIN được phân bổ:</label>
                      <span className="allocated-vin-code">{order.vin}</span>
                    </div>
                    <div className="status-item">
                      <label>Ngày phân bổ:</label>
                      <span>{new Date().toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  {/* Delivery Schedule Button */}
                  <div className="delivery-schedule-section">
                    <button
                      className="delivery-schedule-btn"
                      onClick={() => {
                        // Navigate to Delivery Schedule page with order data
                        if (onNavigateToDelivery) {
                          onNavigateToDelivery(order);
                        }
                      }}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        padding: "12px 16px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        width: "100%",
                        fontSize: "14px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
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
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Lên lịch giao xe cho khách
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="info-card">
              <h2>Tóm tắt đơn hàng</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Khách hàng:</label>
                  <span>{order.customer?.name || "N/A"}</span>
                </div>
                <div className="summary-item">
                  <label>Trạng thái:</label>
                  <span
                    className={`status-badge ${
                      allocationStatus === "success"
                        ? "allocated"
                        : order.statusType
                    }`}
                  >
                    {allocationStatus === "success"
                      ? "Allocated"
                      : order.status}
                  </span>
                </div>
                <div className="summary-item">
                  <label>VIN được phân bổ:</label>
                  <span className="allocated-vin">
                    {allocationStatus === "success"
                      ? selectedVin?.vin
                      : order.vin || "Chưa có"}
                  </span>
                </div>
                <div className="summary-item">
                  <label>Đặt cọc:</label>
                  <span className="amount">{order.amount} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinAllocationDetail;
