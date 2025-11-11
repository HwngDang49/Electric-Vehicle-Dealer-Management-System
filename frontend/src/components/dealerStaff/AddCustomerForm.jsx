import React, { useMemo, useState } from "react";
import "./AddCustomerForm.css";
import customerApiService from "../../services/customerApi";

const AddCustomerForm = ({
  onClose,
  onAddCustomer,
  onError,
  onCreateQuotation,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // -----------------------
  // Helpers - Normalization
  // -----------------------
  const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

  const normalizeName = (value) => normalizeWhitespace(value);

  const normalizeEmail = (value) => normalizeWhitespace(value).toLowerCase();

  const normalizePhone = (value) => {
    // Keep digits only
    let digits = String(value || "").replace(/\D/g, "");
    // Convert +84 or 84 prefix to 0
    if (digits.startsWith("84")) {
      digits = "0" + digits.slice(2);
    }
    // Limit to max 10 digits (VN format)
    return digits.slice(0, 10);
  };

  const normalizeIdNumber = (value) => {
    // Keep digits only, max 12 (CMND 9 or CCCD 12)
    return String(value || "")
      .replace(/\D/g, "")
      .slice(0, 12);
  };

  // -----------------------
  // Validation
  // -----------------------
  const getValidationErrors = (data) => {
    const newErrors = {};

    const fullName = normalizeName(data.fullName);
    const phone = normalizePhone(data.phone);
    const rawEmail = data.email;
    const email = normalizeEmail(data.email);
    const idNumber = normalizeIdNumber(data.idNumber);
    const address = normalizeWhitespace(data.address);

    // Name: letters (including Vietnamese), spaces, dots, apostrophes, hyphens. Length 2-70
    const nameRegex = /^[A-Za-zÀ-ỿĐđ\s.'-]{2,70}$/u;
    if (!fullName) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (!nameRegex.test(fullName)) {
      newErrors.fullName =
        "Họ và tên chỉ gồm chữ cái và khoảng trắng (2-70 ký tự)";
    }

    // Phone: VN 10 digits, starts with 03/05/07/08/09
    const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;
    if (!phone) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ";
    }

    // Email: simple robust check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!rawEmail || !rawEmail.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (rawEmail !== rawEmail.trim()) {
      newErrors.email = "Email không được có khoảng trắng ở đầu/cuối";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // ID number: 9 (CMND) or 12 (CCCD) digits only
    if (!idNumber) {
      newErrors.idNumber = "Số CMND/CCCD là bắt buộc";
    } else if (!/^\d{9}$/.test(idNumber) && !/^\d{12}$/.test(idNumber)) {
      newErrors.idNumber = "CMND phải 9 số hoặc CCCD phải 12 số";
    }

    // Address: >= 5 characters after trimming
    if (!address) {
      newErrors.address = "Địa chỉ là bắt buộc";
    } else if (address.length < 5) {
      newErrors.address = "Địa chỉ quá ngắn";
    }

    return newErrors;
  };

  const isFormValid = useMemo(
    () => Object.keys(getValidationErrors(formData)).length === 0,
    [formData]
  );

  const setFieldError = (name, value) => {
    const draft = { ...formData, [name]: value };
    const validation = getValidationErrors(draft);
    setErrors((prev) => ({
      ...prev,
      [name]: validation[name] || "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Soft constraints while typing
    let nextValue = value;
    if (name === "phone") nextValue = normalizePhone(value);
    if (name === "idNumber") nextValue = normalizeIdNumber(value);
    if (name === "fullName" || name === "address") {
      // Block leading spaces while typing
      nextValue = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFieldError(name, nextValue);
  };

  const preventLeadingSpace = (e) => {
    if (e.key === " " && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    const newErrors = getValidationErrors(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let normalized = value;
    if (name === "fullName") normalized = normalizeName(value);
    // Do not auto-trim email on blur to let user see the error for spaces
    if (name === "phone") normalized = normalizePhone(value);
    if (name === "idNumber") normalized = normalizeIdNumber(value);
    if (name === "address") normalized = normalizeWhitespace(value);
    if (normalized !== value) {
      setFormData((prev) => ({ ...prev, [name]: normalized }));
    }
    setFieldError(name, normalized);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const customerPayload = {
      fullName: normalizeName(formData.fullName),
      phone: normalizePhone(formData.phone),
      email: normalizeEmail(formData.email),
      idNumber: normalizeIdNumber(formData.idNumber),
      address: normalizeWhitespace(formData.address),
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
      const msg =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo khách hàng. Vui lòng thử lại.";
      setErrors({
        submit: msg,
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
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
                onBlur={handleBlur}
                onKeyDown={preventLeadingSpace}
                placeholder="Nhập họ và tên"
                maxLength={70}
                className={errors.fullName ? "error" : ""}
              />
              {errors.fullName && (
                <span className="error-text">{errors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Nhập số điện thoại"
                inputMode="numeric"
                maxLength={10}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={preventLeadingSpace}
                placeholder="Nhập email"
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">Số CMND/CCCD *</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Nhập số CMND/CCCD"
                inputMode="numeric"
                maxLength={12}
                className={errors.idNumber ? "error" : ""}
              />
              {errors.idNumber && (
                <span className="error-text">{errors.idNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Địa chỉ *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={preventLeadingSpace}
                placeholder="Nhập địa chỉ"
                maxLength={200}
                className={errors.address ? "error" : ""}
              />
              {errors.address && (
                <span className="error-text">{errors.address}</span>
              )}
            </div>

            {errors.submit && (
              <div className="error-message">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
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
                disabled={isLoading || !isFormValid}
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
