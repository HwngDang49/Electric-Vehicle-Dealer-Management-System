import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import CreatePOForm from "./CreatePOForm";
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

const POManagement = ({
  orders,
  onUpdateOrderStatus,
  initialOrderData,
  onInitialDataUsed,
}) => {
  const toast = useToast();
  const hasShownToast = useRef(false);
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

  const translateStatus = useCallback((status) => {
    const statusTranslation = {
      Draft: "Nháp",
      Submit: "Đã gửi",
      Confirm: "Đã xác nhận",
      InTransit: "Đang vận chuyển",
      Cancel: "Đã hủy",
      Delivery: "Đã giao hàng",
      Approved: "Đã duyệt",
      Confirmed: "Đã xác nhận",
      Cancelled: "Đã hủy",
      Submitted: "Đã gửi",
    };
    return statusTranslation[status] || status;
  }, []);

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
  };

  const getStatusInfo = useCallback((status = "Draft") => {
    return statusConfig[status] || statusConfig.Draft;
  }, []);

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
            title: "Tải dữ liệu thành công",
            duration: 3000,
          });
        }
      } catch {
        const errorMsg =
          "Không thể tải danh sách đơn đặt hàng. Vui lòng thử lại.";
        setError(errorMsg);

        toast.error(errorMsg, {
          title: "Lỗi tải dữ liệu",
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

  // Handle initial order data from Backordered page
  useEffect(() => {
    if (initialOrderData && !showCreateForm) {
      // Set up prefill items matching CreatePOForm expected format
      setPrefillItems([
        {
          name: initialOrderData.productName,
          quantity: initialOrderData.quantity,
          floorPrice: initialOrderData.amount,
          effectivePrice: initialOrderData.amount,
          // Additional fields that might be needed
          productName: initialOrderData.productName,
        },
      ]);

      // Open create form
      setShowCreateForm(true);

      // Notify parent that initial data has been used
      if (onInitialDataUsed) {
        onInitialDataUsed();
      }
    }
  }, [initialOrderData, showCreateForm, onInitialDataUsed]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
        title: "Lỗi tải chi tiết",
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
        title: "Gửi đơn hàng thành công",
        duration: 5000,
      });

      setSuccessMessage(`Đơn đặt hàng PO-${poId} đã được gửi thành công!`);
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      toast.error(`Lỗi khi gửi đơn hàng: ${err.message}`, {
        title: "Lỗi gửi đơn hàng",
        duration: 6000,
      });

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
      setSuccessMessage(`Đơn hàng ${order.id} đã được chuyển sang thanh toán!`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
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
      setSuccessMessage(`Đơn hàng ${order.id} đã được nhập kho thành công!`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
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

      setSuccessMessage(
        `Đơn hàng ${order.id} đã được nhập kho thành công! Xe đã chuyển sang InStock và thuộc quyền Dealer.`
      );
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
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

      setSuccessMessage(`Lỗi khi nhập kho: ${errorMessage}`);
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
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
            // Filter out Backordered orders - they should only appear in BackorderedManagement
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
        setSuccessMessage(`Đơn đặt hàng ${poId} đã được tạo thành công!`);
        setShowSuccessNotification(true);
      } else {
        throw new Error(response.message || "Failed to create purchase order");
      }
    } catch (error) {
      setSuccessMessage(`Lỗi tạo đơn hàng: ${error.message}`);
      setShowSuccessNotification(true);
    }

    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000);
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
      <div className="page-header">
        <h1 className="page-title">Quản lý đơn đặt hàng</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các đơn đặt hàng từ hãng
        </p>
      </div>

      <div className="page-actions">
        <div className="search-container-inline">
          <input
            type="text"
            placeholder="Tìm kiếm đơn đặt hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="add-po-btn" onClick={handleCreatePO}>
          + Tạo đơn đặt hàng mới
        </button>
      </div>

      <div className="po-list-container">
        <div className="po-list-header">
          <h2 className="list-title">
            Danh sách đơn đặt hàng ({filteredOrders.length})
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
            </select>
          </div>
        </div>

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
                            {getStatusText(order.status)}
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
                    <label>Tên đại lý:</label>
                    <span>
                      {dealerName ||
                        selectedOrder.details?.dealerInfo?.dealerName ||
                        selectedOrder.details?.dealerId ||
                        "N/A"}
                    </span>
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
                      {getStatusText(
                        selectedOrder.details?.status || selectedOrder.status
                      )}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Submitted By:</label>
                    <span>
                      {submittedByUserName ||
                        selectedOrder.details?.submittedByUserId ||
                        "N/A"}
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
                          {(() => {
                            const modelCode = getModelCodeFromItem(item);
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
                            className="vehicle-placeholder"
                            style={{
                              display: (() => {
                                const modelCode = getModelCodeFromItem(item);
                                const imagePath = getProductImagePath({
                                  modelCode: modelCode,
                                  ...item,
                                });
                                return imagePath ? "none" : "flex";
                              })(),
                            }}
                          >
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

              <div className="po-detail-section">
                <h3 className="po-section-title">Tổng kết đơn hàng</h3>
                <div className="po-detail-info-grid">
                  <div className="po-detail-item-new">
                    <span className="po-detail-label">PO ID</span>
                    <span className="po-detail-value">
                      {selectedOrder.details?.poId || selectedOrder.id}
                    </span>
                  </div>
                  <div className="po-detail-item-new">
                    <span className="po-detail-label">Trạng thái</span>
                    <span className="po-detail-value">
                      {getStatusText(
                        selectedOrder.details?.status || selectedOrder.status
                      )}
                    </span>
                  </div>
                  <div className="po-detail-item-new">
                    <span className="po-detail-label">Số lượng sản phẩm</span>
                    <span className="po-detail-value">
                      {selectedOrder.details?.items?.reduce(
                        (total, item) => total + (item.quantity || 0),
                        0
                      ) ||
                        selectedOrder.details?.totalQuantity ||
                        selectedOrder.quantity}
                    </span>
                  </div>
                  <div className="po-detail-item-new highlight-green">
                    <span className="po-detail-label">Tổng tiền</span>
                    <span className="po-detail-value">
                      {selectedOrder.details?.formattedTotalAmount ||
                        formatPrice(selectedOrder.totalAmount || 0)}
                    </span>
                  </div>
                  {selectedOrder.details?.submittedAt && (
                    <div className="po-detail-item-new">
                      <span className="po-detail-label">Ngày gửi</span>
                      <span className="po-detail-value">
                        {formatDate(selectedOrder.details.submittedAt)}
                      </span>
                    </div>
                  )}
                  {(dealerName || selectedOrder.details?.dealerId) && (
                    <div className="po-detail-item-new">
                      <span className="po-detail-label">Tên đại lý</span>
                      <span className="po-detail-value">
                        {dealerName ||
                          selectedOrder.details?.dealerInfo?.dealerName ||
                          selectedOrder.details?.dealerId ||
                          "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

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
