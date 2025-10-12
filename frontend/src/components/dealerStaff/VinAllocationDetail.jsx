import React, { useState } from "react";
import "./VinAllocationDetail.css";

const VinAllocationDetail = ({ order, onBack, onAllocateSuccess }) => {
  const [selectedVin, setSelectedVin] = useState(null);
  const [allocationStatus, setAllocationStatus] = useState("pending"); // pending, success

  // Check if order is already allocated
  const isAllocated = order.statusType === "allocated";

  // If allocated, set the allocated VIN and status
  const allocatedVin = isAllocated ? "VFX-001" : null; // Sample allocated VIN

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
        onAllocateSuccess(order, selectedVin);
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
                  <span>{order.customer.name}</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Email:</label>
                  <span>nguyenvanan@email.com</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Số điện thoại:</label>
                  <span>0912345678</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Ngày đặt hàng:</label>
                  <span>2025-01-15</span>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="info-card">
              <h2>Thông tin xe</h2>
              <div className="vin-allocation-info-grid">
                <div className="vin-allocation-info-item">
                  <label>Dòng xe:</label>
                  <span>{order.item.name}</span>
                </div>
                <div className="vin-allocation-info-item">
                  <label>Màu sắc:</label>
                  <span>{order.item.color}</span>
                </div>
              </div>
            </div>

            {/* Available VINs - Only show for non-allocated orders */}
            {!isAllocated && (
              <div className="info-card">
                <h2>Kho VIN khả dụng</h2>
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
                          {vin.vehicle} - {vin.color}
                        </div>
                        <div className="vin-arrival">
                          Ngày đến kho: {vin.arrivalDate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allocated VIN Info - Only show for allocated orders */}
            {isAllocated && (
              <div className="info-card">
                <h2>VIN đã phân bổ</h2>
                <div className="allocated-vin-info">
                  <div className="vin-item allocated">
                    <div className="vin-header">
                      <span className="vin-code">{allocatedVin}</span>
                      <div className="vin-status allocated">Đã phân bổ</div>
                    </div>
                    <div className="vin-details">
                      <div className="vin-vehicle">
                        {order.item.name} - {order.item.color}
                      </div>
                      <div className="vin-arrival">
                        Ngày phân bổ: 2025-01-15
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Allocation Actions */}
            <div className="info-card">
              <h2>Hành động phân bổ</h2>
              <div className="allocation-section">
                {!isAllocated ? (
                  <>
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
                          <input
                            type="radio"
                            name="allocation"
                            value="suggest"
                          />
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
                  </>
                ) : (
                  <div className="allocated-status">
                    <div className="allocated-vin-display">
                      <label>VIN đã phân bổ:</label>
                      <span className="allocated-vin-value">
                        {allocatedVin}
                      </span>
                    </div>
                    <button className="allocated-btn" disabled>
                      Đã phân bổ VIN
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="info-card">
              <h2>Tóm tắt đơn hàng</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Khách hàng:</label>
                  <span>{order.customer.name}</span>
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
                    {isAllocated
                      ? allocatedVin
                      : allocationStatus === "success"
                      ? selectedVin?.vin
                      : "Chưa có"}
                  </span>
                </div>
                <div className="summary-item">
                  <label>Đặt cọc:</label>
                  <span className="amount">120.000.000 ₫</span>
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
