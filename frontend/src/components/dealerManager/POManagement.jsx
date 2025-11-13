import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import CreatePOForm from "./CreatePOForm";
import PageHeader from "./PageHeader";
import CustomDropdown from "../admin/CustomDropdown";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import dealerApiService from "../../services/dealerApi";
import userApiService from "../../services/userApi";
import {
  mapBackendPoToFrontend,
  mapBackendPoDetailToFrontend,
  formatDate,
} from "../../services/poDataMapper";
import { useToast } from "../../contexts/useToast";
import { useProductImageMapping } from "../../utils/productImageUtils";
import "./POManagement.css";

const POManagement = ({ onNavigateToHome }) => {
  const toast = useToast();
  const hasShownToast = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dealerName, setDealerName] = useState(null);
  const [submittedByUserName, setSubmittedByUserName] = useState(null);
  const [prefillItems, setPrefillItems] = useState(null);

  const getProductImagePath = useProductImageMapping();

  const getModelCodeFromItem = useCallback((item) => {
    // Try direct modelCode fields first
    if (item.modelCode || item.productModelCode || item.ModelCode) {
      return item.modelCode || item.productModelCode || item.ModelCode;
    }

    // Extract from productName (e.g., "VF 7 Base" -> "VF 7", "VF-8 Plus" -> "VF-8")
    if (item.productName) {
      // Pattern 1: Match "VF" followed by space/hyphen and number (e.g., "VF 7", "VF-8")
      let match = item.productName.match(/vf\s*[-\s]\s*\d+/i);
      if (match) {
        // Clean up: normalize spaces to single space
        return match[0].replace(/\s+/g, " ").trim();
      }

      // Pattern 2: Match "VF" followed directly by number (e.g., "VF8", "VFE34")
      match = item.productName.match(/vf\d+/i);
      if (match) {
        return match[0];
      }

      // Pattern 3: Match "VF" followed by space and alphanumeric (e.g., "VF e34", "VF 7")
      match = item.productName.match(/vf\s+[\w\d]+/i);
      if (match) {
        return match[0].trim();
      }

      // Pattern 4: Match "VF" followed by any alphanumeric (fallback)
      match = item.productName.match(/vf[\w\d]+/i);
      if (match) {
        return match[0];
      }
    }

    return item.productName || null;
  }, []);

  const itemsPerPage = 5;
  const isManager = true;

  const statusConfig = React.useMemo(
    () => ({
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
    }),
    []
  );

  const getStatusInfo = useCallback(
    (status = "Draft") => {
      return statusConfig[status] || statusConfig.Draft;
    },
    [statusConfig]
  );

  const getStatusText = useCallback(
    (status = "Draft") => {
      const statusInfo = getStatusInfo(status);
      return statusInfo.text;
    },
    [getStatusInfo]
  );

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((order) => {
      if (order.status === "Backordered") {
        return false;
      }

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
  }, [purchaseOrders, searchTerm, filterStatus]);

  // Load purchase orders from API on component mount
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await purchaseOrderApiService.getPurchaseOrders();

        const mappedOrders = (response.data || [])
          .map(mapBackendPoToFrontend)
          .filter(Boolean)
          .filter((order) => order.status !== "Backordered");

        setPurchaseOrders(mappedOrders);

        if (!hasShownToast.current && mappedOrders.length > 0) {
          hasShownToast.current = true;
          toast.info(`Đã tải ${mappedOrders.length} đơn đặt hàng`, {
            title: "Thông tin",
            duration: 3000,
          });
        }
      } catch {
        const errorMsg =
          "Không thể tải danh sách đơn đặt hàng. Vui lòng thử lại.";
        setError(errorMsg);

        toast.error(errorMsg, {
          title: "Lỗi",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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

  // Status filter options
  const statusFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Draft", label: "Nháp" },
    { value: "Submit", label: "Đã gửi" },
    { value: "Confirm", label: "Đã xác nhận" },
    { value: "InTransit", label: "Đang vận chuyển" },
    { value: "Cancel", label: "Đã hủy" },
    { value: "Delivery", label: "Đã giao hàng" },
  ];

  // Get visible page numbers (max 3 pages) - Fixed layout like EVM Staff
  const getVisiblePageNumbers = () => {
    const pages = [];

    // Always show page 1
    pages.push(1);

    // Show appropriate middle page
    if (totalPages > 1) {
      if (currentPage === 1) {
        // If on first page, show page 2
        if (totalPages > 1) pages.push(2);
      } else if (currentPage === totalPages) {
        // If on last page, show second to last page
        if (totalPages > 2) pages.push(totalPages - 1);
      } else {
        // Show current page
        pages.push(currentPage);
      }
    }

    // Show last page if totalPages > 1
    if (totalPages > 1) {
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
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
      setDealerName(null);
      setSubmittedByUserName(null);

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

      // Fetch dealer name if dealerId exists and dealerInfo is not available
      if (mergedOrder.details?.dealerId && !mergedOrder.details?.dealerInfo) {
        try {
          const dealerResponse = await dealerApiService.getDealerById(
            mergedOrder.details.dealerId
          );
          const dealerData = dealerResponse.data || dealerResponse;
          setDealerName(dealerData.name || dealerData.Name || "N/A");
        } catch {
          setDealerName(null);
        }
      } else if (mergedOrder.details?.dealerInfo?.dealerName) {
        // Use dealer name from dealerInfo if available
        setDealerName(mergedOrder.details.dealerInfo.dealerName);
      }

      // Fetch submitted by user name if submittedByUserId exists
      if (mergedOrder.details?.submittedByUserId) {
        try {
          const userResponse = await userApiService.getUserById(
            mergedOrder.details.submittedByUserId
          );
          const userData = userResponse.data || userResponse;
          setSubmittedByUserName(
            userData.fullName ||
              userData.FullName ||
              userData.username ||
              userData.Username ||
              "N/A"
          );
        } catch {
          setSubmittedByUserName(null);
        }
      }
    } catch {
      const errorMsg = "Không thể tải chi tiết đơn đặt hàng. Vui lòng thử lại.";
      setError(errorMsg);

      toast.error(errorMsg, {
        title: "Lỗi",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
    setDealerName(null);
    setSubmittedByUserName(null);
  };

  const handleSubmitPO = async (poId) => {
    try {
      setSubmitting(true);

      await purchaseOrderApiService.submitPurchaseOrder(poId);

      const refreshResponse = await purchaseOrderApiService.getPurchaseOrders();
      const mappedOrders = (refreshResponse.data || [])
        .map(mapBackendPoToFrontend)
        .filter(Boolean)
        .filter((order) => order.status !== "Backordered");
      setPurchaseOrders(mappedOrders);

      const updatedOrder = mappedOrders.find((po) => po.id === `PO-${poId}`);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }

      toast.success(`Đơn đặt hàng PO-${poId} đã được gửi thành công!`, {
        title: "Thành công",
        duration: 5000,
      });
    } catch (err) {
      toast.error(`Lỗi khi gửi đơn hàng: ${err.message}`, {
        title: "Lỗi",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveToInventory = async (order) => {
    try {
      setSubmitting(true);

      const response = await purchaseOrderApiService.receiveToInventory(
        order.details?.poId || order.id.replace("PO-", "")
      );

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
      toast.success(`Đơn hàng ${order.id} đã được nhập kho thành công!`, {
        title: "Thành công",
        duration: 5000,
      });
    } catch (err) {
      toast.error(`Lỗi khi nhập kho: ${err.message}`, {
        title: "Lỗi",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (order) => {
    try {
      setSubmitting(true);

      await purchaseOrderApiService.confirmDelivery(
        order.details?.poId || order.id.replace("PO-", "")
      );

      const refreshResponse = await purchaseOrderApiService.getPurchaseOrders();
      const mappedOrders = (refreshResponse.data || [])
        .map(mapBackendPoToFrontend)
        .filter(Boolean)
        .filter((order) => order.status !== "Backordered");
      setPurchaseOrders(mappedOrders);
      handleCloseDetailModal();

      toast.success(
        `Đơn hàng ${order.id} đã được nhập kho thành công! Xe đã chuyển sang InStock và thuộc quyền Dealer.`,
        {
          title: "Thành công",
          duration: 5000,
        }
      );
    } catch (err) {
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

      toast.error(`Lỗi khi nhập kho: ${errorMessage}`, {
        title: "Lỗi",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmitOrder = async (orderData) => {
    try {
      setSubmitting(true);

      const backendData = {
        BranchCode: orderData.branchName || "",
        PoItems: orderData.selectedItems.map((item) => ({
          ProductId: parseInt(item.productId),
          Qty: parseInt(item.quantity),
        })),
      };

      const response = await purchaseOrderApiService.createPurchaseOrder(
        backendData
      );

      if (response.status === "success") {
        const poId = `PO-${response.data || Date.now()}`;

        const refreshPurchaseOrders = async () => {
          try {
            const response = await purchaseOrderApiService.getPurchaseOrders();
            // Filter out Backordered orders
            const mappedOrders = (response.data || [])
              .map(mapBackendPoToFrontend)
              .filter(Boolean)
              .filter((order) => order.status !== "Backordered");
            setPurchaseOrders(mappedOrders);
          } catch {
            // Silent fail
          }
        };
        refreshPurchaseOrders();

        setShowCreateForm(false);
        toast.success(`Đơn đặt hàng ${poId} đã được tạo thành công!`, {
          title: "Thành công",
          duration: 5000,
        });
      } else {
        throw new Error(response.message || "Failed to create purchase order");
      }
    } catch (error) {
      // Extract error message
      let errorMessage = "Không thể tạo đơn hàng. Vui lòng thử lại.";

      if (error?.response?.data) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors[0] || errorMessage;
        } else if (data.errors && typeof data.errors === "object") {
          const allMessages = Object.values(data.errors).flat();
          errorMessage = allMessages[0] || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(`Lỗi tạo đơn hàng: ${errorMessage}`, {
        title: "Lỗi",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (showCreateForm) {
    return (
      <CreatePOForm
        onClose={handleCloseForm}
        onSubmit={handleSubmitOrder}
        initialItems={prefillItems}
      />
    );
  }

  return (
    <div className="po-management">
      <PageHeader
        title="Quản lý đơn đặt hàng"
        subtitle="Theo dõi và quản lý các đơn đặt hàng từ hãng"
        showBackButton={true}
        onBack={onNavigateToHome}
      />

      <div className="po-management-content">
        <div className="page-actions">
          <div className="search-filter-group">
            <div className="search-container-inline">
              <input
                type="text"
                placeholder="Tìm kiếm đơn đặt hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-container-inline">
              <CustomDropdown
                value={filterStatus}
                onChange={setFilterStatus}
                options={statusFilterOptions}
                placeholder="Chọn trạng thái"
                compact={true}
                minWidth="100%"
              />
            </div>
          </div>
          <button className="add-po-btn" onClick={handleCreatePO}>
            + Tạo đơn đặt hàng mới
          </button>
        </div>

        <div className="po-list-container">
          <div className="po-list-content">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách đơn đặt hàng...</p>
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
              <div className="po-table-container">
                <div className="po-table-header">
                  <div className="table-cell" data-column="1">
                    Mã đơn hàng
                  </div>
                  <div className="table-cell" data-column="2">
                    Tổng tiền
                  </div>
                  <div className="table-cell" data-column="3">
                    Số lượng
                  </div>
                  <div className="table-cell" data-column="4">
                    Trạng thái
                  </div>
                  <div className="table-cell" data-column="5">
                    Thao tác
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
                              <span
                                className={`status-badge ${
                                  order.status?.toLowerCase() || "draft"
                                }`}
                              >
                                {getStatusText(order.status)}
                              </span>
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

                    {totalPages > 1 && (
                      <div className="pagination-container">
                        <div className="pagination-info">
                          Hiển thị {startIndex + 1}-
                          {Math.min(endIndex, filteredOrders.length)} trong tổng
                          số {filteredOrders.length} bản ghi
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

                          {getVisiblePageNumbers().map((page) => (
                            <button
                              key={page}
                              className={`pagination-number ${
                                currentPage === page ? "active" : ""
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          ))}

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
          <div
            className="po-detail-modal-overlay"
            onClick={handleCloseDetailModal}
          >
            <div
              className="po-detail-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="po-detail-modal-header">
                <div className="po-detail-modal-header-left">
                  <div className="po-detail-modal-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <path d="M20 8v6"></path>
                      <path d="M23 11h-6"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="po-detail-modal-title">
                      Chi tiết đơn đặt hàng
                    </h2>
                    <p className="po-detail-modal-subtitle">
                      {selectedOrder.details?.poId || selectedOrder.id}
                    </p>
                  </div>
                </div>
                <button
                  className="po-detail-close-btn"
                  onClick={handleCloseDetailModal}
                >
                  Đóng
                </button>
              </div>

              {/* Body */}
              <div className="po-detail-modal-body">
                {/* 2-Column Grid Layout */}
                <div className="po-detail-content-grid">
                  {/* Left Column */}
                  <div className="po-detail-content-col">
                    {/* Order Info Card */}
                    <div className="po-detail-info-card">
                      <div className="po-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <h4>Thông tin đơn hàng</h4>
                      </div>
                      <div className="po-detail-grid">
                        <div className="po-detail-item">
                          <span className="po-detail-label">Mã đơn hàng</span>
                          <span className="po-detail-value">
                            {selectedOrder.details?.poId || selectedOrder.id}
                          </span>
                        </div>
                        <div className="po-detail-item">
                          <span className="po-detail-label">Trạng thái</span>
                          <span
                            className={`po-status-badge ${(
                              selectedOrder.details?.status ||
                              selectedOrder.status
                            )?.toLowerCase()}`}
                          >
                            {getStatusText(
                              selectedOrder.details?.status ||
                                selectedOrder.status
                            )}
                          </span>
                        </div>
                        <div className="po-detail-item">
                          <span className="po-detail-label">Ngày tạo</span>
                          <span className="po-detail-value">
                            {formatDate(
                              selectedOrder.details?.createAt ||
                                selectedOrder.createAt
                            )}
                          </span>
                        </div>
                        <div className="po-detail-item">
                          <span className="po-detail-label">Người gửi</span>
                          <span className="po-detail-value">
                            {submittedByUserName ||
                              selectedOrder.details?.submittedByUserId ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="po-detail-item full-width">
                          <span className="po-detail-label">Tổng số lượng</span>
                          <span className="po-detail-value po-amount">
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

                    {/* Dealer Info Card */}
                    {(dealerName ||
                      selectedOrder.details?.dealerInfo ||
                      selectedOrder.details?.dealerId) && (
                      <div className="po-detail-info-card">
                        <div className="po-detail-card-header">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <h4>Thông tin đại lý</h4>
                        </div>
                        <div className="po-detail-grid">
                          <div className="po-detail-item full-width">
                            <span className="po-detail-label">Tên đại lý</span>
                            <span className="po-detail-value">
                              {dealerName ||
                                selectedOrder.details?.dealerInfo?.dealerName ||
                                selectedOrder.details?.dealerId ||
                                "N/A"}
                            </span>
                          </div>
                          {selectedOrder.details?.dealerInfo?.contactPerson && (
                            <div className="po-detail-item">
                              <span className="po-detail-label">
                                Người liên hệ
                              </span>
                              <span className="po-detail-value">
                                {selectedOrder.details.dealerInfo.contactPerson}
                              </span>
                            </div>
                          )}
                          {selectedOrder.details?.dealerInfo?.phone && (
                            <div className="po-detail-item">
                              <span className="po-detail-label">
                                Số điện thoại
                              </span>
                              <span className="po-detail-value">
                                {selectedOrder.details.dealerInfo.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary Card */}
                    <div className="po-detail-info-card">
                      <div className="po-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <h4>Tổng kết đơn hàng</h4>
                      </div>
                      <div className="po-detail-grid">
                        <div className="po-detail-item">
                          <span className="po-detail-label">Mã đơn hàng</span>
                          <span className="po-detail-value">
                            {selectedOrder.details?.poId || selectedOrder.id}
                          </span>
                        </div>
                        {selectedOrder.details?.submittedAt && (
                          <div className="po-detail-item">
                            <span className="po-detail-label">Ngày gửi</span>
                            <span className="po-detail-value">
                              {formatDate(selectedOrder.details.submittedAt)}
                            </span>
                          </div>
                        )}
                        <div className="po-detail-item full-width highlight-green">
                          <span className="po-detail-label">Tổng tiền</span>
                          <span className="po-detail-value po-total-amount">
                            {selectedOrder.details?.formattedTotalAmount ||
                              formatPrice(selectedOrder.totalAmount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="po-detail-content-col">
                    {/* Products List Card */}
                    {selectedOrder.details && selectedOrder.details.items && (
                      <div className="po-detail-info-card">
                        <div className="po-detail-card-header">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          <h4>
                            Sản phẩm đã chọn (
                            {selectedOrder.details.items.length})
                          </h4>
                        </div>
                        <div className="po-detail-info-body">
                          <div className="po-detail-items-list">
                            {selectedOrder.details.items.map((item, index) => (
                              <div
                                key={item.poItemId || item.productId || index}
                                className="po-detail-item-card"
                              >
                                <div className="po-detail-item-image">
                                  {(() => {
                                    const modelCode =
                                      getModelCodeFromItem(item);
                                    const imagePath = getProductImagePath({
                                      modelCode: modelCode,
                                      ...item,
                                    });

                                    return imagePath ? (
                                      <img
                                        src={imagePath}
                                        alt={
                                          item.productName ||
                                          `Product ${item.productId}`
                                        }
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          const placeholder =
                                            e.target.nextElementSibling;
                                          if (placeholder) {
                                            placeholder.style.display = "flex";
                                          }
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  <div
                                    className="po-vehicle-placeholder"
                                    style={{
                                      display: (() => {
                                        const modelCode =
                                          getModelCodeFromItem(item);
                                        const imagePath = getProductImagePath({
                                          modelCode: modelCode,
                                          ...item,
                                        });
                                        return imagePath ? "none" : "flex";
                                      })(),
                                    }}
                                  >
                                    <span className="po-vehicle-icon">🚗</span>
                                  </div>
                                </div>
                                <div className="po-detail-item-info">
                                  <h4 className="po-detail-item-name">
                                    {item.productName}
                                  </h4>
                                  <p className="po-detail-item-category">
                                    Mã sản phẩm: {item.productId}
                                  </p>
                                  <div className="po-detail-item-specs">
                                    <span>
                                      Mã mục đơn hàng: {item.poItemId}
                                    </span>
                                    <span>
                                      Đơn giá: {item.formattedUnitPrice}
                                    </span>
                                    <span>
                                      Tổng tiền: {item.formattedLineTotal}
                                    </span>
                                  </div>
                                </div>
                                <div className="po-detail-item-quantity">
                                  <span className="po-quantity-label">
                                    Số lượng:
                                  </span>
                                  <span className="po-quantity-value">
                                    {item.quantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions Card */}
                    {isManager &&
                      (selectedOrder.status === "Draft" ||
                        selectedOrder.status === "NHÁP" ||
                        selectedOrder.details?.status === "Draft") && (
                        <div className="po-detail-actions-card">
                          <div className="po-detail-actions-body">
                            <button
                              className="po-action-btn primary"
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
                                  <span className="po-spinner"></span>
                                  Đang gửi...
                                </>
                              ) : (
                                <>📤 Gửi đơn đặt hàng lên hãng</>
                              )}
                            </button>
                            <p className="po-action-note">
                              ℹ️ Sau khi gửi, đơn hàng sẽ được chuyển sang trạng
                              thái "Submit" và chờ hãng xét duyệt.
                            </p>
                          </div>
                        </div>
                      )}

                    {isManager &&
                      (selectedOrder.status === "InTransit" ||
                        selectedOrder.details?.status === "InTransit") && (
                        <div className="po-detail-actions-card">
                          <div className="po-detail-actions-body">
                            <button
                              className="po-action-btn success"
                              onClick={() =>
                                handleConfirmDelivery(selectedOrder)
                              }
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <span className="po-spinner"></span>
                                  Đang xử lý...
                                </>
                              ) : (
                                <>📦 Nhập kho</>
                              )}
                            </button>
                            <p className="po-action-note">
                              ℹ️ Sau khi nhập kho, các xe sẽ chuyển từ{" "}
                              <strong>InTransit</strong> sang{" "}
                              <strong>InStock</strong> và thuộc quyền sở hữu của
                              Dealer.
                            </p>
                          </div>
                        </div>
                      )}

                    {isManager &&
                      (selectedOrder.status === "Delivery" ||
                        selectedOrder.details?.status === "Delivery") && (
                        <div className="po-detail-actions-card">
                          <div className="po-detail-actions-body">
                            <button
                              className="po-action-btn success"
                              onClick={() =>
                                handleReceiveToInventory(selectedOrder)
                              }
                              disabled={
                                selectedOrder.details?.inventoryReceived
                              }
                            >
                              {selectedOrder.details?.inventoryReceived ? (
                                <>✅ Đã nhập kho</>
                              ) : (
                                <>📦 Nhập kho</>
                              )}
                            </button>
                            <p className="po-action-note">
                              ℹ️ Sau khi nhập kho, số lượng sản phẩm sẽ được cập
                              nhật vào kho của chi nhánh.
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POManagement;
