import React, { useState, useEffect } from "react";
import "./QuotationDetailView.css";
import quoteApiService from "../../services/quoteApi";
import customerApiService from "../../services/customerApi";

const QuotationDetailView = ({
  quotation,
  onClose,
  formatCurrency,
  onUpdateQuotation,
  onConvertToOrder,
  onReloadData,
}) => {
  console.log("QuotationDetailView received quotation:", quotation);
  const [isSent, setIsSent] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Cập nhật state dựa trên trạng thái của quotation
  useEffect(() => {
    if (quotation) {
      // Kiểm tra nếu có lockedUntil và status là Draft thì coi như đã gửi
      const isQuotationSent =
        quotation.status === "Sent" ||
        quotation.status === "Finalized" ||
        (quotation.status === "Draft" && quotation.lockedUntil);

      // Nếu có lockedUntil thì chắc chắn đã gửi
      const hasLockedUntil =
        quotation.lockedUntil && quotation.lockedUntil !== null;

      console.log("🔄 Updating quotation state:", {
        quotationId: quotation.id,
        status: quotation.status,
        lockedUntil: quotation.lockedUntil,
        hasLockedUntil,
        isQuotationSent,
        isFinalized: quotation.status === "Finalized",
      });

      // Ưu tiên hasLockedUntil trước
      setIsSent(hasLockedUntil || isQuotationSent);
      setIsFinalized(quotation.status === "Finalized");

      // Lấy thông tin customer đầy đủ
      if (quotation.customer?.id) {
        loadCustomerDetails(quotation.customer.id);
      }
    }
  }, [quotation]);

  // Hàm lấy thông tin customer đầy đủ
  const loadCustomerDetails = async (customerId) => {
    try {
      setLoadingCustomer(true);
      console.log("🌐 Loading customer details for ID:", customerId);
      const response = await customerApiService.getCustomerById(customerId);
      console.log("✅ Customer details loaded:", response);
      setCustomerDetails(response.data);
    } catch (error) {
      console.error("❌ Error loading customer details:", error);
      // Không hiển thị lỗi cho user, chỉ log
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Debug: Check if quotation exists
  if (!quotation) {
    console.log("Quotation is null or undefined");
    return (
      <div className="quotation-detail-view">
        <div className="error-message">
          <h2>Không tìm thấy báo giá</h2>
          <p>Báo giá không tồn tại hoặc đã bị xóa.</p>
          <button className="back-btn" onClick={onClose}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleSendQuotation = async () => {
    if (!isSent) {
      // Bước 1: Gửi báo giá - gọi API để cập nhật locked_until
      try {
        const quoteId = quotation.backendId;
        console.log("🌐 Sending quote with ID:", quoteId);

        if (!quoteId) {
          throw new Error("Không tìm thấy ID báo giá để gửi");
        }

        const response = await quoteApiService.sendQuote(quoteId);
        console.log("✅ Quote sent successfully:", response);

        setIsSent(true);

        // Cập nhật trạng thái trong parent component với lockedUntil từ API response
        if (onUpdateQuotation) {
          onUpdateQuotation(quotation.id, {
            ...quotation,
            status: response.data?.status || "Draft",
            lockedUntil:
              response.data?.lockedUntil ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        // Reload data sau khi update quotation để đồng bộ
        if (onReloadData) {
          console.log("🔄 Reloading data from API...");
          await onReloadData();
        }

        alert(
          "Báo giá đã được gửi! Trạng thái vẫn là Draft, locked_until đã được cập nhật."
        );
      } catch (error) {
        console.error("❌ Error sending quote:", error);
        alert("Lỗi khi gửi báo giá: " + (error.message || "Vui lòng thử lại"));
      }
    } else if (!isFinalized) {
      // Bước 2: Ghi nhận báo giá - gọi API finalizeQuote
      try {
        const quoteId = quotation.backendId;
        console.log("🔍 Quote object:", quotation);
        console.log("🔍 BackendId:", quoteId);
        console.log("🔍 Quote ID:", quotation.id);

        if (!quoteId) {
          throw new Error("Không tìm thấy ID báo giá để ghi nhận");
        }

        console.log("🌐 Finalizing quote with ID:", quoteId);
        console.log("🌐 Quote object:", quotation);
        console.log("🌐 Auth token:", localStorage.getItem("authToken"));

        const response = await quoteApiService.finalizeQuote(quoteId);
        console.log("✅ Quote finalized successfully:", response);

        setIsFinalized(true);

        // Không cần reload data ngay, để parent component tự xử lý
        // Vì nếu reload ngay, quotation object sẽ không được cập nhật

        // Cập nhật trạng thái trong parent component
        if (onUpdateQuotation) {
          onUpdateQuotation(quotation.id, {
            ...quotation,
            status: "Finalized",
          });
        }

        alert("Báo giá đã được ghi nhận thành công!");
      } catch (error) {
        console.error("❌ Error finalizing quote:", error);
        console.error("❌ Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: error.config,
        });

        // Show detailed error message
        let errorMessage = "Có lỗi xảy ra khi ghi nhận báo giá";

        if (error.response?.status === 401) {
          errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
        } else if (error.response?.status === 404) {
          errorMessage = "Không tìm thấy báo giá hoặc endpoint không tồn tại.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        alert(`Lỗi: ${errorMessage}`);
      }
    }
  };

  const handleConvertToOrder = async () => {
    if (!isFinalized) {
      alert("Chỉ có thể chuyển đổi báo giá đã được ghi nhận thành đơn hàng!");
      return;
    }

    try {
      const quoteId = quotation.backendId;
      console.log("🔄 Converting quote to order:", {
        quoteId,
        quotationId: quotation.id,
        status: quotation.status,
        isFinalized,
      });

      if (!quoteId) {
        throw new Error("Không tìm thấy ID báo giá để chuyển đổi");
      }

      // Gọi API convert quote to order
      const response = await quoteApiService.convertToOrder(quoteId, {
        confirmChanges: true, // Mặc định xác nhận thay đổi
      });

      console.log("✅ Quote converted to order successfully:", response);

      if (response?.data?.orderIds && response.data.orderIds.length > 0) {
        const orderId = response.data.orderIds[0]; // Lấy order đầu tiên

        // Tạo order data để hiển thị trong UI
        const orderData = {
          id: `DH${orderId}`, // Sử dụng orderId từ backend
          backendId: orderId,
          customer: {
            name: quotation.customer.name,
            phone: quotation.customer.phone,
            email: quotation.customer.email,
            id: quotation.customer.id,
          },
          vehicle: {
            name: quotation.vehicle.name,
            model: quotation.vehicle.model,
            version: quotation.vehicle.version,
            color: quotation.vehicle.color,
            price: quotation.vehicle.price,
            // Add detailed vehicle info
            modelInfo: quotation.vehicle.modelInfo,
            versionInfo: quotation.vehicle.versionInfo,
            colorInfo: quotation.vehicle.colorInfo,
          },
          amount:
            quotation.amount ||
            quotation.quotation?.finalPrice ||
            quotation.vehicle?.price ||
            0,
          status: "Draft",
          statusType: "draft",
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString(),
          // Additional fields for order
          deposit: quotation.quotation?.discountAmount || 0,
          finalPrice:
            quotation.quotation?.finalPrice ||
            quotation.vehicle?.price ||
            quotation.amount ||
            0,
          discount: quotation.quotation?.discount || 0,
          tax: 0, // Default tax
          quotation: quotation, // Thêm reference đến quotation gốc
        };

        console.log("📦 Created order data:", orderData);

        // Gọi callback để thêm order vào danh sách
        if (onConvertToOrder) {
          onConvertToOrder(orderData);
        }

        alert(
          `Báo giá đã được chuyển đổi thành đơn hàng thành công! Order ID: DH${orderId}`
        );

        // Đóng detail view sau khi convert thành công
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error("Không nhận được Order ID từ server");
      }
    } catch (error) {
      console.error("❌ Error converting quote to order:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config,
      });

      // Show detailed error message
      let errorMessage = "Có lỗi xảy ra khi chuyển đổi báo giá thành đơn hàng";

      if (error.response?.status === 401) {
        errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy báo giá hoặc endpoint không tồn tại.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message ||
          "Báo giá không thể chuyển đổi (có thể đã hết hạn hoặc chưa được ghi nhận)";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="quotation-detail-view">
      <div className="detail-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Chi tiết báo giá</h1>
            <p>Xem thông tin chi tiết báo giá #{quotation.id}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-layout">
          {/* Left Column - Details */}
          <div className="detail-left">
            <div className="detail-sections">
              {/* Customer Information */}
              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ và tên:</label>
                    <span>
                      {customerDetails?.fullName ||
                        quotation.customer.name ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>
                      {loadingCustomer ? (
                        <span className="loading-text">Đang tải...</span>
                      ) : (
                        customerDetails?.phone ||
                        quotation.customer.phone ||
                        "N/A"
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>
                      {loadingCustomer ? (
                        <span className="loading-text">Đang tải...</span>
                      ) : (
                        customerDetails?.email ||
                        quotation.customer.email ||
                        "Chưa cập nhật"
                      )}
                    </span>
                  </div>
                  {customerDetails?.address && (
                    <div className="info-item">
                      <label>Địa chỉ:</label>
                      <span>{customerDetails.address}</span>
                    </div>
                  )}
                  {customerDetails?.idNumber && (
                    <div className="info-item">
                      <label>CMND/CCCD:</label>
                      <span>{customerDetails.idNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Tên xe:</label>
                    <span className="vehicle-full-name">
                      {quotation.vehicle.name || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Mẫu xe:</label>
                    <span className="vehicle-model">
                      {quotation.vehicle.model || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Phiên bản:</label>
                    <span className="vehicle-version">
                      {quotation.vehicle.version || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Màu sắc:</label>
                    <span className="vehicle-color">
                      {quotation.vehicle.color || "N/A"}
                    </span>
                  </div>
                  {quotation.vehicle.versionInfo && (
                    <>
                      <div className="info-item">
                        <label>Tầm xa:</label>
                        <span className="vehicle-range">
                          {quotation.vehicle.versionInfo.range || "N/A"} km
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Gia tốc:</label>
                        <span className="vehicle-acceleration">
                          {quotation.vehicle.versionInfo.acceleration || "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Tốc độ tối đa:</label>
                        <span className="vehicle-topspeed">
                          {quotation.vehicle.versionInfo.topSpeed || "N/A"} km/h
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quotation Information */}
              <div className="detail-section">
                <h3>Thông tin báo giá</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>QuoteID:</label>
                    <span className="quotation-id">#{quotation.id}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <button
                      className={`status-button ${
                        isFinalized ? "finalized-btn" : "draft-btn"
                      }`}
                      disabled
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        {isFinalized ? (
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        ) : (
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        )}
                      </svg>
                      {isFinalized ? "Finalized" : "Draft"}
                    </button>
                  </div>
                  <div className="info-item">
                    <label>Ngày tạo:</label>
                    <span>{quotation.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="detail-right">
            <div className="quotation-summary">
              <h3>Chi tiết tính giá</h3>
              <div className="pricing-breakdown">
                <div className="breakdown-row">
                  <span>Giá trước giảm:</span>
                  <span>
                    {formatCurrency(
                      quotation.pricingDetails?.basePrice || quotation.amount
                    )}
                  </span>
                </div>
                <div className="breakdown-row">
                  <span>Giá sau giảm:</span>
                  <span>
                    {formatCurrency(
                      (quotation.pricingDetails?.basePrice ||
                        quotation.amount) -
                        (quotation.pricingDetails?.discountAmount ||
                          (quotation.amount * quotation.discount) / 100)
                    )}
                  </span>
                </div>
                <div className="breakdown-divider"></div>
                <div className="breakdown-row">
                  <span>Tổng giá:</span>
                  <span>
                    {formatCurrency(
                      ((quotation.pricingDetails?.basePrice ||
                        quotation.amount) -
                        (quotation.pricingDetails?.discountAmount ||
                          (quotation.amount * quotation.discount) / 100)) *
                        1.1
                    )}
                  </span>
                </div>
              </div>

              <div className="summary-actions">
                {console.log("🎯 Button state:", {
                  quotationId: quotation.id,
                  isSent,
                  isFinalized,
                  status: quotation.status,
                  lockedUntil: quotation.lockedUntil,
                })}
                <button
                  type="button"
                  className={`send-quotation-btn ${
                    isSent
                      ? isFinalized
                        ? "confirmed-btn"
                        : "confirm-btn"
                      : ""
                  }`}
                  onClick={handleSendQuotation}
                  disabled={isFinalized}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  {isFinalized
                    ? "Đã ghi nhận"
                    : isSent
                    ? "Ghi nhận báo giá"
                    : "Gửi báo giá"}
                </button>

                <button
                  type="button"
                  className={`convert-order-btn ${
                    !isFinalized ? "disabled" : ""
                  }`}
                  onClick={handleConvertToOrder}
                  disabled={!isFinalized}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
                  </svg>
                  Chuyển sang đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailView;
