import React, { useState } from "react";
import "./AddCustomerForm.css";
import customerApiService from "../../services/customerApi";

const AddCustomerForm = ({ onClose, onAddCustomer, onError, onCreateQuotation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

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

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const customerPayload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.replace(/\s/g, ""),
      email: formData.email.trim(),
      idNumber: formData.idNumber.replace(/\s/g, ""),
      address: formData.address.trim(),
    };

    try {
      const resp = await customerApiService.createCustomer(customerPayload);
      const dto = resp?.data ?? {};
      const newCustomerData = {
        id: dto.customerId ?? dto.CustomerId,
        fullName: customerPayload.fullName,
        phone: customerPayload.phone,
        email: customerPayload.email,
        idNumber: customerPayload.idNumber,
        address: customerPayload.address,
        status: dto.status ?? "Contact",
        createdAt: dto.createdAt ?? dto.CreatedAt ?? new Date().toISOString(),
      };

      // Close modal immediately and show toast in CustomerManagement
      onAddCustomer?.(newCustomerData);
    } catch (error) {
      console.error("CreateCustomer error:", error?.response?.data || error);
      const msg = error?.response?.data?.errors?.[0] || error?.response?.data?.errors || error?.response?.data?.message || error?.message || "Không thể tạo khách hàng. Vui lòng thử lại.";
      setErrors({
        submit: msg
      });
      // Pass error to parent to show toast
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };


  // Main Form Modal
  return (
    <div className="dealer-staff-add-customer-form">

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo khách hàng mới</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              className={errors.fullName ? "error" : ""}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className={errors.phone ? "error" : ""}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="idNumber">Số CMND/CCCD *</label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              placeholder="Nhập số CMND/CCCD"
              className={errors.idNumber ? "error" : ""}
            />
            {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ"
              className={errors.address ? "error" : ""}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {errors.submit && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo..." : "Tạo khách hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddCustomerForm;
