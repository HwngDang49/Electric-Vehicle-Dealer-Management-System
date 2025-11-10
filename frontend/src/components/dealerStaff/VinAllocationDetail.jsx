import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
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
  const [allocationStatus, setAllocationStatus] = useState("pending");
  const [availableVins, setAvailableVins] = useState([]);
  const [loadingVins, setLoadingVins] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [note, setNote] = useState("");
  const [localOrder, setLocalOrder] = useState(order);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const [reloadKey, setReloadKey] = useState(0); // For forcing reload

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date - Backend đã convert sang VN time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
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
        return "N/A";
      }

      // Format với timezone VN (Asia/Ho_Chi_Minh)
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "N/A";
    }
  };

  const isReadonly =
    localOrder.statusType === "allocated" ||
    localOrder.status === "Allocated" ||
    localOrder.status === "ALLOCATED" ||
    !!localOrder.vin;

  const getStatusBadge = () => {
    const statusMap = {
      draft: { text: "Nháp", class: "draft" },
      pending: { text: "Chờ xử lý", class: "pending" },
      confirmed: { text: "Đã xác nhận", class: "confirmed" },
      allocated: { text: "Đã phân bổ", class: "allocated" },
      backordered: { text: "Chờ xe về", class: "backordered" },
    };

    const status = statusMap[localOrder.statusType] || {
      text: localOrder.status,
      class: "draft",
    };

    return (
      <span className={`vin-status-badge ${status.class}`}>{status.text}</span>
    );
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const loadOrderDetail = async () => {
    if (!order?.backendId) {
      setLoadingDetail(false);
      setLocalOrder(order);
      return;
    }

    try {
      setLoadingDetail(true);
      console.log(
        "📥 Loading order detail for VIN allocation:",
        order.backendId
      );

      const response = await apiClient.get(`/orders/${order.backendId}`);
      const detailData =
        response.data?.value || response.data?.data || response.data;

      console.log("✅ Order detail loaded:", detailData);

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
          vin: detailData.vin || detailData.allocatedVin || detailData.item?.vin || order.vin,
          status: detailData.status || order.status,
          statusType: detailData.statusType || order.statusType,
        };

      setLocalOrder(transformedOrder);
    } catch (error) {
      console.error("❌ Error loading order detail:", error);
      setLocalOrder(order);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [order.backendId, reloadKey]);

  useEffect(() => {
    const fetchAvailableVins = async () => {
      if (!order || !order.backendId) {
        console.error("❌ No order or backendId found");
        return;
      }

      // Don't fetch VINs if order already has VIN allocated
      if (order.vin || order.statusType === "allocated" || order.status === "Allocated") {
        setAvailableVins([]);
        return;
      }

      try {
        setLoadingVins(true);
        console.log("📤 Fetching available VINs for order:", order.backendId);

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

        const transformedVins = vinsData.map((vin) => ({
          id: vin.vin,
          vin: vin.vin,
          vehicle: vin.productName || "N/A",
          color: vin.colorName || "N/A",
          arrivalDate: formatDate(vin.receivedAt),
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
  }, [order?.backendId, order?.vin, order?.statusType, order?.status]); // Only depend on relevant fields, not entire order object

  if (!order) {
    return (
      <div className="vin-allocation-app">
        <div className="vin-allocation-modal-overlay">
          <div className="vin-allocation-modal-content">
            <div className="vin-error-message">
              <h2>Không tìm thấy đơn hàng</h2>
              <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
              <button className="vin-allocation-close-btn" onClick={onBack}>
                Quay lại
              </button>
            </div>
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

  const handleBackorder = async () => {
    if (!order.backendId) {
      alert("Không tìm thấy thông tin đơn hàng");
      return;
    }

    const confirmBackorder = window.confirm(
      "Không có xe trong kho. Bạn có muốn chuyển đơn hàng sang trạng thái Backorder (chờ xe về) không?"
    );

    if (!confirmBackorder) return;

    try {
      setAllocating(true);
      console.log("📤 Moving order to Backordered:", order.backendId);

      const response = await apiClient.post(
        `/orders/${order.backendId}/backorder`
      );

      console.log("✅ Backorder response:", response.data);

      alert(
        `✅ Đơn hàng đã chuyển sang Backorder!\nQuản lý sẽ đặt hàng và thông báo ETA.`
      );

      // Reload lại trang để cập nhật status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("❌ Error backorder:", error);
      const errorMessage = 
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message;
      alert(
        `❌ Không thể chuyển sang Backorder!\n${errorMessage}`
      );
    } finally {
      setAllocating(false);
    }
  };

  const handleAllocateVin = async () => {
    if (!selectedVin) {
      showToast("error", "Vui lòng chọn VIN để phân bổ");
      return;
    }

    if (!order.backendId) {
      showToast("error", "Không tìm thấy thông tin đơn hàng");
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

      const response = await apiClient.post("/orders/allocate-vin", {
        OrderId: parseInt(order.backendId),
        Note: note || `Phân bổ VIN ${selectedVin.vin} cho đơn hàng ${order.id}`,
      });

      console.log("✅ VIN allocation response:", response.data);

      setAllocationStatus("success");

      // Show toast
      showToast("success", `Phân bổ VIN thành công! VIN: ${selectedVin.vin} - Đơn hàng: ${order.id}`);
      
      // Update localOrder immediately with the allocated VIN (for immediate UI feedback)
      setLocalOrder(prev => ({
        ...prev,
        vin: selectedVin.vin,
        status: "Allocated",
        statusType: "allocated"
      }));

      // Notify parent about successful allocation
      // Parent will handle the full reload after a delay to preserve toast visibility
      if (onAllocateSuccess) {
        onAllocateSuccess(order.id, selectedVin.vin);
      }
    } catch (error) {
      console.error("❌ Error allocating VIN:", error);
      setAllocationStatus("error");

      const errorMessage =
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể phân bổ VIN. Vui lòng thử lại.";

      showToast("error", errorMessage);
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="vin-allocation-app">
      {toast && ReactDOM.createPortal(
        <div className={`vin-toast ${toast.type === 'error' ? 'vin-toast-error' : ''}`} style={{ zIndex: 99999 }}>
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

      <div className="vin-allocation-modal-overlay">
        <div className="vin-allocation-modal-content">
          {/* Header */}
          <div className="vin-allocation-modal-header">
            <div className="vin-allocation-header-left">
              <div className="vin-allocation-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              <h2 className="vin-allocation-modal-title">Phân bổ VIN</h2>
            </div>
            <button className="vin-allocation-close-btn" onClick={onBack}>
              Đóng
            </button>
          </div>

          {/* Body */}
          <div className="vin-allocation-modal-body">
            {loadingDetail ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "60px 20px",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="vin-loading-spinner"></div>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  Đang tải thông tin đơn hàng...
                </p>
              </div>
            ) : (
              <>
                {/* Header Card */}
                <div className="vin-header-card">
                  <div className="vin-header-info">
                    <h3>Đơn hàng #{localOrder.id}</h3>
                    <div className="vin-header-meta">
                      <span>Ngày đặt: {localOrder.date || "N/A"}</span>
                    </div>
                  </div>
                  {getStatusBadge()}
                </div>

                {/* Details - Two Column Layout */}
                <div className="vin-details">
                  {/* Left Column - VIN List */}
                  <div className="vin-left-column">
                    <div className="vin-detail-section">
                      <div className="vin-detail-card-header">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <h4>
                          {isReadonly ? "VIN Đã Phân Bổ" : "Kho VIN Khả Dụng"}
                        </h4>
                      </div>

                      {isReadonly ? (
                        <div className="allocated-vin-display">
                          <div className="allocated-vin-item">
                            <div className="vin-header">
                              <span className="vin-code">{localOrder.vin}</span>
                              <div className="vin-status allocated">
                                Đã phân bổ
                              </div>
                            </div>
                            <div className="allocated-vin-details">
                              <div className="vin-vehicle">
                                {localOrder.vehicle?.name ||
                                  localOrder.item?.name ||
                                  "N/A"}{" "}
                                -{" "}
                                {localOrder.vehicle?.color ||
                                  localOrder.item?.color ||
                                  "N/A"}
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
                              <div className="vin-item-content">
                                <div className="vin-code">{vin.vin}</div>
                                <div className="vin-info-text">
                                  {vin.vehicle || "N/A"} • {vin.color || "N/A"}
                                  {vin.branchName && ` • ${vin.branchName}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Actions & Vehicle Info */}
                  <div className="vin-right-column">
                    {/* Card 1: Hành động phân bổ (trên cùng) */}
                    {!isReadonly && (
                      <div className="vin-action-card">
                        <div className="vin-action-header">
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
                        <p className="vin-action-description">
                          Chọn VIN và phân bổ cho đơn hàng này
                        </p>
                        <div className="selected-vin">
                          <label>VIN đã chọn:</label>
                          <span className="selected-vin-value">
                            {selectedVin ? selectedVin.vin : "Chưa chọn"}
                          </span>
                        </div>

                        {allocationStatus !== "success" && (
                          <>
                            {availableVins.length > 0 ? (
                              <button
                                className="vin-action-btn success"
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
                                      style={{
                                        animation: "spin 1s linear infinite",
                                      }}
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
                            ) : (
                              <>
                                {localOrder.statusType === "backordered" ? (
                                  <div className="backorder-notice">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <div className="backorder-notice-content">
                                      <h4>Đơn hàng đang ở trạng thái Backorder</h4>
                                      <p>Đang chờ xe về kho. Manager sẽ đặt hàng và thông báo ETA.</p>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    className="vin-action-btn warning"
                                    onClick={handleBackorder}
                                    disabled={allocating}
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
                                          style={{
                                            animation: "spin 1s linear infinite",
                                          }}
                                        >
                                          <path d="M21 12a9 9 0 11-6.219-8.56" />
                                        </svg>
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
                                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Chuyển sang Backorder
                                      </>
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </>
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
                              VIN {selectedVin?.vin} đã được phân bổ cho đơn
                              hàng {localOrder.id}
                            </p>
                            <div className="success-status">
                              <span className="vin-status-badge confirmed">
                                Đã phân bổ
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card 2: Trạng thái phân bổ (cho allocated orders) */}
                    {isReadonly && (
                      <div className="vin-action-card">
                        <div className="vin-action-header">
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
                              <label>VIN được phân bổ:</label>
                              <span className="allocated-vin-code">
                                {localOrder.vin}
                              </span>
                            </div>
                          </div>

                          <div className="delivery-schedule-section">
                            <button
                              className="delivery-schedule-btn"
                              onClick={() => {
                                if (onNavigateToDelivery) {
                                  // ✅ Pass localOrder instead of order to include VIN data
                                  onNavigateToDelivery(localOrder);
                                }
                              }}
                              style={{
                                backgroundColor: localOrder.statusType === "ready" || localOrder.statusType === "delivered" 
                                  ? "#20c997" 
                                  : "#28a745",
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
                              {localOrder.statusType === "ready" || localOrder.statusType === "delivered" ? (
                                <>
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                  </svg>
                                  Xem lịch giao xe
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
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Lên lịch giao xe cho khách
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card 3: Thông tin xe (dưới cùng) */}
                    <div className="vin-detail-section vehicle-info-compact">
                      <div className="vin-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                        </svg>
                        <h4>Thông Tin Xe</h4>
                      </div>
                      <div className="vin-detail-grid">
                        <div className="vin-detail-item full-width">
                          <span className="vin-detail-label">Model xe</span>
                          <span className="vin-detail-value">
                            {localOrder.vehicle?.name ||
                              localOrder.item?.name ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="vin-detail-item">
                          <span className="vin-detail-label">Màu sắc</span>
                          <span className="vin-detail-value">
                            {localOrder.vehicle?.color ||
                              localOrder.item?.color ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="vin-detail-item">
                          <span className="vin-detail-label">
                            Dung lượng pin
                          </span>
                          <span className="vin-detail-value">
                            {localOrder.vehicle?.batteryKwh ||
                            localOrder.item?.batteryKwh
                              ? `${
                                  localOrder.vehicle?.batteryKwh ||
                                  localOrder.item?.batteryKwh
                                } kWh`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="vin-detail-item">
                          <span className="vin-detail-label">
                            Công suất động cơ
                          </span>
                          <span className="vin-detail-value">
                            {localOrder.vehicle?.motorKw ||
                            localOrder.item?.motorKw
                              ? `${
                                  localOrder.vehicle?.motorKw ||
                                  localOrder.item?.motorKw
                                } kW`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="vin-detail-item">
                          <span className="vin-detail-label">Quãng đường</span>
                          <span className="vin-detail-value">
                            {localOrder.vehicle?.rangeKm ||
                            localOrder.item?.rangeKm
                              ? `${
                                  localOrder.vehicle?.rangeKm ||
                                  localOrder.item?.rangeKm
                                } km`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinAllocationDetail;
