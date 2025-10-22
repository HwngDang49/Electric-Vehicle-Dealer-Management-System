import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { API_ENDPOINTS } from "../../services/constants";
import "./VinAllocationDetail.css";

const VinAllocationDetail = ({
  order,
  onBack,
  onAllocateSuccess,
  onNavigateToDelivery,
}) => {
  const [selectedVin, setSelectedVin] = useState(null);
  const [allocationStatus, setAllocationStatus] = useState("pending"); // pending, success, error
  const [availableVins, setAvailableVins] = useState([]);
  const [loadingVins, setLoadingVins] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [note, setNote] = useState("");

  // Check if order is already allocated (readonly mode)
  const isReadonly =
    order.statusType === "allocated" ||
    order.status === "Allocated" ||
    order.status === "ALLOCATED";

  // Fetch available VINs from backend when component mounts
  useEffect(() => {
    const fetchAvailableVins = async () => {
      if (!order || !order.backendId) {
        console.error("❌ No order or backendId found");
        return;
      }

      try {
        setLoadingVins(true);
        console.log("📤 Fetching available VINs for order:", order.backendId);

        // Get order details to extract ProductId
        const orderResponse = await apiClient.get(
          API_ENDPOINTS.ORDERS.GET_BY_ID(order.backendId)
        );
        const orderData =
          orderResponse.data?.value ||
          orderResponse.data?.data ||
          orderResponse.data;
        const productId = orderData?.item?.productId || orderData?.productId;

        console.log("🔍 Order product ID:", productId);

        if (!productId) {
          console.error("❌ No product ID found in order");
          setAvailableVins([]);
          return;
        }

        // Fetch available VINs for this product
        const vinsResponse = await apiClient.get(
          API_ENDPOINTS.ORDERS.AVAILABLE_VINS,
          {
            params: {
              ProductId: productId,
              Status: "InStock",
              Page: 1,
              PageSize: 50,
            },
          }
        );

        const vinsData =
          vinsResponse.data?.items || vinsResponse.data?.value?.items || [];
        console.log("✅ Available VINs:", vinsData);

        // Transform backend VIN data to frontend format
        const transformedVins = vinsData.map((vin) => ({
          id: vin.vin,
          vin: vin.vin,
          vehicle: vin.productName || "N/A",
          color: vin.colorName || "N/A",
          arrivalDate: vin.receivedAt
            ? new Date(vin.receivedAt).toLocaleDateString("vi-VN")
            : "N/A",
          status: vin.status || "InStock",
          branchName: vin.branchName || "N/A",
        }));

        setAvailableVins(transformedVins);
      } catch (error) {
        console.error("❌ Error fetching available VINs:", error);
        setAvailableVins([]);
      } finally {
        setLoadingVins(false);
      }
    };

    fetchAvailableVins();
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleVinSelect = (vin) => {
    if (!isReadonly) {
      setSelectedVin(vin);
    }
  };

  const handleAllocateVin = async () => {
    if (!selectedVin) {
      alert("Vui lòng chọn VIN để phân bổ");
      return;
    }

    if (!order.backendId) {
      alert("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      setAllocating(true);
      setAllocationStatus("pending");
      console.log(
        "📤 Allocating VIN:",
        selectedVin.vin,
        "to order:",
        order.backendId
      );

      // Call backend API to allocate VIN
      const response = await apiClient.post("/orders/allocate-vin", {
        OrderId: parseInt(order.backendId),
        Note: note || `Phân bổ VIN ${selectedVin.vin} cho đơn hàng ${order.id}`,
      });

      console.log("✅ VIN allocation response:", response.data);

      setAllocationStatus("success");
      alert(
        `✅ Phân bổ VIN thành công!\nVIN: ${selectedVin.vin}\nĐơn hàng: ${order.id}`
      );

      // Call success callback
      setTimeout(() => {
        if (onAllocateSuccess) {
          onAllocateSuccess(order.id, selectedVin.vin);
        }
        onBack(); // Return to list after successful allocation
      }, 1500);
    } catch (error) {
      console.error("❌ Error allocating VIN:", error);
      setAllocationStatus("error");

      const errorMessage =
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        "Không thể phân bổ VIN. Vui lòng thử lại.";

      alert(`❌ Lỗi phân bổ VIN:\n${errorMessage}`);
    } finally {
      setAllocating(false);
    }
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
                  <span>{order.customer?.email || "N/A"}</span>
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
              ) : loadingVins ? (
                <div
                  className="loading-vins"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  <p>⏳ Đang tải danh sách VIN khả dụng...</p>
                </div>
              ) : availableVins.length === 0 ? (
                <div
                  className="no-vins"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  <p>❌ Không có VIN khả dụng cho sản phẩm này.</p>
                  <p style={{ fontSize: "14px", marginTop: "8px" }}>
                    Vui lòng kiểm tra kho hoặc tạo Purchase Order mới.
                  </p>
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
                          {vin.vehicle || "N/A"} - {vin.color || "N/A"}
                        </div>
                        <div className="vin-arrival">
                          Ngày đến kho: {vin.arrivalDate}
                        </div>
                        {vin.branchName && (
                          <div
                            className="vin-branch"
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            Chi nhánh: {vin.branchName}
                          </div>
                        )}
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

                  <div
                    className="allocation-note"
                    style={{ marginTop: "16px" }}
                  >
                    <label
                      htmlFor="note"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Ghi chú (tùy chọn):
                    </label>
                    <textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Nhập ghi chú cho việc phân bổ VIN (nếu có)..."
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {allocationStatus !== "success" && (
                    <button
                      className="allocate-btn"
                      onClick={handleAllocateVin}
                      disabled={!selectedVin || allocating}
                      style={{
                        marginTop: "16px",
                        opacity: !selectedVin || allocating ? 0.6 : 1,
                        cursor:
                          !selectedVin || allocating
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {allocating ? (
                        <>
                          <span style={{ marginRight: "8px" }}>⏳</span>
                          Đang phân bổ...
                        </>
                      ) : (
                        "Phân bổ VIN"
                      )}
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
