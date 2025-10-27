import React, { useState, useEffect } from "react";
import CreatePOForm from "./CreatePOForm";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import {
  mapBackendPoToFrontend,
  mapBackendPoDetailToFrontend,
  formatPrice,
  formatDate,
  getStatusDisplayText,
  getStatusColorClass,
} from "../../services/poDataMapper";
import "./POManagement.css";

const POManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 5;

  // Get user role from token
  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      const role =
        payload.role ||
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        payload["Role"];
      return role;
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  const userRole = getUserRole();
  const isManager = true;

  // Status Management - Easy to maintain and update
  // Khớp với Backend Enum: POStatus { Draft, Submit, Confirm, InTransit, Cancel, Delivery }
  const statusConfig = {
    Draft: {
      text: "Draft",
      className: "draft",
      color: "#6c757d",
    },
    Submit: {
      text: "Submit",
      className: "submit",
      color: "#ffc107",
    },
    Confirm: {
      text: "Confirm",
      className: "confirm",
      color: "#17a2b8",
    },
    InTransit: {
      text: "In Transit",
      className: "intransit",
      color: "#fd7e14",
    },
    Cancel: {
      text: "Cancel",
      className: "cancel",
      color: "#dc3545",
    },
    Delivery: {
      text: "Delivery",
      className: "delivery",
      color: "#28a745",
    },
  };

  // Get status info - centralized status management
  const getStatusInfo = (status = "Draft") => {
    return statusConfig[status] || statusConfig.Draft;
  };

  // Render status badge component - reusable and maintainable
  const renderStatusBadge = (status = "Draft") => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Filter and search logic
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productId &&
        order.productId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.product &&
        order.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.contactPerson &&
        order.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Load purchase orders from API on component mount
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await purchaseOrderApiService.getPurchaseOrders();

        // Map backend data to frontend format using mapper
        const mappedOrders = (response.data || [])
          .map(mapBackendPoToFrontend)
          .filter(Boolean);

        setPurchaseOrders(mappedOrders);
      } catch (err) {
        console.error("❌ Error loading purchase orders:", err);
        setError("Không thể tải danh sách đơn đặt hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrders();
  }, []);

  // Reset to first page when search term or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCreatePO = () => {
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleViewDetails = async (order) => {
    try {
      setLoading(true);

      // Extract PO ID from the order ID (remove "PO-" prefix)
      const poId = order.id.replace("PO-", "");

      // Fetch detailed data from backend
      const response = await purchaseOrderApiService.getPurchaseOrderById(poId);

      // Map backend detail data to frontend format
      const detailedOrder = mapBackendPoDetailToFrontend(response.data);

      // Merge with existing order data
      const mergedOrder = {
        ...order,
        ...detailedOrder,
        details: detailedOrder,
      };

      setSelectedOrder(mergedOrder);
      setShowDetailModal(true);
    } catch (err) {
      console.error("❌ Error loading PO details:", err);
      setError("Không thể tải chi tiết đơn đặt hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleSubmitPO = async (poId) => {
    try {
      setSubmitting(true);

      const response = await purchaseOrderApiService.submitPurchaseOrder(poId);

      // Refresh purchase orders list
      const refreshResponse = await purchaseOrderApiService.getPurchaseOrders();
      const mappedOrders = (refreshResponse.data || [])
        .map(mapBackendPoToFrontend)
        .filter(Boolean);
      setPurchaseOrders(mappedOrders);

      // Update selected order status
      const updatedOrder = mappedOrders.find((po) => po.id === `PO-${poId}`);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }

      // Show success message
      setSuccessMessage(`Đơn đặt hàng PO-${poId} đã được gửi thành công!`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      console.error("❌ Error submitting PO:", err);
      setSuccessMessage(`Lỗi khi gửi đơn hàng: ${err.message}`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveToPayment = async (order) => {
    try {
      setSubmitting(true);
      console.log(`💳 Moving PO to payment: ${order.id}`);

      // TODO: Implement API call when backend is ready
      // const response = await purchaseOrderApiService.moveToPayment(
      //   order.details?.poId || order.id.replace("PO-", "")
      // );

      // For now, just show success message
      setSuccessMessage(`Đơn hàng ${order.id} đã được chuyển sang thanh toán!`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      console.error("❌ Error moving to payment:", err);
      setSuccessMessage(`Lỗi khi chuyển sang thanh toán: ${err.message}`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveToInventory = async (order) => {
    try {
      setSubmitting(true);
      console.log(`📦 Receiving PO to inventory (Delivery): ${order.id}`);

      // Call backend API to receive items to inventory (for Delivery status)
      const response = await purchaseOrderApiService.receiveToInventory(
        order.details?.poId || order.id.replace("PO-", "")
      );

      console.log("✅ PO received to inventory successfully:", response);

      // Update selected order to mark inventory as received
      const updatedOrder = {
        ...order,
        details: {
          ...order.details,
          inventoryReceived: response.InventoryReceived ?? true,
        },
      };
      setSelectedOrder(updatedOrder);

      // Show success message
      setSuccessMessage(`Đơn hàng ${order.id} đã được nhập kho thành công!`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      console.error("❌ Error receiving to inventory:", err);
      setSuccessMessage(`Lỗi khi nhập kho: ${err.message}`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (order) => {
    try {
      setSubmitting(true);
      console.log(`🚚 Nhập kho cho PO InTransit: ${order.id}`);

      // Call backend API POST /api/po/receive-vin (ConfirmDeliveryController)
      const response = await purchaseOrderApiService.confirmDelivery(
        order.details?.poId || order.id.replace("PO-", "")
      );

      console.log("✅ Nhập kho thành công:", response);

      // Refresh purchase orders list
      const refreshResponse = await purchaseOrderApiService.getPurchaseOrders();
      const mappedOrders = (refreshResponse.data || [])
        .map(mapBackendPoToFrontend)
        .filter(Boolean);
      setPurchaseOrders(mappedOrders);

      // Close modal
      handleCloseDetailModal();

      // Show success message
      setSuccessMessage(
        `Đơn hàng ${order.id} đã được nhập kho thành công! Xe đã chuyển sang InStock và thuộc quyền Dealer.`
      );
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      console.error("❌ Error nhập kho:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response,
        data: err.response?.data,
        errors: err.response?.data?.errors,
      });

      // Extract detailed error message from backend
      let errorMessage = "Vui lòng thử lại";
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        errorMessage = err.response.data.errors.join(", ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setSuccessMessage(`Lỗi khi nhập kho: ${errorMessage}`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Format price helper function
  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmitOrder = async (orderData) => {
    console.log("Creating new PO:", orderData);

    try {
      // Use imported purchaseOrderApiService

      // Map frontend data to backend format
      const backendData = {
        BranchCode: orderData.branchName || "", // Send branch code (e.g., "SR-Q1")
        PoItems: orderData.selectedItems.map((item) => ({
          ProductId: parseInt(item.productId), // Convert to number
          Qty: parseInt(item.quantity), // Convert to number
        })),
      };

      console.log("Sending to backend:", backendData);

      // Call backend API
      const response = await purchaseOrderApiService.createPurchaseOrder(
        backendData
      );

      if (response.status === "success") {
        // Generate unique PO ID for frontend display
        const poId = `PO-${response.data || Date.now()}`;

        // Create new purchase order object with detailed information
        const newOrder = {
          id: poId,
          productId: orderData.selectedItems
            .map((item) => item.productId || item.id)
            .join("-"),
          product: orderData.selectedItems
            .map((item) => `${item.name} (${item.quantity})`)
            .join(", "),
          quantity: orderData.selectedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalAmount: "₫" + orderData.totalAmount.toLocaleString(),
          contactPerson: orderData.contactPerson || "Chưa xác định",
          orderDate: new Date().toLocaleDateString("vi-VN"),
          status: "pending",
          statusText: "Chờ xử lý",
          priority: "medium",
          // Store detailed information for modal
          details: {
            dealerInfo: {
              dealerName: orderData.dealerName || "",
              contactPerson: orderData.contactPerson || "",
              phone: orderData.phone || "",
              email: orderData.email || "",
              address: orderData.address || "",
            },
            selectedItems: orderData.selectedItems || [],
            items: orderData.selectedItems || [], // For consistency with backend data
            totalAmount: orderData.totalAmount || 0,
            totalQuantity:
              orderData.selectedItems?.reduce(
                (total, item) => total + (item.quantity || 0),
                0
              ) || 0,
            orderDate: new Date().toLocaleDateString("vi-VN"),
            expectedDelivery: orderData.expectedDelivery || "",
          },
        };

        // Refresh purchase orders list from API
        const refreshPurchaseOrders = async () => {
          try {
            const response = await purchaseOrderApiService.getPurchaseOrders();
            const mappedOrders = (response.data || [])
              .map(mapBackendPoToFrontend)
              .filter(Boolean);
            setPurchaseOrders(mappedOrders);
            console.log("🔄 Purchase orders refreshed from API");
          } catch (err) {
            console.error("❌ Error refreshing purchase orders:", err);
          }
        };
        refreshPurchaseOrders();

        // Close form and show success notification
        setShowCreateForm(false);
        setSuccessMessage(`Đơn đặt hàng ${poId} đã được tạo thành công!`);
        setShowSuccessNotification(true);
      } else {
        throw new Error(response.message || "Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating PO:", error);
      // Show error notification
      setSuccessMessage(`Lỗi tạo đơn hàng: ${error.message}`);
      setShowSuccessNotification(true);
    }

    // Auto hide notification after 5 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  // If showing create form, render only the form
  if (showCreateForm) {
    return (
      <CreatePOForm onClose={handleCloseForm} onSubmit={handleSubmitOrder} />
    );
  }

  return (
    <div className="po-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý đơn đặt hàng</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các đơn đặt hàng từ hãng
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-filter-left">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm đơn đặt hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Draft">Draft</option>
              <option value="Submit">Submit</option>
              <option value="Confirm">Confirm</option>
              <option value="InTransit">In Transit</option>
              <option value="Cancel">Cancel</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>
        </div>
        <button className="add-po-btn" onClick={handleCreatePO}>
          + Tạo đơn đặt hàng mới
        </button>
      </div>

      {/* Purchase Orders List */}
      <div className="po-list-container">
        <div className="po-list-header">
          <h2 className="list-title">
            Danh sách đơn đặt hàng ({filteredOrders.length})
          </h2>
        </div>

        <div className="po-list-content">
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách đơn đặt hàng...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* PO Table - Only show when not loading and no error */}
          {!loading && !error && (
            <div className="po-table-container">
              <div className="po-table-header">
                <div className="table-cell" data-column="1">
                  PO ID
                </div>
                <div className="table-cell" data-column="2">
                  Line Total
                </div>
                <div className="table-cell" data-column="3">
                  Quantity
                </div>
                <div className="table-cell" data-column="4">
                  Status
                </div>
                <div className="table-cell" data-column="5">
                  Action
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3 className="empty-title">Không tìm thấy đơn đặt hàng</h3>
                  <p className="empty-description">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="po-table-rows">
                    {currentOrders.map((order) => {
                      // Tính toán Unit Wholesale từ Line Total và Quantity
                      const lineTotalAmount = parseInt(
                        order.lineTotal || order.totalAmount || 0
                      );
                      const quantity = order.quantity || 1;

                      return (
                        <div key={order.id} className="po-table-row">
                          <div className="table-cell" data-column="1">
                            <span className="po-id">{order.id}</span>
                          </div>
                          <div className="table-cell amount" data-column="2">
                            {formatPrice(
                              order.lineTotal || order.totalAmount || 0
                            )}
                          </div>
                          <div className="table-cell" data-column="3">
                            {quantity}
                          </div>
                          <div className="table-cell" data-column="4">
                            {renderStatusBadge(order.status)}
                          </div>
                          <div className="table-cell actions" data-column="5">
                            <button
                              className="action-btn view"
                              onClick={() => handleViewDetails(order)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        Hiển thị {startIndex + 1}-
                        {Math.min(endIndex, filteredOrders.length)} trong tổng
                        số {filteredOrders.length} đơn hàng
                      </div>
                      <div className="pagination-controls">
                        <button
                          className="pagination-btn"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                          </svg>
                          Trước
                        </button>

                        <div className="pagination-numbers">
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 &&
                                pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  className={`pagination-number ${
                                    currentPage === pageNum ? "active" : ""
                                  }`}
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="pagination-ellipsis"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          className="pagination-btn"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="detail-modal-overlay">
          <div className="detail-modal-container">
            <div className="detail-modal-header">
              <h2 className="detail-modal-title">
                Chi tiết đơn đặt hàng{" "}
                {selectedOrder.details?.poId || selectedOrder.id}
              </h2>
              <button
                className="detail-modal-close"
                onClick={handleCloseDetailModal}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-content">
              {/* Order Info */}
              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin đơn hàng</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <label>PO ID:</label>
                    <span>
                      {selectedOrder.details?.poId || selectedOrder.id}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Dealer ID:</label>
                    <span>{selectedOrder.details?.dealerId || "N/A"}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ngày tạo:</label>
                    <span>
                      {formatDate(
                        selectedOrder.details?.createAt ||
                          selectedOrder.createAt
                      )}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Trạng thái:</label>
                    <span>
                      {selectedOrder.details?.statusDisplay ||
                        selectedOrder.status}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Submitted By:</label>
                    <span>
                      {selectedOrder.details?.submittedByUserId || "N/A"}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Total Items:</label>
                    <span>
                      {selectedOrder.details?.items?.reduce(
                        (total, item) => total + (item.quantity || 0),
                        0
                      ) ||
                        selectedOrder.details?.totalQuantity ||
                        selectedOrder.quantity ||
                        0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dealer Info */}
              {selectedOrder.details && selectedOrder.details.dealerInfo && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Thông tin đại lý</h3>
                  <div className="detail-info-grid">
                    <div className="detail-info-item">
                      <label>Tên đại lý:</label>
                      <span>{selectedOrder.details.dealerInfo.dealerName}</span>
                    </div>
                    <div className="detail-info-item">
                      <label>Người liên hệ:</label>
                      <span>
                        {selectedOrder.details.dealerInfo.contactPerson}
                      </span>
                    </div>
                    <div className="detail-info-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedOrder.details.dealerInfo.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Items */}
              {selectedOrder.details && selectedOrder.details.items && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Sản phẩm đã chọn</h3>
                  <div className="detail-items-list">
                    {selectedOrder.details.items.map((item, index) => (
                      <div
                        key={item.poItemId || item.productId || index}
                        className="detail-item-card"
                      >
                        <div className="detail-item-image">
                          <div className="vehicle-placeholder">
                            <span className="vehicle-icon">🚗</span>
                          </div>
                        </div>
                        <div className="detail-item-info">
                          <h4 className="detail-item-name">
                            {item.productName}
                          </h4>
                          <p className="detail-item-category">
                            Product ID: {item.productId}
                          </p>
                          <div className="detail-item-specs">
                            <span>PO Item ID: {item.poItemId}</span>
                            <span>Unit Price: {item.formattedUnitPrice}</span>
                            <span>Line Total: {item.formattedLineTotal}</span>
                          </div>
                        </div>
                        <div className="detail-item-quantity">
                          <span className="quantity-label">Số lượng:</span>
                          <span className="quantity-value">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="detail-item-price">
                          <span className="price-label">Unit Wholesale:</span>
                          <span className="price-value">
                            {item.formattedUnitWholesale}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="detail-section">
                <h3 className="detail-section-title">Tổng kết đơn hàng</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>PO ID:</label>
                    <span>
                      {selectedOrder.details?.poId || selectedOrder.id}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Status:</label>
                    <span>
                      {selectedOrder.details?.statusDisplay ||
                        selectedOrder.status}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Số lượng sản phẩm:</label>
                    <span>
                      {selectedOrder.details?.items?.reduce(
                        (total, item) => total + (item.quantity || 0),
                        0
                      ) ||
                        selectedOrder.details?.totalQuantity ||
                        selectedOrder.quantity}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Tổng tiền:</label>
                    <span className="total-amount">
                      {selectedOrder.details?.formattedTotalAmount ||
                        formatPrice(selectedOrder.totalAmount || 0)}
                    </span>
                  </div>
                  {selectedOrder.details?.submittedAt && (
                    <div className="summary-item">
                      <label>Ngày gửi:</label>
                      <span>
                        {formatDate(selectedOrder.details.submittedAt)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.details?.dealerId && (
                    <div className="summary-item">
                      <label>Dealer ID:</label>
                      <span>{selectedOrder.details.dealerId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button - Only for Manager when status is Draft */}
              {(() => {
                console.log("🔍 Submit button check:");
                console.log("  isManager:", isManager);
                console.log("  selectedOrder.status:", selectedOrder.status);
                console.log(
                  "  selectedOrder.details?.status:",
                  selectedOrder.details?.status
                );
                console.log(
                  "  Should show:",
                  isManager &&
                    (selectedOrder.status === "Draft" ||
                      selectedOrder.status === "NHÁP" ||
                      selectedOrder.details?.status === "Draft")
                );
                return null;
              })()}
              {isManager &&
                (selectedOrder.status === "Draft" ||
                  selectedOrder.status === "NHÁP" ||
                  selectedOrder.details?.status === "Draft") && (
                  <div className="detail-section">
                    <div className="submit-po-section">
                      <button
                        className="submit-po-btn"
                        onClick={() =>
                          handleSubmitPO(
                            selectedOrder.details?.poId ||
                              selectedOrder.id.replace("PO-", "")
                          )
                        }
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>📤 Gửi đơn đặt hàng lên hãng</>
                        )}
                      </button>
                      <p className="submit-po-note">
                        ℹ️ Sau khi gửi, đơn hàng sẽ được chuyển sang trạng thái
                        "Submit" và chờ hãng xét duyệt.
                      </p>
                    </div>
                  </div>
                )}

              {/* InTransit Actions - Only for Manager when status is InTransit */}
              {isManager &&
                (selectedOrder.status === "InTransit" ||
                  selectedOrder.details?.status === "InTransit") && (
                  <div className="detail-section">
                    <div className="intransit-actions-section">
                      <h3 className="intransit-actions-title">
                        Thao tác vận chuyển
                      </h3>
                      <div className="intransit-buttons">
                        <button
                          className="intransit-action-btn payment-btn"
                          onClick={() => handleMoveToPayment(selectedOrder)}
                          disabled={submitting}
                        >
                          💳 Thanh toán
                        </button>
                        <button
                          className="intransit-action-btn inventory-btn"
                          onClick={() => handleConfirmDelivery(selectedOrder)}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner"></span>
                              Đang xử lý...
                            </>
                          ) : (
                            <>📦 Nhập kho</>
                          )}
                        </button>
                      </div>
                      <p className="intransit-actions-note">
                        ℹ️ Sau khi nhập kho, các xe sẽ chuyển từ{" "}
                        <strong>InTransit</strong> sang <strong>InStock</strong>{" "}
                        và thuộc quyền sở hữu của Dealer.
                      </p>
                    </div>
                  </div>
                )}

              {/* Delivery Actions - Only for Manager when status is Delivery */}
              {isManager &&
                (selectedOrder.status === "Delivery" ||
                  selectedOrder.details?.status === "Delivery") && (
                  <div className="detail-section">
                    <div className="delivery-actions-section">
                      <h3 className="delivery-actions-title">
                        Thao tác giao hàng
                      </h3>
                      <div className="delivery-buttons">
                        <button
                          className="delivery-action-btn inventory-btn"
                          onClick={() =>
                            handleReceiveToInventory(selectedOrder)
                          }
                          disabled={selectedOrder.details?.inventoryReceived}
                        >
                          {selectedOrder.details?.inventoryReceived ? (
                            <>✅ Đã nhập kho</>
                          ) : (
                            <>📦 Nhập kho</>
                          )}
                        </button>
                      </div>
                      <p className="delivery-actions-note">
                        ℹ️ Sau khi nhập kho, số lượng sản phẩm sẽ được cập nhật
                        vào kho của chi nhánh.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="success-notification">
          <div className="notification-content">
            <div className="notification-icon">✅</div>
            <div className="notification-message">{successMessage}</div>
            <button
              className="notification-close"
              onClick={() => setShowSuccessNotification(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POManagement;
