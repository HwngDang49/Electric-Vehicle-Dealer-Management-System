// import React, { useState } from "react";
// import "./CustomerManagement.css";
// import AddCustomerForm from "./AddCustomerForm";
// import CustomerDetailView from "./CustomerDetailView";

// const CustomerManagement = ({ onCreateQuotation, onCreateOrder }) => {
//   const [customers, setCustomers] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);

//   const handleShowAddForm = () => {
//     setShowAddForm(true);
//   };

//   const handleCloseAddForm = () => {
//     setShowAddForm(false);
//   };

//   const handleAddCustomer = (newCustomer) => {
//     setCustomers((prev) => [...prev, newCustomer]);
//     setShowAddForm(false);
//   };

//   const handleCreateQuotation = (customer) => {
//     if (onCreateQuotation) {
//       onCreateQuotation(customer);
//     }
//   };

//   const handleViewDetails = (customer) => {
//     console.log("View details for customer:", customer);
//     setSelectedCustomer(customer);
//   };

//   const handleBackToList = () => {
//     setSelectedCustomer(null);
//   };

//   const handleCreateOrder = (customer) => {
//     console.log("Create order for customer:", customer);
//     if (onCreateOrder) {
//       onCreateOrder(customer);
//     }
//   };

//   if (showAddForm) {
//     return (
//       <AddCustomerForm
//         onClose={handleCloseAddForm}
//         onAddCustomer={handleAddCustomer}
//         onCreateQuotation={handleCreateQuotation}
//       />
//     );
//   }

//   if (selectedCustomer) {
//     return (
//       <CustomerDetailView
//         customer={selectedCustomer}
//         onBack={handleBackToList}
//         onCreateQuotation={onCreateQuotation}
//         onCreateOrder={handleCreateOrder}
//       />
//     );
//   }

//   return (
//     <div className="customer-management">
//       <div className="customer-content">
//         <div className="customer-header">
//           <div className="header-content">
//             <h1>Quản lý khách hàng</h1>
//             <p>Quản lý thông tin và hồ sơ khách hàng</p>
//           </div>
//           <button className="add-customer-btn" onClick={handleShowAddForm}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
//             </svg>
//             Thêm khách hàng mới
//           </button>
//         </div>

//         <div className="customer-list-header">
//           <h2>Danh sách khách hàng</h2>
//           <div className="customer-list-actions">
//             <div className="customer-search-box">
//               <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//               >
//                 <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
//               </svg>
//               <input type="text" placeholder="Tìm kiếm khách hàng..." />
//             </div>
//             <select className="filter-select">
//               <option value="all">Tất cả</option>
//               <option value="Contact">Contact</option>
//               <option value="Prospect">Prospect</option>
//               <option value="Customer">Customer</option>
//             </select>
//           </div>
//         </div>

//         <div className="customer-table">
//           <div className="customer-table-header">
//             <div className="col-customer-id">Customer ID</div>
//             <div className="col-full-name">Full Name</div>
//             <div className="col-status">Status</div>
//             <div className="col-actions">Thao tác</div>
//           </div>

//           <div className="customer-table-body">
//             {customers.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-icon">
//                   <svg
//                     width="48"
//                     height="48"
//                     viewBox="0 0 24 24"
//                     fill="currentColor"
//                   >
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                   </svg>
//                 </div>
//                 <h3>Chưa có khách hàng nào</h3>
//                 <p>Hãy thêm khách hàng mới để bắt đầu quản lý</p>
//                 <button
//                   className="add-first-customer-btn"
//                   onClick={handleShowAddForm}
//                 >
//                   <svg
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="currentColor"
//                   >
//                     <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
//                   </svg>
//                   Thêm khách hàng đầu tiên
//                 </button>
//               </div>
//             ) : (
//               customers.map((customer) => (
//                 <div key={customer.id} className="customer-table-row">
//                   <div className="col-customer-id">
//                     <span className="customer-id">{customer.id}</span>
//                   </div>
//                   <div className="col-full-name">
//                     <span className="full-name">{customer.name}</span>
//                   </div>
//                   <div className="col-status">
//                     <span
//                       className={`status-badge ${customer.status || "active"}`}
//                     >
//                       {customer.status || "Active"}
//                     </span>
//                   </div>
//                   <div className="col-actions">
//                     {/* Hidden: Tạo báo giá button */}
//                     {/* <button
//                       className="action-btn create-quote-btn"
//                       title="Tạo báo giá"
//                       onClick={() => handleCreateQuotation(customer)}
//                     >
//                       <svg
//                         width="16"
//                         height="16"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                       >
//                         <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
//                       </svg>
//                       Tạo báo giá
//                     </button> */}

//                     <button
//                       className="action-btn view-details-btn"
//                       title="Xem chi tiết"
//                       onClick={() => handleViewDetails(customer)}
//                     >
//                       <svg
//                         width="16"
//                         height="16"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                       >
//                         <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
//                       </svg>
//                       Xem chi tiết
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerManagement;

import React, { useState } from "react";
import "./CustomerManagement.css";
import AddCustomerForm from "./AddCustomerForm";
import CustomerDetailView from "./CustomerDetailView";

const STATUS_META = {
  Contact: { label: "Contact", className: "status-badge status--neutral" },
  Prospect: { label: "Prospect", className: "status-badge status--warning" },
  Customer: { label: "Customer", className: "status-badge status--success" },
};

const StatusBadge = ({ status }) => {
  const key = typeof status === "string" ? status : ""; // giữ nguyên chữ hoa đầu
  const meta = STATUS_META[key] || {
    label: key || "Unknown",
    className: "status-badge status--unknown",
  };
  return <span className={meta.className}>{meta.label}</span>;
};

const CustomerManagement = ({ onCreateQuotation, onCreateOrder }) => {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleShowAddForm = () => setShowAddForm(true);
  const handleCloseAddForm = () => setShowAddForm(false);

  const handleAddCustomer = (newCustomer) => {
    // newCustomer từ AddCustomerForm: { id, fullName, phone, email, idNumber, address, status }
    setCustomers((prev) => [...prev, newCustomer]);
    setShowAddForm(false);
  };

  const handleCreateQuotation = (customer) => {
    onCreateQuotation?.(customer);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => setSelectedCustomer(null);

  const handleCreateOrder = (customer) => {
    onCreateOrder?.(customer);
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

  if (selectedCustomer) {
    return (
      <CustomerDetailView
        customer={selectedCustomer}
        onBack={handleBackToList}
        onCreateQuotation={onCreateQuotation}
        onCreateOrder={handleCreateOrder}
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

        <div className="customer-list-header">
          <h2>Danh sách khách hàng</h2>
          <div className="customer-list-actions">
            <div className="customer-search-box">
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
            <select className="filter-select" defaultValue="all">
              <option value="all">Tất cả</option>
              <option value="Contact">Contact</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        </div>

        <div className="customer-table">
          <div className="customer-table-header">
            <div className="col-customer-id">Customer ID</div>
            <div className="col-full-name">Full Name</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Thao tác</div>
          </div>

          <div className="customer-table-body">
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
                <div key={customer.id} className="customer-table-row">
                  <div className="col-customer-id">
                    <span className="customer-id">{customer.id}</span>
                  </div>
                  <div className="col-full-name">
                    <span className="full-name">
                      {customer.fullName ?? customer.name}
                    </span>
                  </div>
                  <div className="col-status">
                    <StatusBadge status={customer.status} />
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-btn view-details-btn"
                      title="Xem chi tiết"
                      onClick={() => handleViewDetails(customer)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                      </svg>
                      Xem chi tiết
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
