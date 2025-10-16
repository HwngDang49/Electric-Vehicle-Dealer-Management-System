import React, { useState } from "react";
import "./AddCustomerForm.css";

// Import các service cần thiết
import customerApiService from "../../services/customerApi"; // Đảm bảo tên file là customerApi.js
import authService from "../../services/AuthService";

const AddCustomerForm = ({ onClose, onAddCustomer, onCreateQuotation }) => {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    address: "",
  });

  // State quản lý các lỗi
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(""); // Lỗi trả về từ server
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null); // Lưu khách hàng sau khi tạo thành công

  // Cập nhật state khi người dùng nhập liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Kiểm tra dữ liệu form trước khi gửi
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Họ và tên là bắt buộc";
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "Số CMND/CCCD là bắt buộc";
    } else if (!/^[0-9]{9,12}$/.test(formData.idNumber.replace(/\s/g, ""))) {
      newErrors.idNumber = "Số CMND/CCCD không hợp lệ";
    }
    if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi người dùng nhấn nút "Lưu thông tin"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (validateForm()) {
      setIsLoading(true);

      const customerPayload = {
        dealerId: parseInt(authService.getDealerId(), 10), // Lấy dealerId tự động
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        idNumber: formData.idNumber,
        address: formData.address,
        status: "Contact",
      };

      try {
        const result = await customerApiService.createCustomer(customerPayload);
        const newCustomerData = {
          id: result.customer_id,
          ...customerPayload,
        };

        setCreatedCustomer(newCustomerData);
        onAddCustomer(newCustomerData);
        setShowSuccessMessage(true);
      } catch (error) {
        setApiError(
          error.message || "Tạo khách hàng thất bại. Vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xử lý khi người dùng chọn "Tạo báo giá" sau khi thành công
  const handleCreateQuotation = () => {
    if (onCreateQuotation && createdCustomer) {
      onCreateQuotation(createdCustomer);
    }
    onClose();
  };

  // Xử lý khi người dùng chọn "Quay lại danh sách"
  const handleBackToList = () => {
    onClose();
  };

  // Render màn hình thông báo thành công
  if (showSuccessMessage) {
    return (
      <div className="add-customer-overlay">
        <div className="add-customer-container">
          <div className="success-message">
            <div className="success-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2>Khách hàng đã được tạo thành công!</h2>
            <p>Bạn có muốn tạo báo giá cho khách hàng này không?</p>
            <div className="success-actions">
              <button className="back-btn" onClick={handleBackToList}>
                Quay lại danh sách
              </button>
              <button
                className="create-quotation-btn"
                onClick={handleCreateQuotation}
              >
                Tạo báo giá
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render form chính
  return (
    <div className="add-customer-overlay">
      <div className="add-customer-container add-customer-form">
        <div className="form-header">
          <button className="back-btn" onClick={onClose}>
            {/* SVG icon back */}
          </button>
          <div className="header-content">
            <h1>Tạo thông tin khách hàng mới</h1>
            <p>Nhập thông tin khách hàng một lần duy nhất</p>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-fields">
              {/* Hàng 1: Họ và tên */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? "error" : ""}`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>
              </div>

              {/* Hàng 2: Điện thoại và Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>
              </div>

              {/* Hàng 3: CMND/CCCD và Địa chỉ */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="idNumber">
                    Số CMND/CCCD <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.idNumber ? "error" : ""}`}
                    placeholder="Nhập số CMND/CCCD"
                  />
                  {errors.idNumber && (
                    <span className="error-message">{errors.idNumber}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="address">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`form-input ${errors.address ? "error" : ""}`}
                    placeholder="Nhập địa chỉ"
                  />
                  {errors.address && (
                    <span className="error-message">{errors.address}</span>
                  )}
                </div>
              </div>
            </div>

            {apiError && <div className="api-error-message">{apiError}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button type="submit" className="save-btn" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerForm;
