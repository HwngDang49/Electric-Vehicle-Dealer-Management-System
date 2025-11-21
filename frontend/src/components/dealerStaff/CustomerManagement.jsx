import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./CustomerManagement.css";
import AddCustomerForm from "./AddCustomerForm";
import CustomerDetailView from "./CustomerDetailView";
import customerApiService from "../../services/customerApi";

const CustomerManagement = ({ onCreateQuotation, onCreateOrder }) => {
  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load customers on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadCustomers();
  }, [currentPage, pageSize, selectedStatus, debouncedSearchTerm]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        Page: currentPage,
        PageSize: pageSize,
      };

      if (selectedStatus) {
        filters.Status = selectedStatus;
      }

      if (debouncedSearchTerm.trim()) {
        filters.SearchTerm = debouncedSearchTerm.trim();
      }

      const response = await customerApiService.getCustomers(filters);
      const fetchedCustomers = response.data?.items || response.data || response;
      setCustomers(fetchedCustomers);
      setTotalPages(response.data?.totalPages || 0);
      setTotalItems(response.data?.totalCount || 0);
      return fetchedCustomers;
    } catch (err) {
      setError("Không thể tải danh sách khách hàng");
      console.error("Error loading customers:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    loadCustomers();
  };

  const handleViewDetails = async (customer) => {
    // Show modal immediately with basic data
    setSelectedCustomer(customer);
    
    try {
      setLoadingDetail(true);
      const customerDetail = await customerApiService.getCustomerById(
        customer.customerId
      );

      const customerData = customerDetail.data || customerDetail;
      setSelectedCustomer(customerData);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setError("Không thể tải chi tiết khách hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Contact: { text: "Liên hệ", class: "status-contact" },
      Prospect: { text: "Tiềm năng", class: "status-prospect" },
      Customer: { text: "Khách hàng", class: "status-customer" },
      // Support both English and Vietnamese keys
      "Liên hệ": { text: "Liên hệ", class: "status-contact" },
      "Tiềm năng": { text: "Tiềm năng", class: "status-prospect" },
      "Khách hàng": { text: "Khách hàng", class: "status-customer" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="dealer-staff-customer-management-app">
      {toast && ReactDOM.createPortal(
        <div className={`customer-toast ${toast.type === 'error' ? 'customer-toast-error' : ''}`} style={{ zIndex: 99999 }}>
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

      <div className="customer-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>
          <button
            className="create-btn"
            onClick={() => setShowAddForm(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Thêm Khách hàng
          </button>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="customers-table-container" key={`page-${currentPage}-search-${debouncedSearchTerm}`}>
          {loading && (
            <div className="table-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <table className="customers-table" style={{ opacity: loading ? 0.5 : 1 }}>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    📋 {searchTerm 
                      ? "Không tìm thấy khách hàng phù hợp với từ khóa tìm kiếm" 
                      : "Chưa có khách hàng nào trong hệ thống"}
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                    <tr key={customer.customerId || `customer-${index}`}>
                      <td>
                        <span className="customer-id">{customer.customerId}</span>
                      </td>
                      <td>
                        <span className="customer-name">{customer.fullName}</span>
                      </td>
                      <td>
                        <span className="customer-phone">{customer.phone || "-"}</span>
                      </td>
                      <td>
                        <span className="customer-email">{customer.email || "-"}</span>
                      </td>
                      <td>{getStatusBadge(customer.status)}</td>
                      <td>
                        <button
                          className="view-detail-btn"
                          onClick={() => handleViewDetails(customer)}
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
        {!loading && totalPages > 1 && (
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

        {/* Add Customer Modal */}
        {showAddForm && (
          <AddCustomerForm
            onClose={() => setShowAddForm(false)}
            onAddCustomer={async (newCustomer) => {
              // Show toast first (before closing modal to avoid delay)
              if (newCustomer) {
                showToast("success", `Khách hàng "${newCustomer.fullName}" đã được tạo thành công!`);
              }
              // Close modal immediately
              setShowAddForm(false);
              // Reload customers
              await loadCustomers();
            }}
            onError={(errorMessage) => {
              // Show error toast first (before closing modal to avoid delay)
              showToast("error", errorMessage || "Không thể tạo khách hàng. Vui lòng thử lại.");
              // Close modal immediately
              setShowAddForm(false);
            }}
            onCreateQuotation={onCreateQuotation}
          />
        )}

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <CustomerDetailView
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
            onCreateQuotation={onCreateQuotation}
            onCreateOrder={onCreateOrder}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
