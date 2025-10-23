import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockPayments = [
      {
        id: "PAY001",
        dealerId: "DL001",
        amount: 50000000,
        status: "Completed",
        statusText: "Completed",
        paymentMethod: "Bank Transfer",
        date: "2024-01-15",
      },
      {
        id: "PAY002",
        dealerId: "DL002",
        amount: 75000000,
        status: "Pending",
        statusText: "Pending",
        paymentMethod: "Credit Card",
        date: "2024-01-14",
      },
      {
        id: "PAY003",
        dealerId: "DL003",
        amount: 30000000,
        status: "Failed",
        statusText: "Failed",
        paymentMethod: "Bank Transfer",
        date: "2024-01-13",
      },
    ];

    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="evm-staff-payment-management">
        <div className="evm-staff-loading">
          <div className="evm-staff-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evm-staff-payment-management">
      <div className="evm-staff-page-header">
        <div>
          <h1>Quản lý thanh toán</h1>
          <p>Xử lý và quản lý các giao dịch thanh toán từ đại lý</p>
        </div>
        <button
          className="evm-staff-refresh-btn"
          onClick={handleRefresh}
          title="Làm mới dữ liệu"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Payments Table */}
      <div className="evm-staff-table-container">
        <div className="evm-staff-table-header">
          <div className="evm-staff-table-cell">Payment ID</div>
          <div className="evm-staff-table-cell">Dealer ID</div>
          <div className="evm-staff-table-cell">Số tiền</div>
          <div className="evm-staff-table-cell">Trạng thái</div>
          <div className="evm-staff-table-cell">Phương thức</div>
          <div className="evm-staff-table-cell">Ngày</div>
          <div className="evm-staff-table-cell">Thao tác</div>
        </div>
        <div className="evm-staff-table-body">
          {payments.length === 0 ? (
            <div className="evm-staff-empty-state">
              <p>Không tìm thấy giao dịch thanh toán nào</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="evm-staff-table-row">
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-payment-id">{payment.id}</span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-dealer-id">
                    {payment.dealerId}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-amount">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span
                    className={`evm-staff-status evm-staff-status-${payment.status}`}
                  >
                    {payment.statusText}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-payment-method">
                    {payment.paymentMethod}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-date">{payment.date}</span>
                </div>
                <div className="evm-staff-table-cell">
                  <button
                    className="evm-staff-view-details-btn"
                    onClick={() => alert("Xem chi tiết: " + payment.id)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
