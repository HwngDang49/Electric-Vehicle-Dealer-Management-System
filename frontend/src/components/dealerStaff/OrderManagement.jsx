import React, { useState } from "react";
import "./OrderManagement.css";
import OrderDetailView from "./OrderDetailView";

const OrderManagement = ({
  onNavigateToVinAllocation,
  orders = [],
  onContractCreated,
  onPaymentSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // Format currency function
  const formatCurrency = (amount) => {
    console.log(
      "OrderManagement - formatCurrency input:",
      amount,
      "type:",
      typeof amount
    );
    if (!amount || amount === 0) {
      console.log("OrderManagement - formatCurrency result: 0 ₫");
      return "0 ₫";
    }
    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
    console.log("OrderManagement - formatCurrency result:", formatted);
    return formatted;
  };

  // Debug: Log orders data
  console.log("OrderManagement - All orders:", orders);
  console.log("OrderManagement - Orders count:", orders.length);
  orders.forEach((order, index) => {
    console.log(`OrderManagement - Order ${index}:`, {
      id: order.id,
      amount: order.amount,
      vehicle: order.vehicle,
      quotation: order.quotation,
    });
  });

  // Filter orders based on search and active filter
  let filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch =
      searchQuery.trim() === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicle?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesFilter =
      activeFilter === "Tất cả" || order.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleViewDetails = (order) => {
    console.log("handleViewDetails called with order:", order);
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  // If an order is selected, show detail view
  if (selectedOrder) {
    // Sync selectedOrder with updated orders data
    const updatedSelectedOrder =
      orders.find((order) => order.id === selectedOrder.id) || selectedOrder;

    console.log("Rendering OrderDetailView with selectedOrder:", selectedOrder);
    console.log(
      "OrderManagement - updatedSelectedOrder:",
      updatedSelectedOrder
    );
    console.log(
      "OrderManagement - updatedSelectedOrder.hasContract:",
      updatedSelectedOrder?.hasContract
    );
    console.log(
      "OrderManagement - updatedSelectedOrder.contractData:",
      updatedSelectedOrder?.contractData
    );

    return (
      <OrderDetailView
        order={updatedSelectedOrder}
        onBack={handleBackToList}
        onNavigateToVinAllocation={onNavigateToVinAllocation}
        onContractCreated={onContractCreated}
        onPaymentSuccess={onPaymentSuccess}
      />
    );
  }

  return (
    <div className="order-management">
      <div className="order-content">
        {/* Header Section */}
        <div className="order-header">
          <div className="header-content">
            <h1>Quản lý đơn hàng</h1>
            <p>Theo dõi và quản lý tất cả đơn hàng của khách hàng</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="list-header">
          <h2>Danh sách đơn hàng</h2>
          <div className="list-actions">
            <div className="search-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, số điện thoại hoặc mã đơn hàng..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${
                  activeFilter === "Tất cả" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Tất cả")}
              >
                Tất cả
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "Draft" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Draft")}
              >
                Draft
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "Pending" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Pending")}
              >
                Pending
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "Confirmed" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Confirmed")}
              >
                Confirmed
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="order-table">
          <div className="table-header">
            <div className="col-order-id">Order ID</div>
            <div className="col-customer">Customer</div>
            <div className="col-vehicle">Vehicle</div>
            <div className="col-amount">Amount</div>
            <div className="col-status">Status</div>
            <div className="col-date">Date</div>
            <div className="col-actions">Action</div>
          </div>
          <div className="table-body">
            {currentOrders.length === 0 ? (
              <div className="no-orders">
                <div className="no-orders-content">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                  </svg>
                  <h3>
                    {orders.length === 0
                      ? "Chưa có đơn hàng nào"
                      : "Không tìm thấy đơn hàng"}
                  </h3>
                  <p>
                    {orders.length === 0
                      ? "Đơn hàng sẽ được hiển thị ở đây khi có dữ liệu thực tế."
                      : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
                  </p>
                </div>
              </div>
            ) : (
              currentOrders.map((order) => (
                <div key={order.id} className="table-row">
                  <div className="col-order-id">
                    <span className="order-id">
                      {order.backendId || order.id}
                    </span>
                  </div>
                  <div className="col-customer">
                    <div className="customer-info">
                      <div className="customer-name">
                        {order.customer?.name || "N/A"}
                      </div>
                      <div className="customer-phone">
                        {order.customer?.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-vehicle">
                    <div className="vehicle-info">
                      <div className="vehicle-name">{order.vehicle.name}</div>
                      <div className="vehicle-color">{order.vehicle.color}</div>
                    </div>
                  </div>
                  <div className="col-amount">
                    <div className="amount-info">
                      <div className="amount">
                        {formatCurrency(order.amount)}
                        {/* Debug log */}
                        {console.log(
                          "OrderManagement - Order amount:",
                          order.amount,
                          "formatted:",
                          formatCurrency(order.amount),
                          "for order:",
                          order.id
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${order.statusType}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-date">
                    <span className="date">{order.date}</span>
                  </div>
                  <div className="col-actions">
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => handleViewDetails(order)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
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
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
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
                      <span key={pageNum} className="pagination-ellipsis">
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
      </div>
    </div>
  );
};

export default OrderManagement;
