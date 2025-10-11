import React, { useState } from "react";
import "./CustomerManagement.css";
import AddCustomerForm from "./AddCustomerForm";

const CustomerManagement = ({ onCreateQuotation }) => {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prev) => [...prev, newCustomer]);
    setShowAddForm(false);
  };

  const handleCreateQuotation = (customer) => {
    if (onCreateQuotation) {
      onCreateQuotation(customer);
    }
  };

  if (showAddForm) {
    return (
      <AddCustomerForm
        onClose={handleCloseAddForm}
        onAddCustomer={handleAddCustomer}
        onCreateQuotation={handleCreateQuotation}
      />
    );
  }

  return (
    <div className="customer-management">
      <div className="customer-content">
        <div className="customer-header">
          <div className="header-content">
            <h1>Quản lý khách hàng</h1>
            <p>Quản lý thông tin và hồ sơ khách hàng</p>
          </div>
          <button className="add-customer-btn" onClick={handleShowAddForm}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Thêm khách hàng mới
          </button>
        </div>

        <div className="list-header">
          <h2>Danh sách khách hàng</h2>
          <div className="list-actions">
            <div className="search-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input type="text" placeholder="Tìm kiếm khách hàng..." />
            </div>
            <select className="filter-select">
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>

        <div className="customer-table">
          <div className="table-header">
            <div className="col-customer">Tên khách hàng</div>
            <div className="col-contact">Liên hệ</div>
            <div className="col-address">Địa chỉ</div>
            <div className="col-actions">Thao tác</div>
          </div>

          <div className="table-body">
            {customers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3>Chưa có khách hàng nào</h3>
                <p>Hãy thêm khách hàng mới để bắt đầu quản lý</p>
                <button
                  className="add-first-customer-btn"
                  onClick={handleShowAddForm}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Thêm khách hàng đầu tiên
                </button>
              </div>
            ) : (
              customers.map((customer) => (
                <div key={customer.id} className="table-row">
                  <div className="col-customer">
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="customer-details">
                        <div className="customer-name">{customer.name}</div>
                        <div className="customer-id">ID: {customer.id}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-contact">
                    <div className="contact-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                      {customer.phone}
                    </div>
                    <div className="contact-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      {customer.email}
                    </div>
                  </div>
                  <div className="col-address">
                    <div className="address-text">{customer.address}</div>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-btn create-quote-btn"
                      title="Tạo báo giá"
                      onClick={() => handleCreateQuotation(customer)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      Tạo báo giá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
