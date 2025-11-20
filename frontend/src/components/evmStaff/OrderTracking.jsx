import React, { useState, useEffect } from "react";
import "./OrderTracking.css";
import PageHeader from "./PageHeader";
import CustomDropdown from "../admin/CustomDropdown";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import dealerApiService from "../../services/dealerApi";
import { useToast } from "../../contexts/useToast";

const OrderTracking = ({ onBack }) => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "confirm", "intransit", or "delivery"
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // "all", "has", "none"
  const [orderSearch, setOrderSearch] = useState("");
  const [dealerNames, setDealerNames] = useState({}); // Map dealerId -> dealerName

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [orderSearch]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading purchase orders for EVM Staff...");

      const response = await purchaseOrderApiService.getAllPurchaseOrders();

      console.log("✅ Purchase orders response:", response);

      // Backend trả về PagedResult: { items: [...], page, pageSize, total }
      let data = [];
      if (response?.items && Array.isArray(response.items)) {
        data = response.items; // ✅ Lấy từ response.items
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }

      // Sort by createdAt descending (newest first)
      data.sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.CreatedAt || a.orderDate || a.OrderDate || 0
        );
        const dateB = new Date(
          b.createdAt || b.CreatedAt || b.orderDate || b.OrderDate || 0
        );
        return dateB - dateA; // Descending order
      });

      setOrders(data);

      // Load dealer names for all unique dealer IDs
      const uniqueDealerIds = [
        ...new Set(
          data.map((o) => o.DealerId || o.dealerId).filter((id) => id != null)
        ),
      ];

      // Fetch dealer names
      const dealerNameMap = {};
      await Promise.all(
        uniqueDealerIds.map(async (dealerId) => {
          try {
            const dealerData = await dealerApiService.getDealerById(dealerId);
            const dealer = dealerData?.data || dealerData;
            if (dealer?.name || dealer?.Name) {
              dealerNameMap[dealerId] = dealer.name || dealer.Name;
            }
          } catch (err) {
            console.error(`Error fetching dealer ${dealerId}:`, err);
            dealerNameMap[dealerId] = null; // Mark as failed to avoid retry
          }
        })
      );
      setDealerNames(dealerNameMap);

      // Tính tổng số cho mỗi tab
      const confirmCount = data.filter(
        (o) => (o.Status || o.status || "").toLowerCase() === "confirm"
      ).length;

      const intransitCount = data.filter(
        (o) => (o.Status || o.status || "").toLowerCase() === "intransit"
      ).length;

      const deliveryCount = data.filter((o) => {
        const status = (o.Status || o.status || "").toLowerCase();
        return status === "delivery" || status === "delivered";
      }).length;

      console.log(
        `📦 Loaded ${data.length} purchase orders (Total: ${
          response?.total || data.length
        })`
      );
      console.log(
        `📊 Counts - Confirm: ${confirmCount}, InTransit: ${intransitCount}, Delivery: ${deliveryCount}`
      );
    } catch (err) {
      console.error("❌ Error loading purchase orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const _handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.PoId || selectedOrder.poId;

      console.log(`✅ Confirming PO ID: ${poId}`);
      console.log("🔍 Backend sẽ kiểm tra:");
      console.log("   - Kho VIN manufacturer có đủ không");
      console.log("   - Credit available (công nợ vượt hạn mức chưa)");
      console.log("   - Phân bổ VIN từ InStock → Allocated");

      const response = await purchaseOrderApiService.confirmPurchaseOrder(poId);

      console.log("✅ Backend response:", response);

      toast.success("Thành công", {
        message:
          "Xác nhận đơn hàng thành công! Đã kiểm tra kho VIN, hạn mức công nợ và phân bổ VIN cho đơn hàng.",
      });

      // Đóng modal và reload danh sách
      setShowDetailModal(false);
      setSelectedOrder(null);
      await loadOrders();

      // Chuyển sang tab "Đã xác nhận"
      setActiveTab("confirm");
    } catch (err) {
      console.error("❌ Error confirming PO:", err);

      // Phân tích lỗi từ backend
      let errorMessage = "Vui lòng thử lại";

      if (err.response?.data) {
        const errorData = err.response.data;

        // Nếu backend trả về array errors
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join("\n");
        }
        // Nếu backend trả về string
        else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
        // Nếu có message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error("Lỗi", {
        message:
          "Không thể xác nhận đơn hàng! " +
          errorMessage +
          ". Các nguyên nhân có thể: Kho VIN không đủ, hạn mức công nợ vượt quá, trạng thái không hợp lệ, hoặc đơn hàng không có sản phẩm.",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleCreateInvoice = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.PoId || selectedOrder.poId;
      const dealerId = selectedOrder.DealerId || selectedOrder.dealerId;

      console.log(`📄 Creating Invoice B2B for PO ID: ${poId}`);

      const response = await purchaseOrderApiService.createInvoiceForPO(
        poId,
        dealerId
      );

      console.log("✅ Invoice created:", response);

      toast.success("Thành công", {
        message:
          "Tạo Invoice B2B thành công! Đã tạo hóa đơn cho đơn hàng và cập nhật công nợ dealer.",
      });

      // Reload để cập nhật hasInvoice
      await loadOrders();

      // Reload lại selectedOrder để có hasInvoice = true
      const updatedOrders = orders.find((o) => (o.PoId || o.poId) === poId);
      if (updatedOrders) {
        setSelectedOrder({
          ...selectedOrder,
          HasInvoice: true,
          hasInvoice: true,
        });
      }
    } catch (err) {
      console.error("❌ Error creating invoice:", err);

      let errorMessage = "Vui lòng thử lại";

      if (err.response?.data) {
        const errorData = err.response.data;

        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join("\n");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error("Lỗi", {
        message:
          "Không thể tạo invoice! " +
          errorMessage +
          ". Các nguyên nhân có thể: PO chưa được Confirm, VIN chưa được Allocated đủ, hoặc đã có Invoice rồi.",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleDelivery = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.PoId || selectedOrder.poId;

      console.log(`🚚 Issuing delivery for PO ID: ${poId}`);

      const response = await purchaseOrderApiService.issueDelivery(poId);

      console.log("✅ Delivery issued:", response);

      toast.success("Thành công", {
        message:
          "Vận chuyển đơn hàng thành công! VIN đã chuyển từ Allocated → InTransit. Đơn hàng đang được vận chuyển đến dealer.",
      });

      // Đóng modal và reload danh sách
      setShowDetailModal(false);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err) {
      console.error("❌ Error issuing delivery:", err);

      let errorMessage = "Vui lòng thử lại";

      if (err.response?.data) {
        const errorData = err.response.data;

        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join("\n");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error("Lỗi", {
        message:
          "Không thể vận chuyển đơn hàng! " +
          errorMessage +
          ". Các nguyên nhân có thể: Chưa có invoice B2B, không có VIN đang Allocated, hoặc trạng thái PO không phải Confirm.",
      });
    } finally {
      setConfirming(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Draft: "draft",
      Submit: "submit",
      Confirm: "confirm",
      InTransit: "intransit",
      Delivery: "delivery",
      Reject: "reject",
      Cancel: "cancel",
    };
    return statusMap[status] || "default";
  };

  const getStatusText = (status) => {
    const textMap = {
      Draft: "Nháp",
      Submit: "Đã gửi",
      Confirm: "Đã xác nhận",
      InTransit: "Đang vận chuyển",
      Delivery: "Đã giao hàng",
      Reject: "Từ chối",
      Cancel: "Đã hủy",
    };
    return textMap[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="evm-staff-order-tracking">
        <div className="evm-staff-page-header-wrapper">
          <PageHeader
            title="Theo dõi đơn hàng"
            subtitle="Theo dõi trạng thái và tiến độ xử lý đơn hàng"
            showBackButton={!!onBack}
            onBack={onBack}
          />
        </div>
        <div className="evm-staff-page-body">
          <div className="evm-staff-loading">
            <div className="evm-staff-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders based on active tab and invoice filter
  const filteredOrders = orders.filter((order) => {
    const status = (order.Status || order.status || "").toLowerCase();

    // Filter by status tab
    let statusMatch = false;
    if (activeTab === "all") {
      // Show all orders regardless of status
      statusMatch = true;
    } else if (activeTab === "confirm") {
      statusMatch = status === "confirm";
    } else if (activeTab === "intransit") {
      statusMatch = status === "intransit";
    } else {
      // delivery tab
      statusMatch = status === "delivery" || status === "delivered";
    }

    if (!statusMatch) return false;

    // Filter by invoice status
    const hasInvoice = order.hasInvoice || order.HasInvoice || false;
    if (invoiceFilter === "has") {
      return hasInvoice;
    } else if (invoiceFilter === "none") {
      return !hasInvoice;
    }

    // "all" - no invoice filter
    const term = orderSearch.trim().toLowerCase();
    if (!term) return true;
    const poStr = String(order.PoId || order.poId || "");
    const dealerId = order.DealerId || order.dealerId;
    const dealerName = dealerId ? dealerNames[dealerId] : "";
    return (
      poStr.toLowerCase().includes(term) ||
      (dealerName || "").toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  const handleInvoiceFilterChange = (filter) => {
    setInvoiceFilter(filter);
    setCurrentPage(1);
  };

  // Dropdown options
  const statusFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "confirm", label: "Đã xác nhận" },
    { value: "intransit", label: "Đang vận chuyển" },
    { value: "delivery", label: "Đã giao hàng" },
  ];

  const invoiceFilterOptions = [
    { value: "all", label: "Tất cả hóa đơn" },
    { value: "has", label: "Đã có hóa đơn" },
    { value: "none", label: "Chưa có hóa đơn" },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="evm-staff-order-tracking">
      {/* Header Section */}
      <div className="evm-staff-page-header-wrapper">
        <PageHeader
          title="Theo dõi đơn hàng"
          subtitle="Theo dõi trạng thái và tiến độ xử lý đơn hàng"
          showBackButton={!!onBack}
          onBack={onBack}
        />
      </div>

      {/* Body Section */}
      <div className="evm-staff-page-body">
        {/* Search and Filter Bar - Outside of list container */}
        <div className="evm-staff-page-actions">
          <div className="evm-staff-search-filter-group">
            <div className="evm-staff-search-container-inline">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="evm-staff-search-input-inline"
              />
            </div>
            <div className="evm-staff-filter-container-inline">
              <CustomDropdown
                value={activeTab}
                onChange={handleTabChange}
                options={statusFilterOptions}
                placeholder="Chọn trạng thái"
                compact={true}
                minWidth="100%"
              />
            </div>
            <div className="evm-staff-filter-container-inline">
              <CustomDropdown
                value={invoiceFilter}
                onChange={handleInvoiceFilterChange}
                options={invoiceFilterOptions}
                placeholder="Chọn loại hóa đơn"
                compact={true}
                minWidth="100%"
              />
            </div>
          </div>
        </div>

        {/* List Container - Dealer Manager Style */}
        <div className="evm-staff-list-container">
          <div className="evm-staff-list-content">
            <div className="evm-staff-table-container">
              <div className="evm-staff-table-header">
                <div className="evm-staff-table-cell" data-column="1">
                  Mã đơn
                </div>
                <div className="evm-staff-table-cell" data-column="2">
                  Đại lý
                </div>
                <div className="evm-staff-table-cell" data-column="3">
                  Ngày tạo
                </div>
                <div className="evm-staff-table-cell" data-column="4">
                  Số tiền
                </div>
                <div className="evm-staff-table-cell" data-column="5">
                  Trạng thái
                </div>
                <div className="evm-staff-table-cell" data-column="6">
                  Thao tác
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="evm-staff-empty-state">
                  <div className="evm-staff-empty-icon">📋</div>
                  <h3 className="evm-staff-empty-title">
                    Không tìm thấy đơn hàng
                  </h3>
                  <p className="evm-staff-empty-description">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="evm-staff-table-rows">
                    {paginatedOrders.map((order) => (
                      <div
                        key={order.PoId || order.poId}
                        className="evm-staff-table-row"
                      >
                        <div className="evm-staff-table-cell" data-column="1">
                          <span className="evm-staff-po-id">
                            PO-{order.PoId || order.poId}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="2">
                          <span className="evm-staff-dealer-name">
                            {(() => {
                              const dealerId = order.DealerId || order.dealerId;
                              if (!dealerId) return "N/A";
                              const name = dealerNames[dealerId];
                              return name || `Dealer ${dealerId}`;
                            })()}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="3">
                          <span className="evm-staff-date">
                            {formatDate(order.CreateAt || order.createAt)}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="4">
                          <span className="evm-staff-amount">
                            {formatCurrency(
                              order.TotalAmount ||
                                order.totalAmount ||
                                order.Total ||
                                order.total
                            )}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="5">
                          <span
                            className={`evm-staff-status evm-staff-status-${
                              order.Status || order.status
                            } ${
                              order.hasInvoice || order.HasInvoice
                                ? "has-invoice"
                                : ""
                            }`}
                          >
                            {getStatusText(order.Status || order.status)}
                            {(order.hasInvoice || order.HasInvoice) && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="evm-staff-invoice-icon"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            )}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="6">
                          <button
                            className="evm-staff-action-btn evm-staff-view"
                            onClick={() => handleViewDetails(order)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="evm-staff-pagination-container">
                      <div className="evm-staff-pagination-info">
                        Hiển thị {startIndex + 1} -{" "}
                        {Math.min(endIndex, filteredOrders.length)} trong tổng
                        số {filteredOrders.length} đơn hàng
                      </div>
                      <div className="evm-staff-pagination-controls">
                        <button
                          className="evm-staff-pagination-btn"
                          onClick={handlePreviousPage}
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

                        <div className="evm-staff-pagination-numbers">
                          {(() => {
                            const pages = [];
                            pages.push(1);
                            if (totalPages > 1) {
                              if (currentPage === 1) {
                                if (totalPages > 1) pages.push(2);
                              } else if (currentPage === totalPages) {
                                if (totalPages > 2) pages.push(totalPages - 1);
                              } else {
                                pages.push(currentPage);
                              }
                            }
                            if (totalPages > 1) {
                              if (!pages.includes(totalPages)) {
                                pages.push(totalPages);
                              }
                            }
                            return pages.map((page) => (
                              <button
                                key={page}
                                className={`evm-staff-pagination-number ${
                                  page === currentPage ? "active" : ""
                                }`}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            ));
                          })()}
                        </div>

                        <button
                          className="evm-staff-pagination-btn"
                          onClick={handleNextPage}
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
          </div>
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="order-detail-modal-overlay" onClick={handleCloseModal}>
          <div
            className="order-detail-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="order-detail-modal-header">
              <div className="order-detail-modal-header-left">
                <div className="order-detail-modal-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="order-detail-modal-title">
                    Chi tiết đơn hàng
                  </h2>
                  <p className="order-detail-modal-subtitle">
                    PO-{selectedOrder.PoId || selectedOrder.poId}
                  </p>
                </div>
              </div>
              <div className="order-detail-modal-header-actions">
                <span
                  className={`order-status-badge ${getStatusBadgeClass(
                    selectedOrder.Status || selectedOrder.status
                  )}`}
                >
                  {getStatusText(selectedOrder.Status || selectedOrder.status)}
                </span>
                <button
                  className="order-detail-close-btn"
                  onClick={handleCloseModal}
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="order-detail-modal-body">
              <div className="order-details">
                {/* Left Column - Order Info */}
                <div className="order-info-column">
                  {/* Order Information */}
                  <div className="order-detail-section">
                    <div className="order-detail-card-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                      </svg>
                      <h4>Thông tin đơn hàng</h4>
                    </div>
                    <div className="order-detail-grid">
                      <div className="order-detail-item">
                        <span className="order-detail-label">Mã đơn hàng</span>
                        <span className="order-detail-value">
                          PO-{selectedOrder.PoId || selectedOrder.poId}
                        </span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Đại lý</span>
                        <span className="order-detail-value">
                          {(() => {
                            const dealerId =
                              selectedOrder.DealerId || selectedOrder.dealerId;
                            if (!dealerId) return "N/A";
                            const name = dealerNames[dealerId];
                            return name || `Dealer ${dealerId}`;
                          })()}
                        </span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Ngày tạo</span>
                        <span className="order-detail-value">
                          {formatDate(
                            selectedOrder.CreateAt || selectedOrder.createAt
                          )}
                        </span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Ngày dự kiến</span>
                        <span className="order-detail-value">
                          {selectedOrder.ExpectedDate ||
                          selectedOrder.expectedDate
                            ? formatDate(
                                selectedOrder.ExpectedDate ||
                                  selectedOrder.expectedDate
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="order-detail-item full-width">
                        <span className="order-detail-label">Số tiền</span>
                        <span className="order-detail-value order-amount">
                          {formatCurrency(
                            selectedOrder.TotalAmount ||
                              selectedOrder.totalAmount ||
                              0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions */}
                <div className="order-actions-column">
                  {/* Invoice Section - Show for Confirm status */}
                  {(selectedOrder.Status === "Confirm" ||
                    selectedOrder.status === "Confirm") &&
                    !(selectedOrder.HasInvoice || selectedOrder.hasInvoice) && (
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
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          <h4>Hóa đơn</h4>
                        </div>
                        <p className="order-action-description">
                          Tạo hóa đơn B2B cho đơn hàng này
                        </p>
                        <button
                          className="order-action-btn primary"
                          onClick={handleCreateInvoice}
                          disabled={confirming}
                        >
                          {confirming ? (
                            <>
                              <div className="order-loading-spinner small"></div>
                              Đang tạo Invoice...
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
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <path d="M14 2v6h6"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                                <path d="M10 9H8"></path>
                              </svg>
                              Tạo Invoice B2B
                            </>
                          )}
                        </button>
                      </div>
                    )}

                  {/* Delivery Section - Show when invoice exists */}
                  {(selectedOrder.Status === "Confirm" ||
                    selectedOrder.status === "Confirm") &&
                    (selectedOrder.HasInvoice || selectedOrder.hasInvoice) && (
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
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          <h4>Vận chuyển</h4>
                        </div>
                        <p className="order-action-description">
                          Đơn hàng đã có hóa đơn. Tiến hành vận chuyển đơn hàng.
                        </p>
                        <button
                          className="order-action-btn primary"
                          onClick={handleDelivery}
                          disabled={confirming}
                        >
                          {confirming ? (
                            <>
                              <div className="order-loading-spinner small"></div>
                              Đang vận chuyển...
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
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                              </svg>
                              Vận chuyển đơn hàng
                            </>
                          )}
                        </button>
                      </div>
                    )}

                  {/* Delivery Completed - For InTransit or Delivery status */}
                  {(selectedOrder.Status === "InTransit" ||
                    selectedOrder.Status === "Delivery" ||
                    selectedOrder.status === "InTransit" ||
                    selectedOrder.status === "Delivery") && (
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22,4 12,14.01 9,11.01" />
                        </svg>
                        <h4>Trạng thái đơn hàng</h4>
                      </div>
                      <p className="order-action-description">
                        {selectedOrder.Status === "Delivery" ||
                        selectedOrder.status === "Delivery"
                          ? "Đơn hàng đã được giao thành công cho khách hàng."
                          : "Đơn hàng đang được vận chuyển."}
                      </p>
                      <div className="order-delivery-completed">
                        <div className="order-success-icon">
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
                        <h5>
                          {selectedOrder.Status === "Delivery" ||
                          selectedOrder.status === "Delivery"
                            ? "Đã giao hàng thành công!"
                            : "Đang vận chuyển"}
                        </h5>
                        <p>
                          {selectedOrder.Status === "Delivery" ||
                          selectedOrder.status === "Delivery"
                            ? "Đơn hàng đã được giao thành công"
                            : "Đơn hàng đang trên đường vận chuyển"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Product Details Section */}
                  {(selectedOrder.Items || selectedOrder.items || []).length >
                    0 && (
                    <div className="order-action-card">
                      <div className="order-action-header">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                        </svg>
                        <h4>Chi tiết sản phẩm</h4>
                      </div>
                      <div className="order-items-table">
                        <div className="order-items-header">
                          <div className="order-item-cell">Tên sản phẩm</div>
                          <div className="order-item-cell">Đơn giá</div>
                          <div className="order-item-cell">Số lượng</div>
                          <div className="order-item-cell">Thành tiền</div>
                        </div>
                        {(selectedOrder.Items || selectedOrder.items || []).map(
                          (item, index) => (
                            <div key={index} className="order-item-row">
                              <div className="order-item-cell">
                                {item.ProductName ||
                                  item.productName ||
                                  `Product ${item.ProductId || item.productId}`}
                              </div>
                              <div className="order-item-cell">
                                {formatCurrency(
                                  item.UnitPrice || item.unitPrice || 0
                                )}
                              </div>
                              <div className="order-item-cell">
                                {item.Quantity || item.quantity || 0}
                              </div>
                              <div className="order-item-cell">
                                {formatCurrency(
                                  item.LineTotal || item.lineTotal || 0
                                )}
                              </div>
                            </div>
                          )
                        )}
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
  );
};

export default OrderTracking;
