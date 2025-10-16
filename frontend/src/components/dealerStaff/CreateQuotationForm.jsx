import React, { useState, useEffect } from "react";
import "./CreateQuotationForm.css";

const CreateQuotationForm = ({
  onClose,
  onSave,
  selectedCustomer = null,
  onBackToList,
}) => {
  const [formData, setFormData] = useState({
    customer: {
      name: "",
      phone: "",
      email: "",
      address: "",
      idNumber: "",
      id: "",
    },
    vehicle: {
      model: "",
      version: "",
      color: "",
      year: "",
      price: 0,
    },
    quotation: {
      discount: 0,
      notes: "",
      validUntil: "",
    },
  });

  // Update customer data when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      setFormData((prev) => ({
        ...prev,
        customer: {
          name: String(
            selectedCustomer.fullName || selectedCustomer.name || ""
          ),
          phone: String(selectedCustomer.phone || ""),
          email: String(selectedCustomer.email || ""),
          address: String(selectedCustomer.address || ""),
          idNumber: String(selectedCustomer.idNumber || ""),
          id: String(selectedCustomer.id || selectedCustomer.customerId || ""),
        },
        // Don't auto-fill vehicle data - let user choose
        vehicle: {
          model: "",
          version: "",
          color: "",
          year: "",
          price: 0,
        },
        quotation: {
          discount: 0,
          notes: "",
          validUntil: "",
        },
      }));
      console.log("CreateQuotationForm - Customer data loaded:", {
        selectedCustomer,
        mappedCustomer: {
          name: String(
            selectedCustomer.fullName || selectedCustomer.name || ""
          ),
          phone: String(selectedCustomer.phone || ""),
          email: String(selectedCustomer.email || ""),
          address: String(selectedCustomer.address || ""),
          idNumber: String(selectedCustomer.idNumber || ""),
          id: String(selectedCustomer.id || selectedCustomer.customerId || ""),
        },
      });
    }
  }, [selectedCustomer]);

  const [errors, setErrors] = useState({});

  // Mock vehicle data with models and versions
  const vehicleData = {
    "VinFast VF8": {
      name: "VinFast VF8",
      versions: [
        { name: "VF8 Eco", price: 765000000 },
        { name: "VF8 Plus", price: 1130000000 },
        { name: "VF8 Premium", price: 1350000000 },
      ],
      colors: [
        { name: "Trắng Ngọc Trai", hex: "#F5F5DC", image: "pearl-white.jpg" },
        { name: "Đen Huyền Bí", hex: "#2C2C2C", image: "mysterious-black.jpg" },
        { name: "Xanh Đại Dương", hex: "#0066CC", image: "ocean-blue.jpg" },
        { name: "Đỏ Ruby", hex: "#CC0000", image: "ruby-red.jpg" },
        { name: "Xám Titan", hex: "#808080", image: "titan-gray.jpg" },
      ],
    },
    "VinFast VF6": {
      name: "VinFast VF6",
      versions: [
        { name: "VF6 Eco", price: 700000000 },
        { name: "VF6 Plus", price: 850000000 },
        { name: "VF6 Premium", price: 950000000 },
      ],
      colors: [
        { name: "Trắng Ngọc Trai", hex: "#F5F5DC", image: "pearl-white.jpg" },
        { name: "Đen Huyền Bí", hex: "#2C2C2C", image: "mysterious-black.jpg" },
        { name: "Xanh Đại Dương", hex: "#0066CC", image: "ocean-blue.jpg" },
        { name: "Đỏ Ruby", hex: "#CC0000", image: "ruby-red.jpg" },
        { name: "Bạc Kim", hex: "#C0C0C0", image: "platinum-silver.jpg" },
      ],
    },
    "VinFast VF9": {
      name: "VinFast VF9",
      versions: [
        { name: "VF9 Plus", price: 1400000000 },
        { name: "VF9 Premium", price: 1650000000 },
        { name: "VF9 Luxury", price: 1850000000 },
      ],
      colors: [
        { name: "Trắng Ngọc Trai", hex: "#F5F5DC", image: "pearl-white.jpg" },
        { name: "Đen Huyền Bí", hex: "#2C2C2C", image: "mysterious-black.jpg" },
        { name: "Xanh Đại Dương", hex: "#0066CC", image: "ocean-blue.jpg" },
        { name: "Đỏ Ruby", hex: "#CC0000", image: "ruby-red.jpg" },
        { name: "Xám Titan", hex: "#808080", image: "titan-gray.jpg" },
        { name: "Bạc Kim", hex: "#C0C0C0", image: "platinum-silver.jpg" },
      ],
    },
    "VinFast VF5": {
      name: "VinFast VF5",
      versions: [
        { name: "VF5 Plus", price: 458000000 },
        { name: "VF5 Premium", price: 520000000 },
      ],
      colors: [
        { name: "Trắng Ngọc Trai", hex: "#F5F5DC", image: "pearl-white.jpg" },
        { name: "Đen Huyền Bí", hex: "#2C2C2C", image: "mysterious-black.jpg" },
        { name: "Xanh Đại Dương", hex: "#0066CC", image: "ocean-blue.jpg" },
        { name: "Đỏ Ruby", hex: "#CC0000", image: "ruby-red.jpg" },
      ],
    },
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  const handleVehicleModelSelect = (modelName) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        model: modelName,
        version: "", // Reset version when model changes
        color: "", // Reset color when model changes
        price: 0,
      },
    }));
  };

  const handleVehicleVersionSelect = (versionName) => {
    const selectedModel = vehicleData[formData.vehicle.model];
    const selectedVersion = selectedModel?.versions.find(
      (v) => v.name === versionName
    );

    console.log("CreateQuotationForm - Selected version:", versionName);
    console.log(
      "CreateQuotationForm - Selected version data:",
      selectedVersion
    );
    console.log("CreateQuotationForm - Version price:", selectedVersion?.price);

    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        version: versionName,
        color: "", // Reset color when version changes
        price: selectedVersion?.price || 0,
      },
    }));
  };

  const handleVehicleColorSelect = (colorName) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        color: colorName,
      },
    }));
  };

  const calculateFinalPrice = () => {
    const basePrice = formData.vehicle.price;
    const discountAmount = (basePrice * formData.quotation.discount) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const tax = priceAfterDiscount * 0.1; // 10% VAT
    return priceAfterDiscount + tax;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate customer info
    if (!formData.customer.name.trim()) {
      newErrors["customer.name"] = "Tên khách hàng là bắt buộc";
    }
    if (!formData.customer.phone.trim()) {
      newErrors["customer.phone"] = "Số điện thoại là bắt buộc";
    }

    // Validate vehicle info
    if (!formData.vehicle.model.trim()) {
      newErrors["vehicle.model"] = "Vui lòng chọn mẫu xe";
    }
    if (!formData.vehicle.version.trim()) {
      newErrors["vehicle.version"] = "Vui lòng chọn phiên bản xe";
    }
    if (!formData.vehicle.color.trim()) {
      newErrors["vehicle.color"] = "Vui lòng chọn màu xe";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const finalPrice = calculateFinalPrice();
      console.log("CreateQuotationForm - Vehicle data:", formData.vehicle);
      console.log(
        "CreateQuotationForm - Vehicle price:",
        formData.vehicle.price
      );
      console.log(
        "CreateQuotationForm - Vehicle version:",
        formData.vehicle.version
      );
      console.log(
        "CreateQuotationForm - Discount:",
        formData.quotation.discount
      );
      console.log("CreateQuotationForm - Final price:", finalPrice);

      const quotationData = {
        id: `BG${Date.now()}`,
        customer: formData.customer,
        vehicle: formData.vehicle,
        quotation: {
          ...formData.quotation,
          finalPrice: finalPrice,
          basePrice: formData.vehicle.price,
          discountAmount:
            (formData.vehicle.price * formData.quotation.discount) / 100,
        },
        status: "Đang soạn",
        createdAt: new Date().toISOString().split("T")[0],
      };

      console.log("CreateQuotationForm - Quotation data:", quotationData);
      console.log("CreateQuotationForm - Quotation structure check:", {
        quotation: quotationData.quotation,
        vehicle: quotationData.vehicle,
        finalPrice: quotationData.quotation?.finalPrice,
        vehiclePrice: quotationData.vehicle?.price,
      });
      onSave(quotationData);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="create-quotation-form">
      <div className="form-wrapper">
        <div className="form-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Tạo báo giá mới</h1>
              <p>Tạo báo giá cho khách hàng mới</p>
            </div>
          </div>
        </div>

        <div className="back-button-container">
          <button type="button" className="back-btn" onClick={onBackToList}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Quay lại
          </button>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="quotation-form">
            <div className="form-content">
              <div className="form-left">
                <div className="form-sections">
                  {/* Customer Information */}
                  <div className="form-section">
                    <h3>Thông tin khách hàng</h3>
                    <div className="customer-form-layout">
                      <div className="customer-row">
                        <div className="form-group">
                          <label htmlFor="customer-name">Họ và tên *</label>
                          <input
                            type="text"
                            id="customer-name"
                            value={formData.customer.name}
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                "name",
                                e.target.value
                              )
                            }
                            className={errors["customer.name"] ? "error" : ""}
                          />
                          {errors["customer.name"] && (
                            <span className="error-message">
                              {errors["customer.name"]}
                            </span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="customer-phone">
                            Số điện thoại *
                          </label>
                          <input
                            type="tel"
                            id="customer-phone"
                            value={formData.customer.phone}
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                "phone",
                                e.target.value
                              )
                            }
                            className={errors["customer.phone"] ? "error" : ""}
                          />
                          {errors["customer.phone"] && (
                            <span className="error-message">
                              {errors["customer.phone"]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="customer-row">
                        <div className="form-group">
                          <label htmlFor="customer-email">Email</label>
                          <input
                            type="email"
                            id="customer-email"
                            value={formData.customer.email}
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                "email",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="form-section">
                    <h3>Chọn xe</h3>
                    <div className="vehicle-selection">
                      {/* Step 1: Select Vehicle Model */}
                      <div className="form-group">
                        <label htmlFor="vehicle-model">Mẫu xe *</label>
                        <select
                          id="vehicle-model"
                          value={formData.vehicle.model}
                          onChange={(e) =>
                            handleVehicleModelSelect(e.target.value)
                          }
                          className={errors["vehicle.model"] ? "error" : ""}
                        >
                          <option value="">-- Chọn mẫu xe --</option>
                          {Object.keys(vehicleData).map((modelName) => (
                            <option key={modelName} value={modelName}>
                              {modelName}
                            </option>
                          ))}
                        </select>
                        {errors["vehicle.model"] && (
                          <span className="error-message">
                            {errors["vehicle.model"]}
                          </span>
                        )}
                      </div>

                      {/* Step 2: Select Vehicle Version */}
                      {formData.vehicle.model && (
                        <div className="form-group">
                          <label htmlFor="vehicle-version">Phiên bản *</label>
                          <select
                            id="vehicle-version"
                            value={formData.vehicle.version}
                            onChange={(e) =>
                              handleVehicleVersionSelect(e.target.value)
                            }
                            className={errors["vehicle.version"] ? "error" : ""}
                          >
                            <option value="">-- Chọn phiên bản --</option>
                            {vehicleData[formData.vehicle.model]?.versions.map(
                              (version) => (
                                <option key={version.name} value={version.name}>
                                  {version.name} -{" "}
                                  {formatCurrency(version.price)}
                                </option>
                              )
                            )}
                          </select>
                          {errors["vehicle.version"] && (
                            <span className="error-message">
                              {errors["vehicle.version"]}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Step 3: Select Vehicle Color */}
                      {formData.vehicle.version && (
                        <div className="form-group">
                          <label htmlFor="vehicle-color">Màu sắc *</label>
                          <div className="color-options">
                            {vehicleData[formData.vehicle.model]?.colors.map(
                              (color) => (
                                <label
                                  key={color.name}
                                  className={`color-option ${
                                    formData.vehicle.color === color.name
                                      ? "selected"
                                      : ""
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="vehicle-color"
                                    value={color.name}
                                    checked={
                                      formData.vehicle.color === color.name
                                    }
                                    onChange={(e) =>
                                      handleVehicleColorSelect(e.target.value)
                                    }
                                    className="color-radio"
                                  />
                                  <div className="color-content">
                                    <div
                                      className="color-swatch"
                                      style={{ backgroundColor: color.hex }}
                                    >
                                      <div className="color-check">
                                        {formData.vehicle.color ===
                                          color.name && (
                                          <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="white"
                                          >
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <div className="color-info">
                                      <span className="color-name">
                                        {color.name}
                                      </span>
                                      <span className="color-price">
                                        Miễn phí
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              )
                            )}
                          </div>
                          {errors["vehicle.color"] && (
                            <span className="error-message">
                              {errors["vehicle.color"]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quotation Information */}
                  <div className="form-section">
                    <h3>Thông tin báo giá</h3>
                    <div className="quotation-form-layout">
                      <div className="form-group">
                        <label htmlFor="quotation-discount">Giảm giá (%)</label>
                        <input
                          type="number"
                          id="quotation-discount"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.quotation.discount}
                          onChange={(e) =>
                            handleInputChange(
                              "quotation",
                              "discount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="quotation-notes">Ghi chú</label>
                        <textarea
                          id="quotation-notes"
                          rows="3"
                          value={formData.quotation.notes}
                          onChange={(e) =>
                            handleInputChange(
                              "quotation",
                              "notes",
                              e.target.value
                            )
                          }
                          placeholder="Nhập ghi chú cho báo giá..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Price Summary */}
              <div className="form-right">
                <div className="price-summary-card">
                  <h3>Tóm tắt báo giá</h3>
                  <div className="price-breakdown">
                    {formData.vehicle.model && (
                      <div className="price-row">
                        <span>Xe:</span>
                        <span>
                          {formData.vehicle.model} {formData.vehicle.version}
                        </span>
                      </div>
                    )}
                    {formData.vehicle.color && (
                      <div className="price-row">
                        <span>Màu sắc:</span>
                        <span>{formData.vehicle.color}</span>
                      </div>
                    )}
                    <div className="price-row">
                      <span>Giá cơ bản:</span>
                      <span>{formatCurrency(formData.vehicle.price)}</span>
                    </div>
                    {formData.quotation.discount > 0 && (
                      <>
                        <div className="price-row">
                          <span>
                            Giảm giá ({formData.quotation.discount}%):
                          </span>
                          <span className="discount-amount">
                            -
                            {formatCurrency(
                              (formData.vehicle.price *
                                formData.quotation.discount) /
                                100
                            )}
                          </span>
                        </div>
                        <div className="price-row">
                          <span>Thuế (10%):</span>
                          <span>
                            {formatCurrency(formData.vehicle.price * 0.1)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="price-divider"></div>
                    <div className="price-row total">
                      <span>Thành tiền:</span>
                      <span className="final-price">
                        {formatCurrency(calculateFinalPrice())}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Pricing Breakdown */}
                  {formData.vehicle.price > 0 && (
                    <div className="detailed-pricing">
                      <h4>Chi tiết giá</h4>
                      <div className="pricing-details">
                        <div className="detail-row">
                          <span>Giá gốc:</span>
                          <span>{formatCurrency(formData.vehicle.price)}</span>
                        </div>
                        {formData.quotation.discount > 0 && (
                          <div className="detail-row">
                            <span>
                              Giảm giá ({formData.quotation.discount}%):
                            </span>
                            <span className="discount">
                              -
                              {formatCurrency(
                                (formData.vehicle.price *
                                  formData.quotation.discount) /
                                  100
                              )}
                            </span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span>Giá sau giảm:</span>
                          <span>
                            {formatCurrency(
                              formData.vehicle.price -
                                (formData.vehicle.price *
                                  formData.quotation.discount) /
                                  100
                            )}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span>Thuế VAT (10%):</span>
                          <span>
                            {formatCurrency(
                              (formData.vehicle.price -
                                (formData.vehicle.price *
                                  formData.quotation.discount) /
                                  100) *
                                0.1
                            )}
                          </span>
                        </div>
                        <div className="detail-divider"></div>
                        <div className="detail-row final">
                          <span>Tổng cộng:</span>
                          <span className="final-amount">
                            {formatCurrency(calculateFinalPrice())}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="save-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
                Tạo báo giá
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationForm;
