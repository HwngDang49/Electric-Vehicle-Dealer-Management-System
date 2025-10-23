import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import invoiceApiService from "../../services/invoiceApi";

const transformInvoiceToPayment = (invoice) => {
  return {
    id: invoice.invoiceId,
    invoiceId: invoice.invoiceNo,
    invoiceNo: invoice.invoiceNo,
    invoiceType: invoice.type || invoice.invoiceType || "Unknown",
    type: invoice.type || invoice.invoiceType || "Unknown",
    dealerId: `DL-${invoice.dealerId}`,
    poId: invoice.poId ? `PO-${invoice.poId}` : "N/A",
    saleDocId: invoice.saleDocId || invoice.salesDocId,
    amount: invoice.amount || 0,
    currency: invoice.currency || "VND",
    status: invoice.status || "Unknown",
    statusText: invoice.status || "Unknown",
    issuedAt: invoice.issuedAt,
    dueAt: invoice.dueAt,
    createdAt: invoice.issuedAt,
    note: invoice.note || null,
    _originalData: invoice,
  };
};

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await invoiceApiService.getList();
        const transformedPayments = Array.isArray(data)
          ? data.map(transformInvoiceToPayment)
          : [];
        setPayments(transformedPayments);
        setLoading(false);
      } catch (error) {
        console.error("Error loading payments:", error);
        setPayments([]);
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await invoiceApiService.getList();
      const transformedPayments = Array.isArray(data)
        ? data.map(transformInvoiceToPayment)
        : [];
      setPayments(transformedPayments);
      setLoading(false);
    } catch (error) {
      console.error("Error refreshing payments:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetails = async (payment) => {
    try {
      setDetailLoading(true);
      setSelectedPayment(payment);
      setShowDetailModal(true);
      setDetailLoading(false);
    } catch (error) {
      console.error("Error loading payment details:", error);
      alert("Không thể tải chi tiết hóa đơn");
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
    setDetailLoading(false);
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

      <div className="evm-staff-table-container">
        <div className="evm-staff-table-header">
          <div className="evm-staff-table-cell">Invoice ID</div>
          <div className="evm-staff-table-cell">Dealer ID</div>
          <div className="evm-staff-table-cell">PO ID</div>
          <div className="evm-staff-table-cell">Amount</div>
          <div className="evm-staff-table-cell">Status</div>
          <div className="evm-staff-table-cell">Action</div>
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
                  <span className="evm-staff-invoice-id">
                    {payment.invoiceId || payment.id}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-dealer-id">
                    {payment.dealerId}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-po-id">
                    {payment.poId || "N/A"}
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
                    {payment.statusText || payment.status}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <button
                    className="evm-staff-view-details-btn"
                    onClick={() => handleViewDetails(payment)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showDetailModal && selectedPayment && (
        <div className="evm-staff-modal-overlay" onClick={handleCloseModal}>
          <div
            className="evm-staff-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="evm-staff-modal-header">
              <h2 className="evm-staff-modal-title">Chi tiết hóa đơn</h2>
              <button
                className="evm-staff-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <div className="evm-staff-modal-body">
              {detailLoading ? (
                <div className="evm-staff-detail-loading">
                  <div className="evm-staff-spinner"></div>
                  <p>Đang tải chi tiết...</p>
                </div>
              ) : (
                <div className="evm-staff-invoice-detail-grid">
                  <div className="evm-staff-detail-section">
                    <h3 className="evm-staff-section-title">
                      Thông tin cơ bản
                    </h3>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Mã hóa đơn:
                      </span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.invoiceId ||
                          selectedPayment.invoiceNo ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Loại hóa đơn:
                      </span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.invoiceType ||
                          selectedPayment.type ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Trạng thái:
                      </span>
                      <span
                        className={`evm-staff-status evm-staff-status-${selectedPayment.status}`}
                      >
                        {selectedPayment.statusText || selectedPayment.status}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">Số tiền:</span>
                      <span className="evm-staff-detail-value evm-staff-amount">
                        {formatCurrency(selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">Tiền tệ:</span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.currency || "VND"}
                      </span>
                    </div>
                  </div>

                  <div className="evm-staff-detail-section">
                    <h3 className="evm-staff-section-title">
                      Thông tin liên quan
                    </h3>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">Mã đại lý:</span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.dealerId}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Mã đơn hàng:
                      </span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.poId}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Mã bán hàng:
                      </span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.saleDocId
                          ? `SD-${selectedPayment.saleDocId}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="evm-staff-detail-section">
                    <h3 className="evm-staff-section-title">
                      Thông tin thời gian
                    </h3>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">Ngày tạo:</span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.issuedAt
                          ? new Date(
                              selectedPayment.issuedAt
                            ).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Hạn thanh toán:
                      </span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.dueAt
                          ? new Date(selectedPayment.dueAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="evm-staff-detail-row">
                      <span className="evm-staff-detail-label">
                        Thời gian tạo:
                      </span>
                      <span className="evm-staff-detail-value">
                        {selectedPayment.issuedAt
                          ? new Date(selectedPayment.issuedAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {selectedPayment.note && (
                    <div className="evm-staff-detail-section">
                      <h3 className="evm-staff-section-title">Ghi chú</h3>
                      <div className="evm-staff-detail-row">
                        <span className="evm-staff-detail-label">
                          Nội dung:
                        </span>
                        <span className="evm-staff-detail-value">
                          {selectedPayment.note}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="evm-staff-modal-footer">
              <button
                className="evm-staff-modal-btn evm-staff-close-btn"
                onClick={handleCloseModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
