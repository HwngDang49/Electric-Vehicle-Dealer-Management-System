import React from "react";
import "./PaymentManagement.css";

const PaymentManagement = () => {
  // Mock data for payments - should be replaced with API call
  const paymentData = [];

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý thanh toán</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các giao dịch thanh toán của đại lý
        </p>
      </div>

      {/* Payment Table */}
      <div className="payment-table-section">
        <div className="table-header">
          <h3 className="table-title">Danh sách giao dịch</h3>
        </div>

        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Dealer ID</th>
                <th>PO ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="invoice-info">
                      <div className="invoice-id">
                        {item.invoiceId || "INV-001"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="dealer-info">
                      <div className="dealer-id">
                        {item.dealerId || "DL-001"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="po-info">
                      <div className="po-id">{item.poId || "PO-001"}</div>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <div className="amount">
                        {item.amount?.toLocaleString() || "0"} VNĐ
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        item.status?.toLowerCase() || "pending"
                      }`}
                    >
                      {item.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn">
                        Xem chi tiết
                      </button>
                      {item.status === "Pending" && (
                        <button className="action-btn confirm-btn">
                          Xác nhận
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentData.length === 0 && (
          <div className="no-data">
            <div className="no-data-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h3>Không tìm thấy dữ liệu</h3>
            <p>Không có giao dịch nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
