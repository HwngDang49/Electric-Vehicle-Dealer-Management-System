import React, { useState } from "react";
import "./AddCustomerForm.css";

const AddCustomerForm = ({ onClose, onAddCustomer, onCreateQuotation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    idCard: "",
    occupation: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const newCustomer = {
        id: Date.now(), // Simple ID generation
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        idCard: formData.idCard,
        occupation: formData.occupation,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        lastContact: new Date().toISOString().split("T")[0],
      };

      onAddCustomer(newCustomer);
      setShowSuccessMessage(true);
    }
  };

  const handleCreateQuotation = () => {
    const newCustomer = {
      id: Date.now(),
      name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth,
      idCard: formData.idCard,
      occupation: formData.occupation,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
    };

    if (onCreateQuotation) {
      onCreateQuotation(newCustomer);
    }
    onClose();
  };

  const handleBackToList = () => {
    onClose();
  };

  const handleCalendarClick = () => {
    const dateInput = document.getElementById("dateOfBirth");
    if (dateInput) {
      dateInput.focus();
      dateInput.showPicker && dateInput.showPicker();
    }
  };

  // Show success message with options
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
        </div>
      </div>
    );
  }

  return (
    <div className="add-customer-overlay">
      <div className="add-customer-container add-customer-form">
        <div className="form-header">
          <button className="back-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Quay lại
          </button>
          <div className="header-content">
            <h1>Tạo thông tin khách hàng mới</h1>
            <p>Nhập thông tin khách hàng một lần duy nhất</p>
          </div>
        </div>

        <div className="form-container">
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.5-1.85 1.26L14 15h2v7h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.15-3.26A1.5 1.5 0 0 0 6.54 8H5.46c-.8 0-1.54.5-1.85 1.26L2.5 15H5v7h2.5z" />
                </svg>
              </div>
              <h2>Thông tin khách hàng</h2>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
              <div className="form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
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
                      aria-label="Họ và tên"
                      aria-required="true"
                      aria-invalid={errors.fullName ? "true" : "false"}
                    />
                    {errors.fullName && (
                      <span className="error-message">{errors.fullName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
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

                  <div className="form-group">
                    <label htmlFor="dateOfBirth" className="form-label">
                      Ngày sinh
                    </label>
                    <div className="date-input-container">
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="calendar-icon"
                        onClick={handleCalendarClick}
                      >
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="idCard" className="form-label">
                      CCCD/CMND
                    </label>
                    <input
                      type="text"
                      id="idCard"
                      name="idCard"
                      value={formData.idCard}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Nhập số CCCD/CMND"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="occupation" className="form-label">
                      Nghề nghiệp
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Nhập nghề nghiệp"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="address" className="form-label">
                      Địa chỉ <span className="required">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-textarea ${
                        errors.address ? "error" : ""
                      }`}
                      placeholder="Nhập địa chỉ"
                      rows="3"
                    />
                    {errors.address && (
                      <span className="error-message">{errors.address}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Hủy
                </button>
                <button type="submit" className="save-btn">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerForm;
