import React, { useState, useEffect, useRef } from "react";
import "./BackorderedManagement.css";
import { useToast } from "../../contexts/useToast";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import {
  formatPrice,
  formatDate,
  mapBackendPoToFrontend,
  mapBackendPoDetailToFrontend,
} from "../../services/poDataMapper";
import CreatePOForm from "./CreatePOForm";
import branchApiService from "../../services/branchApi";

const BackorderedManagement = () => {
  const toast = useToast();
  const hasShownToast = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [backorderedOrders, setBackorderedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [backorderedPoData, setBackorderedPoData] = useState(null);
  const [prefillData, setPrefillData] = useState(null); // Store pre-fill data for CreatePOForm
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 5;

  // Status Management for PO

  const statusConfig = {
    Draft: {
      text: "Nháp",
      className: "draft",
      color: "#6c757d",
    },
    Submit: {
      text: "Đã gửi",
      className: "submit",
      color: "#ffc107",
    },
    Confirm: {
      text: "Đã xác nhận",
      className: "confirm",
      color: "#17a2b8",
    },
    InTransit: {
      text: "Đang vận chuyển",
      className: "intransit",
      color: "#fd7e14",
    },
    Cancel: {
      text: "Đã hủy",
      className: "cancel",
      color: "#dc3545",
    },
    Delivery: {
      text: "Đã giao hàng",
      className: "delivery",
      color: "#28a745",
    },
    Backordered: {
      text: "Đặt hàng lại",
      className: "backordered",
      color: "#dc3545",
    },
  };

  const getStatusInfo = (status = "Draft") => {
    return statusConfig[status] || statusConfig.Draft;
  };

  // Get status text (no badge, just text)
  const getStatusText = (status = "Draft") => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.text;
  };

  // Load backordered POs
  useEffect(() => {
    const loadBackorderedOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all purchase orders
        const response = await purchaseOrderApiService.getPurchaseOrders();

        // Filter only POs with status "Backordered"
        const mappedOrders = (response.data || [])
          .map(mapBackendPoToFrontend)
          .filter((order) => order.status === "Backordered");

        setBackorderedOrders(mappedOrders);

        if (!hasShownToast.current && mappedOrders.length > 0) {
          hasShownToast.current = true;
          toast.info(`Đã tải ${mappedOrders.length} đơn đặt hàng backordered`, {
            title: "Tải dữ liệu thành công",
            duration: 3000,
          });
        }
      } catch {
        const errorMsg = "Không thể tải danh sách đơn đặt hàng backordered.";
        setError(errorMsg);
        toast.error(errorMsg, {
          title: "Lỗi tải dữ liệu",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadBackorderedOrders();
  }, [toast]);

  // Filter and search logic
  const filteredOrders = backorderedOrders.filter((order) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setBackorderedPoData(null);
    setPrefillData(null);
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);

      // Instead of creating a new PO, we'll submit the existing backordered PO directly
      // This will change its status from Backordered -> Submit
      if (!backorderedPoData || !backorderedPoData.poId) {
        throw new Error("Không tìm thấy thông tin đơn đặt hàng backordered");
      }

      const backorderedPoId = backorderedPoData.poId;

      await purchaseOrderApiService.submitPurchaseOrder(backorderedPoId);
      const refreshResponse = await purchaseOrderApiService.getPurchaseOrders();
      const mappedOrders = (refreshResponse.data || [])
        .map(mapBackendPoToFrontend)
        .filter((order) => order.status === "Backordered");
      setBackorderedOrders(mappedOrders);

      // Close form
      setShowCreateForm(false);
      setBackorderedPoData(null);
      setPrefillData(null);

      // Show success message
      toast.success(
        `Đơn đặt hàng PO-${backorderedPoId} đã được gửi thành công! Status đã chuyển từ Backordered sang Submit. Đơn hàng sẽ xuất hiện trong trang "Quản lý đơn hàng" với status Submit.`,
        {
          title: "Thành công",
          duration: 5000,
        }
      );
    } catch (error) {
      let errorMsg = "Unknown error";
      if (error.response?.data) {
        if (Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.join(", ");
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          errorMsg = error.response.data;
        } else if (error.response.data.title) {
          errorMsg = error.response.data.title;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(`Lỗi khi tạo đơn đặt hàng: ${errorMsg}`, {
        title: "Lỗi",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePO = async (order) => {
    try {
      setLoading(true);

      // Extract PO ID from the order ID (remove "PO-" prefix)
      const poId = order.id.replace("PO-", "");

      // Store backordered PO data for submitting
      setBackorderedPoData({
        poId: poId,
        originalOrder: order,
      });

      // Fetch detailed PO data to get PoItems and BranchId (for display in form)
      const response = await purchaseOrderApiService.getPurchaseOrderById(poId);
      const poDetail = mapBackendPoDetailToFrontend(response.data);

      if (!poDetail || !poDetail.items || poDetail.items.length === 0) {
        toast.error("Không thể lấy thông tin chi tiết đơn hàng", {
          title: "Lỗi",
          duration: 3000,
        });
        return;
      }

      // Fetch branch info to get BranchCode
      let branchCode = "";
      if (poDetail.dealerId || order.branchId) {
        try {
          const branchesResponse = await branchApiService.getBranches();
          const branches = branchesResponse.data || [];

          // Find branch by BranchId from PO
          const branchId = order.branchId || poDetail.branchId;
          const branch = branches.find((b) => b.branchId === branchId);

          if (branch) {
            branchCode = branch.code || branch.name || "";
          }
        } catch {
          // Silently fail if branch fetch fails
        }
      }

      // Convert PO items to CreatePOForm format (need product info)
      const prefilledItems = poDetail.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        // These will be loaded from products API in CreatePOForm
        name: item.productName || `Product ${item.productId}`,
        floorPrice: item.unitPrice || 0,
        effectivePrice: item.unitPrice || 0,
      }));

      // Store pre-fill data for CreatePOForm (for display only, user can verify before submitting)
      setPrefillData({
        branchCode: branchCode,
        selectedItems: prefilledItems,
      });

      // Open CreatePOForm (user can review and confirm, then submit will update the existing PO)
      setShowCreateForm(true);
    } catch {
      toast.error("Không thể tải chi tiết đơn hàng", {
        title: "Lỗi",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Render CreatePOForm if showCreateForm is true
  if (showCreateForm) {
    return (
      <CreatePOForm
        onClose={handleCloseForm}
        onSubmit={handleSubmitOrder}
        initialBranchCode={prefillData?.branchCode}
        initialItems={prefillData?.selectedItems}
      />
    );
  }

  return (
    <div className="backordered-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý Backordered</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các đơn hàng backordered của khách hàng
        </p>
      </div>

      <div className="backordered-list-container">
        <div className="backordered-list-header">
          <h2 className="list-title">
            Danh sách Backordered ({filteredOrders.length})
          </h2>

          {/* Filter inside the form */}
          <div className="filter-container-inline">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Draft">Nháp</option>
              <option value="Submit">Đã gửi</option>
              <option value="Confirm">Đã xác nhận</option>
              <option value="InTransit">Đang vận chuyển</option>
              <option value="Cancel">Đã hủy</option>
              <option value="Delivery">Đã giao hàng</option>
              <option value="Backordered">Đặt hàng lại</option>
            </select>
          </div>
        </div>

        <div className="backordered-list-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách đơn hàng...</p>
            </div>
          )}

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

          {!loading && !error && (
            <div className="backordered-table-container">
              <div className="backordered-table-header">
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
                  <div className="empty-icon">📦</div>
                  <h3 className="empty-title">Không tìm thấy đơn hàng</h3>
                  <p className="empty-description">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="backordered-table-rows">
                    {currentOrders.map((order) => (
                      <div key={order.id} className="backordered-table-row">
                        <div className="table-cell" data-column="1">
                          <span className="order-id">{order.id}</span>
                        </div>
                        <div className="table-cell amount" data-column="2">
                          {formatPrice(order.lineTotal || 0)}
                        </div>
                        <div className="table-cell" data-column="3">
                          <span>{order.quantity || 0}</span>
                        </div>
                        <div className="table-cell" data-column="4">
                          {getStatusText(order.status)}
                        </div>
                        <div className="table-cell actions" data-column="5">
                          <button
                            className="action-btn view"
                            onClick={() => handleCreatePO(order)}
                            disabled={loading || submitting}
                          >
                            {loading ? "Đang tải..." : "Đơn đặt hàng"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

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

      {showDetailModal && selectedOrder && (
        <div className="detail-modal-overlay">
          <div className="detail-modal-container">
            <div className="detail-modal-header">
              <h2 className="detail-modal-title">
                Chi tiết đơn hàng Backordered
              </h2>
              <button
                className="detail-modal-close"
                onClick={handleCloseDetailModal}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-content">
              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin đơn hàng</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <label>Mã đơn hàng:</label>
                    <span>
                      {selectedOrder.orderCode ||
                        `ORD-${selectedOrder.orderId}`}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>ID:</label>
                    <span>{selectedOrder.orderId}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Khách hàng:</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Sản phẩm:</label>
                    <span>{selectedOrder.vehicleName}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Màu sắc:</label>
                    <span>{selectedOrder.vehicleColor || "N/A"}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Tổng tiền:</label>
                    <span>{formatPrice(selectedOrder.amount)}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Trạng thái:</label>
                    <span>{getStatusText(selectedOrder.status)}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackorderedManagement;
