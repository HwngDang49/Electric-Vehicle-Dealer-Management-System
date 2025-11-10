import React, { useState, useEffect, useRef } from "react";
import "./OrderManagement.css";
import PageHeader from "./PageHeader";
import OrderDetailModal from "./OrderDetailModal";
import VinSelectionModal from "./VinSelectionModal";
import { formatDate } from "../../utils/dateUtils";
import { fetchOrders, rejectOrder } from "../../services/orderService";
import invoiceApiService from "../../services/invoiceApi";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import { useToast } from "../../contexts/useToast";

const OrderManagement = ({ onCreateDeliveryOrder, onBack }) => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVinModalOpen, setIsVinModalOpen] = useState(false);

  // Ref to store previous orders for comparison
  const previousOrdersRef = useRef([]);
  const isInitialLoadRef = useRef(true);

  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // "all", "has", "none"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 0,
  });

  // Helper function to detect and notify new Submit POs
  const detectNewSubmitOrders = (newOrders) => {
    if (isInitialLoadRef.current || previousOrdersRef.current.length === 0) {
      return;
    }

    const previousOrderIds = new Set(
      previousOrdersRef.current.map((order) => order.id)
    );

    // Find new orders with Submit status
    const newSubmitOrders = newOrders.filter(
      (order) =>
        !previousOrderIds.has(order.id) &&
        (order.status === "Submit" || order.status === "SUBMIT")
    );

    // Show toast for each new Submit PO
    newSubmitOrders.forEach((order) => {
      toast.success("Đơn hàng mới", {
        message: `Đơn hàng ${order.id}${
          order.dealerName ? ` (${order.dealerName})` : ""
        } đã được gửi và cần xử lý`,
        duration: 5000,
      });
    });
  };

  // Load orders on component mount and page change
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const result = await fetchOrders(currentPage, 5, statusFilter);
        const newOrders = result.orders || [];

        // Detect new PO with Submit status
        detectNewSubmitOrders(newOrders);

        // Update orders and previous orders ref
        setOrders(newOrders);
        previousOrdersRef.current = newOrders;
        isInitialLoadRef.current = false;

        setPagination(
          result.pagination || {
            totalCount: 0,
            pageNumber: 1,
            pageSize: 5,
            totalPages: 0,
          }
        );
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [currentPage, statusFilter, toast]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleInvoiceFilterChange = (filter) => {
    setInvoiceFilter(filter);
    setCurrentPage(1);
  };

  // AUTO CONFIRM - FIFO allocation
  const handleAutoConfirm = async (order) => {
    try {
      console.log("🤖 Auto confirming order (FIFO):", order.id);

      // Extract PO ID from "PO-30" format
      const poId = order.id.toString().replace("PO-", "");

      await purchaseOrderApiService.confirmPurchaseOrder(poId);

      // Reload orders
      const result = await fetchOrders(currentPage, 5, statusFilter);
      const newOrders = result.orders || [];

      // Detect new PO with Submit status
      detectNewSubmitOrders(newOrders);

      setOrders(newOrders);
      previousOrdersRef.current = newOrders;

      setPagination(
        result.pagination || {
          totalCount: 0,
          pageNumber: 1,
          pageSize: 5,
          totalPages: 0,
        }
      );

      handleCloseModal();
      toast.success("Thành công", {
        message: "Xác nhận đơn hàng thành công với VIN tự động (FIFO)!",
      });
    } catch (error) {
      console.error("❌ Error auto confirming order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi xác nhận đơn hàng: " + errorMsg,
      });
    }
  };

  // MANUAL CONFIRM - User selects VINs
  const handleManualConfirm = (order) => {
    console.log("✋ Opening manual VIN selection for:", order.id);
    setSelectedOrder(order);
    setIsModalOpen(false); // Close detail modal
    setIsVinModalOpen(true); // Open VIN selection modal
  };

  const handleManualConfirmSubmit = async (vinAllocations) => {
    try {
      console.log("🔧 Manual confirming order with VINs:", vinAllocations);

      // Extract PO ID
      const poId = selectedOrder.id.toString().replace("PO-", "");

      await purchaseOrderApiService.confirmPurchaseOrderManual({
        poId: parseInt(poId),
        vinAllocations: vinAllocations,
      });

      // Reload orders
      const result = await fetchOrders(currentPage, 5, statusFilter);
      const newOrders = result.orders || [];

      // Detect new PO with Submit status
      detectNewSubmitOrders(newOrders);

      setOrders(newOrders);
      previousOrdersRef.current = newOrders;

      setPagination(
        result.pagination || {
          totalCount: 0,
          pageNumber: 1,
          pageSize: 5,
          totalPages: 0,
        }
      );

      setIsVinModalOpen(false);
      setSelectedOrder(null);
      toast.success("Thành công", {
        message: "Xác nhận đơn hàng thành công với VIN đã chọn!",
      });
    } catch (error) {
      console.error("❌ Error manual confirming order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi xác nhận đơn hàng: " + errorMsg,
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleRejectOrder = async (orderId) => {
    try {
      await rejectOrder(orderId);

      // Reload orders from backend to get updated data
      const result = await fetchOrders(currentPage, 5, statusFilter);
      const newOrders = result.orders || [];

      // Detect new PO with Submit status
      detectNewSubmitOrders(newOrders);

      setOrders(newOrders);
      previousOrdersRef.current = newOrders;
      handleCloseModal();
    } catch {
      // Silent fail
    }
  };

  const handleCreateInvoice = async (order) => {
    try {
      console.log("📄 Creating invoice for order:", order);

      // Convert order.id from "PO-30" to 30
      const poId = order.id.toString().replace("PO-", "");

      const invoiceData = {
        poId: poId,
        dealerId: order.dealerId,
        branchId: order.branchId,
        amount: order.amount,
      };

      console.log("📤 Sending invoice data:", invoiceData);
      await invoiceApiService.createInvoice(invoiceData);

      // Reload orders from backend to get updated data
      const result = await fetchOrders(currentPage, 5, statusFilter);
      const newOrders = result.orders || [];

      // Detect new PO with Submit status
      detectNewSubmitOrders(newOrders);

      setOrders(newOrders);
      previousOrdersRef.current = newOrders;

      setPagination(
        result.pagination || {
          totalCount: 0,
          pageNumber: 1,
          pageSize: 5,
          totalPages: 0,
        }
      );

      handleCloseModal();
      toast.success("Thành công", {
        message: "Tạo Invoice B2B thành công!",
      });
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi tạo Invoice: " + errorMsg,
      });
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPOId = (id) => {
    // If already in PO-XX format, return as is
    if (typeof id === "string" && id.startsWith("PO-")) {
      return id;
    }
    // Otherwise, format as PO-XX
    return `PO-${id}`;
  };

  // Get order status text in Vietnamese
  const getOrderStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "SUBMIT":
        return "Đã gửi";
      case "CONFIRM":
        return "Xác nhận";
      case "INTRANSIT":
        return "Đang vận chuyển";
      case "DELIVERY":
        return "Đã giao";
      case "DRAFT":
        return "Nháp";
      case "REJECT":
        return "Từ chối";
      case "CANCEL":
        return "Hủy";
      default:
        return status || "N/A";
    }
  };

  // Filter orders based on search term, status and invoice
  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const poId = formatPOId(order.id).toLowerCase();
      const dealerName = (
        order.dealerName ||
        order.dealerId ||
        ""
      ).toLowerCase();
      if (!poId.includes(searchLower) && !dealerName.includes(searchLower)) {
        return false;
      }
    }

    // Filter by invoice status
    const hasInvoice = order.hasInvoice || false;
    if (invoiceFilter === "has") {
      if (!hasInvoice) return false;
    } else if (invoiceFilter === "none") {
      if (hasInvoice) return false;
    }
    // "all" - no invoice filter

    return true;
  });

  if (loading) {
    return (
      <div className="evm-staff-order-management">
        <div className="evm-staff-loading">
          <div className="evm-staff-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evm-staff-order-management">
      {/* Header Section */}
      <div className="evm-staff-page-header-wrapper">
        <PageHeader
          title="Quản lý đơn hàng"
          subtitle="Xử lý và quản lý các đơn hàng từ đại lý"
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
                placeholder="Tìm kiếm đơn đặt hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="evm-staff-search-input-inline"
              />
            </div>
            <div className="evm-staff-filter-container-inline">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="evm-staff-filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="SUBMIT">Đã gửi</option>
                <option value="CONFIRM">Xác nhận</option>
                <option value="INTRANSIT">Đang vận chuyển</option>
                <option value="DELIVERY">Đã giao</option>
              </select>
            </div>
            <div className="evm-staff-filter-container-inline">
              <select
                value={invoiceFilter}
                onChange={(e) => handleInvoiceFilterChange(e.target.value)}
                className="evm-staff-filter-select"
              >
                <option value="all">Tất cả hóa đơn</option>
                <option value="has">Đã có hóa đơn</option>
                <option value="none">Chưa có hóa đơn</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Container - Dealer Manager Style */}
        <div className="evm-staff-list-container">
          <div className="evm-staff-list-content">
            <div className="evm-staff-table-container">
              <div className="evm-staff-table-header">
                <div className="evm-staff-table-cell" data-column="1">
                  PO ID
                </div>
                <div className="evm-staff-table-cell" data-column="2">
                  Đại lý
                </div>
                <div className="evm-staff-table-cell" data-column="3">
                  Số tiền
                </div>
                <div className="evm-staff-table-cell" data-column="4">
                  Trạng thái
                </div>
                <div className="evm-staff-table-cell" data-column="5">
                  Ngày
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
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="evm-staff-table-row">
                        <div className="evm-staff-table-cell" data-column="1">
                          <span className="evm-staff-po-id">
                            {formatPOId(order.id)}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="2">
                          <span className="evm-staff-dealer-name">
                            {order.dealerName || order.dealerId}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="3">
                          <span className="evm-staff-amount">
                            {formatCurrency(order.amount)}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="4">
                          <span
                            className={`evm-staff-status evm-staff-status-${
                              order.status
                            } ${order.hasInvoice ? "has-invoice" : ""}`}
                          >
                            {getOrderStatusText(
                              order.status || order.statusText
                            )}
                            {order.hasInvoice && (
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
                        <div className="evm-staff-table-cell" data-column="5">
                          <span className="evm-staff-date">
                            {formatDate(order.date)}
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
                  {pagination.totalPages > 1 && (
                    <div className="evm-staff-pagination-container">
                      <div className="evm-staff-pagination-info">
                        Hiển thị {(currentPage - 1) * pagination.pageSize + 1} -{" "}
                        {Math.min(
                          currentPage * pagination.pageSize,
                          pagination.totalCount
                        )}{" "}
                        trong tổng số {pagination.totalCount} đơn hàng
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
                            const totalPages = pagination.totalPages;
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
                            return pages.map((page) => {
                              return (
                                <button
                                  key={page}
                                  className={`evm-staff-pagination-number ${
                                    page === currentPage ? "active" : ""
                                  }`}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              );
                            });
                          })()}
                        </div>

                        <button
                          className="evm-staff-pagination-btn"
                          onClick={handleNextPage}
                          disabled={currentPage === pagination.totalPages}
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAutoConfirm={handleAutoConfirm}
        onManualConfirm={handleManualConfirm}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* VIN Selection Modal */}
      <VinSelectionModal
        isOpen={isVinModalOpen}
        onClose={() => {
          setIsVinModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleManualConfirmSubmit}
      />
    </div>
  );
};

export default OrderManagement;
