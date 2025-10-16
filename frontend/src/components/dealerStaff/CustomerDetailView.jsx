// import React from "react";
// import "./CustomerDetailView.css";

// const CustomerDetailView = ({
//   customer,
//   onBack,
//   onCreateQuotation,
//   onCreateOrder,
// }) => {
//   const handleCreateQuotation = () => {
//     if (onCreateQuotation) {
//       onCreateQuotation(customer);
//     }
//   };

//   const handleCreateOrder = () => {
//     if (onCreateOrder) {
//       onCreateOrder(customer);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("vi-VN", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "contact":
//         return "#ffc107";
//       case "prospect":
//         return "#17a2b8";
//       case "customer":
//         return "#28a745";
//       default:
//         return "#6c757d";
//     }
//   };

//   return (
//     <div className="customer-detail-container">
//       {/* Header */}
//       <div className="detail-header">
//         <button className="back-btn" onClick={onBack}>
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
//           </svg>
//           Quay lại
//         </button>
//         <h1>Chi tiết khách hàng</h1>
//       </div>

//       {/* Customer Info Form Style */}
//       <div className="customer-info-form">
//         <div className="form-fields">
//           <div className="form-row">
//             <div className="form-group">
//               <label className="form-label">Customer ID</label>
//               <div className="form-value">{customer.id}</div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Họ và tên</label>
//               <div className="form-value">{customer.name}</div>
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label className="form-label">Số điện thoại</label>
//               <div className="form-value">{customer.phone}</div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Email</label>
//               <div className="form-value">{customer.email}</div>
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label className="form-label">Số CMND/CCCD</label>
//               <div className="form-value">{customer.idNumber}</div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Địa chỉ</label>
//               <div className="form-value">{customer.address}</div>
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label className="form-label">Trạng thái</label>
//               <div className="form-value">
//                 <span
//                   className="status-badge"
//                   style={{ backgroundColor: getStatusColor(customer.status) }}
//                 >
//                   {customer.status}
//                 </span>
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Ngày tạo</label>
//               <div className="form-value">{formatDate(customer.createdAt)}</div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="form-actions">
//           <button
//             className="action-btn create-quote-btn"
//             onClick={handleCreateQuotation}
//           >
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//               className="action-icon"
//             >
//               <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
//             </svg>
//             Tạo báo giá
//           </button>

//           <button
//             className="action-btn create-order-btn"
//             onClick={handleCreateOrder}
//           >
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//               className="action-icon"
//             >
//               <path d="M7,4V2A1,1 0 0,1 8,1H16A1,1 0 0,1 17,2V4H20A1,1 0 0,1 21,5V7A1,1 0 0,1 20,8H19V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8H4A1,1 0 0,1 3,7V5A1,1 0 0,1 4,4H7M9,3V4H15V3H9M7,6V19A1,1 0 0,0 8,20H16A1,1 0 0,0 17,19V6H7Z" />
//             </svg>
//             Tạo đơn hàng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDetailView;

import React from "react";
import "./CustomerDetailView.css";

const CustomerDetailView = ({
  customer,
  onBack,
  onCreateQuotation,
  onCreateOrder,
}) => {
  const handleCreateQuotation = () => {
    if (onCreateQuotation) {
      onCreateQuotation(customer);
    }
  };

  const handleCreateOrder = () => {
    if (onCreateOrder) {
      onCreateOrder(customer);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    // ... (hàm này giữ nguyên)
  };

  return (
    <div className="customer-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          {/* ... svg icon */}
          Quay lại
        </button>
        <h1>Chi tiết khách hàng</h1>
      </div>

      {/* Customer Info */}
      <div className="customer-info-form">
        <div className="form-fields">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer ID</label>
              {/* ✅ SỬA LỖI 1: Hiển thị đúng ID */}
              <div className="form-value">
                {customer.id || customer.customerId || "N/A"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              {/* ✅ SỬA LỖI 2: Dùng 'fullName' thay vì 'name' */}
              <div className="form-value">{customer.fullName}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <div className="form-value">{customer.phone}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-value">{customer.email}</div>
            </div>
          </div>

          {/* ... các hàng còn lại không đổi ... */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số CMND/CCCD</label>
              <div className="form-value">{customer.idNumber}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <div className="form-value">{customer.address}</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <div className="form-value">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(customer.status) }}
                >
                  {customer.status}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày tạo</label>
              <div className="form-value">{formatDate(customer.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            className="action-btn create-quote-btn"
            onClick={handleCreateQuotation}
          >
            Tạo báo giá
          </button>
          <button
            className="action-btn create-order-btn"
            onClick={handleCreateOrder}
          >
            Tạo đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
