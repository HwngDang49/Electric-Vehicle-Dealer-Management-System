import React, { useState, useEffect, useRef } from "react";
import "./BackorderedManagement.css";
import { useToast } from "../../contexts/useToast";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import { formatPrice, formatDate, mapBackendPoToFrontend } from "../../services/poDataMapper";

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
  const itemsPerPage = 5;

  // Status Management for PO
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
    Backordered: {
      text: "Backordered",
      className: "backordered",
      color: "#dc3545",
    },
  };

  const getStatusInfo = (status = "Draft") => {
    return statusConfig[status] || statusConfig.Draft;
  };

  const renderStatusBadge = (status = "Draft") => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
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
          .filter(order => order.status === "Backordered");

        setBackorderedOrders(mappedOrders);

        if (!hasShownToast.current && mappedOrders.length > 0) {
          hasShownToast.current = true;
          toast.info(`Đã tải ${mappedOrders.length} đơn đặt hàng backordered`, {
            title: "Tải dữ liệu thành công",
            duration: 3000,
          });
        }
      } catch (err) {
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

  const handleViewDetails = async (order) => {
    try {
      setLoading(true);
      
      // Extract PO ID from the order ID (remove "PO-" prefix)
      const poId = order.id.replace("PO-", "");
      
      // Fetch PO details
      const response = await purchaseOrderApiService.getPurchaseOrderById(poId);
      
      setSelectedOrder({
        ...order,
        ...response.data,
      });
      setShowDetailModal(true);
    } catch (err) {
      toast.error("Không thể tải chi tiết đơn đặt hàng", {
        title: "Lỗi",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleCreatePO = () => {
    // TODO: Navigate to create PO page or show modal
    console.log("Navigate to create PO for this backordered order");
  };

  return (
    <div className="backordered-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý Backordered</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các đơn hàng backordered của khách hàng
        </p>
      </div>

      <div className="search-filter-section">
        <div className="search-filter-left">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
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
               <option value="Backordered">Backordered</option>
            </select>
          </div>
        </div>
      </div>

      <div className="backordered-list-container">
        <div className="backordered-list-header">
          <h2 className="list-title">
            Danh sách Backordered ({filteredOrders.length})
          </h2>
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
                          {renderStatusBadge(order.status)}
                        </div>
                        <div className="table-cell actions" data-column="5">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewDetails(order)}
                          >
                            Đơn đặt hàng
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
                     <span>{selectedOrder.orderCode || `ORD-${selectedOrder.orderId}`}</span>
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
                     <span>{renderStatusBadge(selectedOrder.status)}</span>
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
