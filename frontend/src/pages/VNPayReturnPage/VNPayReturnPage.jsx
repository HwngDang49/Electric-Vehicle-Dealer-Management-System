import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./VNPayReturnPage.css";

function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");
  const [transactionInfo, setTransactionInfo] = useState({});

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Lấy tất cả params từ VNPay
      const vnpParams = {};
      for (const [key, value] of searchParams.entries()) {
        vnpParams[key] = value;
      }

      setTransactionInfo({
        amount: vnpParams.vnp_Amount ? parseInt(vnpParams.vnp_Amount) / 100 : 0,
        orderInfo: vnpParams.vnp_OrderInfo || "",
        transactionNo: vnpParams.vnp_TransactionNo || "",
        bankCode: vnpParams.vnp_BankCode || "",
        payDate: vnpParams.vnp_PayDate || "",
        responseCode: vnpParams.vnp_ResponseCode || "",
      });

      const responseCode = vnpParams.vnp_ResponseCode;
      const paymentStatus = vnpParams.payment_status; // Payment status từ backend
      const txnRef = vnpParams.vnp_TxnRef;

      // Ưu tiên sử dụng payment_status từ backend (được thêm vào bởi VNPayReturnController)
      if (paymentStatus) {
        if (paymentStatus === "success") {
          setStatus("success");
          setMessage("Thanh toán thành công!");
        } else {
          setStatus("failed");
          setMessage("Thanh toán thất bại!");
        }
        return;
      }

      // Fallback: Nếu không có payment_status từ backend, kiểm tra responseCode
      // Nếu VNPay trả về lỗi ngay từ đầu (responseCode !== "00")
      if (responseCode !== "00") {
        setStatus("failed");
        setMessage("Thanh toán thất bại!");
        return;
      }

      // Nếu responseCode === "00" nhưng không có payment_status từ backend
      // Có thể backend chưa xử lý xong, thử kiểm tra payment status từ API
      if (txnRef && !txnRef.startsWith("SETTLEMENT_")) {
        // Đây là payment cho Invoice (không phải Settlement)
        try {
          const paymentId = parseInt(txnRef);
          if (isNaN(paymentId)) {
            setStatus("failed");
            setMessage("Thanh toán thất bại! Mã giao dịch không hợp lệ.");
            return;
          }

          // Gọi API backend để kiểm tra payment status thực tế (fallback)
          const response = await api.get(`/api/payments/${paymentId}`);
          const payment = response.data;

          // Kiểm tra payment status từ backend
          if (payment && payment.status === "Captured") {
            // Thanh toán thành công
            setStatus("success");
            setMessage("Thanh toán thành công!");
          } else {
            // Thanh toán thất bại (có thể do wallet không đủ tiền hoặc lý do khác)
            setStatus("failed");
            setMessage(
              payment?.note || "Thanh toán thất bại! Vui lòng kiểm tra lại."
            );
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
          // Nếu không lấy được payment status, hiển thị thất bại để an toàn
          setStatus("failed");
          setMessage(
            "Không thể xác minh trạng thái thanh toán. Vui lòng kiểm tra lại sau."
          );
        }
      } else {
        // Settlement payment hoặc không có txnRef
        // Với settlement, tạm thời dựa vào responseCode
        if (responseCode === "00") {
          setStatus("success");
          setMessage("Thanh toán thành công!");
        } else {
          setStatus("failed");
          setMessage("Thanh toán thất bại!");
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const handleBackToHome = () => {
    // Get user role and navigate to appropriate page
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
      navigate("/login");
      return;
    }

    switch (userRole) {
      case "DealerStaff":
        navigate("/dealerStaff");
        break;
      case "DealerManager":
        navigate("/dealerManager");
        break;
      case "EVMStaff":
        navigate("/evmStaff");
        break;
      case "Admin":
        navigate("/admin");
        break;
      default:
        navigate("/login");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="vnpay-return-container">
      <div className="vnpay-return-card">
        <div className={`status-icon ${status}`}>
          {status === "processing" && <div className="spinner"></div>}
          {status === "success" && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {status === "failed" && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 9L9 15M9 9L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <h1 className={`status-title ${status}`}>{message}</h1>

        {status !== "processing" && (
          <div className="transaction-details">
            <h2>Thông tin giao dịch</h2>
            <div className="detail-row">
              <span className="label">Số tiền:</span>
              <span className="value">
                {formatCurrency(transactionInfo.amount)}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Nội dung:</span>
              <span className="value">{transactionInfo.orderInfo}</span>
            </div>
            {transactionInfo.transactionNo && (
              <div className="detail-row">
                <span className="label">Mã giao dịch:</span>
                <span className="value">{transactionInfo.transactionNo}</span>
              </div>
            )}
            {transactionInfo.bankCode && (
              <div className="detail-row">
                <span className="label">Ngân hàng:</span>
                <span className="value">{transactionInfo.bankCode}</span>
              </div>
            )}
            {transactionInfo.payDate && (
              <div className="detail-row">
                <span className="label">Thời gian:</span>
                <span className="value">
                  {transactionInfo.payDate.replace(
                    /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                    "$3/$2/$1 $4:$5:$6"
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        <button className="back-button" onClick={handleBackToHome}>
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}

export default VNPayReturnPage;
