import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { API_ENDPOINTS } from "../../services/constants";
import "./OrderDetailView.css";
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
  const [localOrder, setLocalOrder] = useState(order);
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

  // Check if order is already allocated (readonly mode)
  const isReadonly =
    order.statusType === "allocated" ||
    order.status === "Allocated" ||
    order.status === "ALLOCATED";

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

  // Load full order details from API
  useEffect(() => {
    const loadOrderDetail = async () => {
      if (!order.backendId) {
        setLoadingDetail(false);
        setLocalOrder(order);
        return;
      }

      try {
        setLoadingDetail(true);
        console.log("📥 Loading order detail for VIN allocation:", order.backendId);
        
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
          },
          vehicle: {
            name: detailData.item?.productName || order.vehicle?.name,
            color: detailData.item?.productColor || order.vehicle?.color,
            batteryKwh: detailData.item?.batteryKwh,
            motorKw: detailData.item?.motorKw,
            rangeKm: detailData.item?.rangeKm,
          },
          item: {
            name: detailData.item?.productName || order.item?.name,
            color: detailData.item?.productColor || order.item?.color,
            batteryKwh: detailData.item?.batteryKwh,
            motorKw: detailData.item?.motorKw,
            rangeKm: detailData.item?.rangeKm,
          },
          amount: order.amount,
          backendId: order.backendId,
        };

        setLocalOrder(transformedOrder);
      } catch (error) {
        console.error("❌ Error loading order detail:", error);
        setLocalOrder(order);
      } finally {
        setLoadingDetail(false);
      }
    };

    loadOrderDetail();
  }, [order.backendId]);

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
      <div className="order-detail-modal-overlay">
        <div className="order-detail-modal-content">
          <div className="order-error-message">
            <h2>Không tìm thấy đơn hàng</h2>
            <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
            <button className="order-back-btn" onClick={onBack}>
              Quay lại
            </button>
          </div>
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
    <div className="order-detail-modal-overlay">
      <div className="order-detail-modal-content">
        {/* Header */}
        <div className="order-detail-modal-header">
          <h2>Phân bổ VIN</h2>
          <button className="order-detail-close-btn" onClick={onBack}>
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
                <span>Ngày đặt: {localOrder.date || "N/A"}</span>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Details */}
          <div className="order-details">
            {/* Left Column - Vehicle Info */}
            <div className="order-info-column">
              {/* Vehicle Information */}
              <div className="order-detail-section">
                <h4>Thông tin xe</h4>
                <div className="order-detail-grid">
                  <div className="order-detail-item">
                    <span className="order-detail-label">Model xe</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.name || localOrder.item?.name || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Màu sắc</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.color || localOrder.item?.color || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Dung lượng pin</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.batteryKwh || localOrder.item?.batteryKwh ? `${localOrder.vehicle?.batteryKwh || localOrder.item?.batteryKwh} kWh` : "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Công suất động cơ</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.motorKw || localOrder.item?.motorKw ? `${localOrder.vehicle?.motorKw || localOrder.item?.motorKw} kW` : "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="order-detail-label">Quãng đường</span>
                    <span className="order-detail-value">
                      {localOrder.vehicle?.rangeKm || localOrder.item?.rangeKm ? `${localOrder.vehicle?.rangeKm || localOrder.item?.rangeKm} km` : "N/A"}
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
                </div>
              </div>

              {/* Available VINs or Allocated VIN */}
              <div className="order-detail-section">
                <h4>{isReadonly ? "VIN đã phân bổ" : "Kho VIN khả dụng"}</h4>
              {isReadonly ? (
                <div className="allocated-vin-display">
                  <div className="allocated-vin-item">
                    <div className="vin-header">
                      <span className="vin-code">{localOrder.vin}</span>
                      <div className="vin-status allocated">Đã phân bổ</div>
                    </div>
                    <div className="vin-details">
                      <div className="vin-vehicle">
                        {localOrder.vehicle?.name || localOrder.item?.name || "N/A"} -{" "}
                        {localOrder.vehicle?.color || localOrder.item?.color || "N/A"}
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
                        {vin.branchName && (
                          <div className="vin-branch">
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

            {/* Right Column - Actions */}
            <div className="order-actions-column">
              {/* Allocation Actions - Only show for non-allocated orders */}
              {!isReadonly && (
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
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4>Hành động phân bổ</h4>
                  </div>
                  <p className="order-action-description">
                    Chọn VIN và phân bổ cho đơn hàng này
                  </p>
                <div className="allocation-section">
                  <div className="selected-vin">
                    <label>VIN đã chọn:</label>
                    <span className="selected-vin-value">
                      {selectedVin ? selectedVin.vin : "Chưa chọn"}
                    </span>
                  </div>


                  {allocationStatus !== "success" && (
                    <button
                      className="order-action-btn success"
                      onClick={handleAllocateVin}
                      disabled={!selectedVin || allocating}
                    >
                      {allocating ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ animation: "spin 1s linear infinite" }}
                          >
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                          </svg>
                          Đang phân bổ...
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
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                          </svg>
                          Phân bổ VIN
                        </>
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
                        {localOrder.id}
                      </p>
                      <div className="success-status">
                        <span className="order-status-badge confirmed">
                          Đã phân bổ
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* Allocation Status - Only show for allocated orders */}
              {isReadonly && (
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
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4>Trạng thái phân bổ</h4>
                  </div>
                <div className="allocation-status-section">
                  <div className="status-info">
                    <div className="status-item">
                      <label>Trạng thái:</label>
                      <span className="order-status-badge confirmed">Đã phân bổ</span>
                    </div>
                    <div className="status-item">
                      <label>VIN được phân bổ:</label>
                      <span className="allocated-vin-code">{localOrder.vin}</span>
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

            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VinAllocationDetail;
