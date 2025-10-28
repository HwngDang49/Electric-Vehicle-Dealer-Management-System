import React, { useState, useEffect } from "react";
import "./VinAllocationManagement.css";
import VinAllocationDetail from "./VinAllocationDetail";
import CustomDropdown from "./CustomDropdown";

const VinAllocationManagement = ({
  orders = [],
  onUpdateOrderStatus,
  onNavigateToDelivery,
  selectedOrderForAllocation = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(selectedOrderForAllocation);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchQuery !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeFilter]);

  // Auto-open modal if selectedOrderForAllocation is provided
  useEffect(() => {
    if (selectedOrderForAllocation) {
      console.log("Auto-opening VIN Allocation modal for order:", selectedOrderForAllocation.id);
      setSelectedOrder(selectedOrderForAllocation);
    }
  }, [selectedOrderForAllocation]);

  // Status options for dropdown
  const statusOptions = [
    { value: "Tất cả", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Allocated", label: "Đã phân bổ VIN", icon: "✅" },
  ];

  // Filter orders to show only Allocated orders (already allocated with VIN)
  const filteredOrders = orders
    .filter((order) => order.statusType === "allocated")
    .filter((order) => {
      const matchesSearch =
        debouncedSearchTerm.trim() === "" ||
        order.id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.customer?.phone?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.vehicle?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === "Tất cả" || order.status === activeFilter;

      return matchesSearch && matchesFilter;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setActiveFilter(status);
  };

  const handleAllocateVin = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleAllocateSuccess = (orderId, selectedVin) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, "Đã phân bổ", "allocated", selectedVin);
    }
    setSelectedOrder(null);
  };

  // If an order is selected (Confirmed or Allocated), show fullscreen VIN allocation detail page
  if (selectedOrder) {
    return (
      <VinAllocationDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onAllocateSuccess={handleAllocateSuccess}
        onNavigateToDelivery={onNavigateToDelivery}
      />
    );
  }

  return (
    <div className="vin-allocation-management-app">
      <div className="vin-allocation-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng theo mã, khách hàng, xe..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              {isSearching && (
                <div className="search-loading-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#20c997" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" />
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
              )}
              <button className="search-btn" onClick={handleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
            
            <CustomDropdown
              value={activeFilter}
              onChange={handleStatusFilterChange}
              options={statusOptions}
              minWidth="220px"
            />
          </div>
        </div>

        <div className="orders-table-container" key={`page-${currentPage}-search-${debouncedSearchTerm}`}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>VIN</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    📋 {debouncedSearchTerm 
                      ? "Không tìm thấy đơn hàng phù hợp với từ khóa tìm kiếm" 
                      : "Chưa có đơn hàng nào được phân bổ VIN"}
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id">#{order.backendId || order.id}</span>
                    </td>
                    <td>
                      <div className="order-customer-name">
                        {order.customer?.name || "N/A"}
                      </div>
                      <div className="order-customer-phone">
                        {order.customer?.phone || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="order-vehicle-name">
                        {order.vehicle?.name || "N/A"}
                      </div>
                      <div className="order-vehicle-color">
                        {order.vehicle?.color || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="vin-number">{order.vin || "-"}</div>
                    </td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => handleAllocateVin(order)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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

export default VinAllocationManagement;
