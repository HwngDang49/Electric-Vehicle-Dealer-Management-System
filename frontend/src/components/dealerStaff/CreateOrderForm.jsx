import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import productApiService from "../../services/productApi";
import pricebookApiService from "../../services/pricebookApi";
import promotionService from "../../services/promotionService";
import orderApiService from "../../services/orderApiService";
import CustomDropdown from "./CustomDropdown";
import "./CreateQuotationForm.css";

const CreateOrderForm = ({
  onClose,
  onSave,
  selectedCustomer = null,
  onBackToList,
  onNavigateToOrders,
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [activePricebook, setActivePricebook] = useState(null);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [applicablePromotions, setApplicablePromotions] = useState([]);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

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
      price: 0,
      productId: null,
    },
    order: {
      notes: "",
    },
  });

  const [errors, setErrors] = useState({});

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
      }));
    }
  }, [selectedCustomer]);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductLoading(true);
        console.log("🔄 Loading products from API...");
        const response = await productApiService.getAllProducts();
        console.log("📋 Products API Response:", response);

        if (response && response.data) {
          setProducts(response.data);
          console.log("✅ Products loaded successfully:", response.data.length);
        } else {
          console.warn("⚠️ No products data in response");
          setProducts([]);
        }
      } catch (error) {
        console.error("❌ Error loading products:", error);
        setProducts([]);
      } finally {
        setProductLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load active pricebook for base prices
  useEffect(() => {
    const loadActivePricebook = async () => {
      try {
        const res = await pricebookApiService.getActivePricebook();
        console.log("📘 Active pricebook:", res);
        setActivePricebook(res?.data || null);
      } catch (e) {
        console.warn("⚠️ Không tải được active pricebook", e);
        setActivePricebook(null);
      }
    };
    loadActivePricebook();
  }, []);

  // Process real product data from API
  const vehicleData = useMemo(() => {
    if (!products || products.length === 0) return {};

    const processedData = {};

    products.forEach((product) => {
      const modelKey = product.modelCode || "Unknown Model";

      if (!processedData[modelKey]) {
        processedData[modelKey] = {
          name: modelKey,
          versions: [],
        };
      }

      // Add version if not exists
      const versionExists = processedData[modelKey].versions.find(
        (v) => v.name === product.variantCode
      );
      if (!versionExists && product.variantCode) {
        processedData[modelKey].versions.push({
          name: product.variantCode,
          price: 0,
          productId: product.productId,
          colors: [], // ✅ Colors are now per version, not per model
        });
      }

      // ✅ Add color to the specific version (not to model level)
      if (product.variantCode && product.colorName) {
        const version = processedData[modelKey].versions.find(
          (v) => v.name === product.variantCode
        );
        if (version) {
          const colorExists = version.colors.find(
            (c) => c.name === product.colorName
          );
          if (!colorExists) {
            version.colors.push({
              name: product.colorName,
              hex: product.colorCode || "#808080",
            });
          }
        }
      }
    });

    // Enrich prices from active pricebook if available
    if (activePricebook) {
      const items =
        activePricebook.items ||
        activePricebook.pricebookItems ||
        activePricebook.PricebookItems ||
        activePricebook.Items ||
        [];

      if (Array.isArray(items)) {
        const priceMap = new Map();
        const mvMap = new Map();
        items.forEach((it) => {
          const pid = Number(it.productId ?? it.ProductId);
          const price = Number(
            it.msrpPrice ??
              it.MsrpPrice ??
              it.msrp_price ??
              it.floorPrice ??
              it.FloorPrice ??
              0
          );
          if (!Number.isNaN(pid)) priceMap.set(pid, price);
          const model = String(
            it.modelCode ?? it.ModelCode ?? ""
          ).toUpperCase();
          const variant = String(
            it.variantCode ?? it.VariantCode ?? ""
          ).toUpperCase();
          if (model && variant) mvMap.set(`${model}|${variant}`, price);
        });

        Object.keys(processedData).forEach((modelKey) => {
          const normModel = String(modelKey).toUpperCase();
          processedData[modelKey].versions = processedData[
            modelKey
          ].versions.map((v) => {
            const byPid = priceMap.get(Number(v.productId));
            const key = `${normModel}|${String(v.name).toUpperCase()}`;
            const byMv = mvMap.get(key);
            return {
              ...v,
              price: byPid ?? byMv ?? v.price ?? 0,
            };
          });
        });
      }
    }

    return processedData;
  }, [products, activePricebook]);

  // Build price map by productId from active pricebook
  const priceByProductId = useMemo(() => {
    const map = new Map();
    if (!activePricebook) return map;
    const items =
      activePricebook.items ||
      activePricebook.pricebookItems ||
      activePricebook.PricebookItems ||
      activePricebook.Items ||
      [];
    items.forEach((it) => {
      const pid = Number(it.productId ?? it.ProductId);
      const price = Number(
        it.msrpPrice ??
          it.MsrpPrice ??
          it.msrp_price ??
          it.floorPrice ??
          it.FloorPrice ??
          0
      );
      if (!Number.isNaN(pid)) map.set(pid, price);
    });
    return map;
  }, [activePricebook]);

  const getMatchingProductId = (modelName, versionName, colorName) => {
    if (!Array.isArray(products)) return null;
    const norm = (s) =>
      String(s || "")
        .toUpperCase()
        .trim();
    const model = norm(modelName);
    const variant = norm(versionName);
    const color = norm(colorName);
    const matched = products.find((p) => {
      if (norm(p.modelCode) !== model) return false;
      if (norm(p.variantCode) !== variant) return false;
      if (color)
        return norm(p.colorName) === color || norm(p.colorCode) === color;
      return true;
    });
    return matched?.productId ?? null;
  };

  const updatePriceFromSelection = (modelName, versionName, colorName) => {
    const pid = getMatchingProductId(modelName, versionName, colorName);
    const priceFromPid = pid
      ? Number(priceByProductId.get(Number(pid)) ?? 0)
      : 0;

    if (priceFromPid > 0) return priceFromPid;

    const norm = (s) =>
      String(s || "")
        .toUpperCase()
        .trim();
    const model = norm(modelName);
    const variant = norm(versionName);
    const items =
      activePricebook?.items ||
      activePricebook?.pricebookItems ||
      activePricebook?.Items ||
      activePricebook?.PricebookItems ||
      [];
    const hit = Array.isArray(items)
      ? items.find(
          (it) =>
            norm(it.modelCode ?? it.ModelCode) === model &&
            norm(it.variantCode ?? it.VariantCode) === variant
        )
      : null;
    const fallbackPrice = Number(
      hit?.msrpPrice ??
        hit?.MsrpPrice ??
        hit?.msrp_price ??
        hit?.floorPrice ??
        hit?.FloorPrice ??
        0
    );
    return fallbackPrice;
  };

  const handleVehicleModelSelect = (modelName) => {
    // Reset promotions when model changes
    setPromotionDiscount(0);
    setApplicablePromotions([]);
    
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        model: modelName,
        version: "",
        color: "",
        price: 0,
        productId: null,
      },
    }));
  };

  const handleVehicleVersionSelect = async (versionName) => {
    const selectedModel = vehicleData[formData.vehicle.model];
    const selectedVersion = selectedModel?.versions.find(
      (v) => v.name === versionName
    );

    console.log("CreateOrderForm - Selected version:", versionName);
    console.log("CreateOrderForm - Selected version data:", selectedVersion);

    // Fetch applicable promotions for this product
    if (selectedVersion?.productId) {
      try {
        const promotionData = await promotionService.getApplicablePromotions(
          selectedVersion.productId
        );
        console.log("📢 Applicable promotions RAW:", promotionData);
        
        // API returns nested structure: {data: {data: {...}}}
        const responseData = promotionData?.data?.data || promotionData?.data || promotionData?.value || promotionData;
        console.log("📢 Final responseData:", responseData);
        
        const totalDiscount = responseData?.totalDiscount || 0;
        const promotions = responseData?.promotions || [];
        
        console.log("📢 totalDiscount:", totalDiscount);
        console.log("📢 promotions array:", promotions);
        
        setPromotionDiscount(totalDiscount);
        setApplicablePromotions(promotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotionDiscount(0);
        setApplicablePromotions([]);
      }
    } else {
      setPromotionDiscount(0);
      setApplicablePromotions([]);
    }

    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        version: versionName,
        color: "",
        price: updatePriceFromSelection(
          formData.vehicle.model,
          versionName,
          ""
        ),
        productId: selectedVersion?.productId || null,
      },
    }));
  };

  const handleVehicleColorSelect = async (colorName) => {
    const updatedPrice = updatePriceFromSelection(
      formData.vehicle.model,
      formData.vehicle.version,
      colorName
    );

    const productId = getMatchingProductId(
      formData.vehicle.model,
      formData.vehicle.version,
      colorName
    );

    // Fetch promotions for the new productId
    if (productId) {
      try {
        const promotionData = await promotionService.getApplicablePromotions(productId);
        console.log("📢 Applicable promotions (after color change) RAW:", promotionData);
        
        // API returns nested structure: {data: {data: {...}}}
        const responseData = promotionData?.data?.data || promotionData?.data || promotionData?.value || promotionData;
        console.log("📢 Final responseData (after color):", responseData);
        
        const totalDiscount = responseData?.totalDiscount || 0;
        const promotions = responseData?.promotions || [];
        
        console.log("📢 totalDiscount (after color):", totalDiscount);
        console.log("📢 promotions array (after color):", promotions);
        
        setPromotionDiscount(totalDiscount);
        setApplicablePromotions(promotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotionDiscount(0);
        setApplicablePromotions([]);
      }
    }

    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        color: colorName,
        price: updatedPrice,
        productId: productId,
      },
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount) || 0);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer.id) newErrors["customer.id"] = "Thiếu mã khách hàng";
    if (!formData.customer.name.trim())
      newErrors["customer.name"] = "Tên khách hàng là bắt buộc";
    if (!formData.customer.phone.trim())
      newErrors["customer.phone"] = "Số điện thoại là bắt buộc";
    if (!formData.vehicle.model)
      newErrors["vehicle.model"] = "Vui lòng chọn mẫu xe";
    if (!formData.vehicle.version)
      newErrors["vehicle.version"] = "Vui lòng chọn phiên bản";
    if (!formData.vehicle.color)
      newErrors["vehicle.color"] = "Vui lòng chọn màu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFinalPrice = () => {
    const basePrice = formData.vehicle.price || 0;
    const discount = promotionDiscount || 0;
    return basePrice - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!formData.vehicle.productId) {
        showToast("error", "Không thể xác định sản phẩm. Vui lòng chọn lại xe.");
        setLoading(false);
        return;
      }

      const productId = formData.vehicle.productId;
      const customerId = parseInt(formData.customer.id);

      if (!customerId || customerId <= 0) {
        showToast("error", "Thông tin khách hàng không hợp lệ. Vui lòng chọn khách hàng.");
        setLoading(false);
        return;
      }

      console.log("🚀 Creating order with:", { customerId, productId });

      const response = await orderApiService.createOrder({
        CustomerId: customerId,
        ProductId: productId,
        Quantity: 1,
      });

      console.log("✅ Order created successfully:", response);

      const backendOrderData = response?.value || response?.data || response;

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${today.getFullYear()}`;

      const newOrder = {
        id: `DH${backendOrderData.orderId || Date.now()}`,
        backendId: backendOrderData.orderId,
        customer: {
          name: formData.customer.name,
          phone: formData.customer.phone,
          id: customerId,
        },
        vehicle: {
          name: `${formData.vehicle.model} ${formData.vehicle.version}`.trim(),
          color: formData.vehicle.color,
        },
        amount: calculateFinalPrice(),
        status: backendOrderData.status || "Draft",
        statusType: (backendOrderData.status || "draft").toLowerCase(),
        date: dateStr,
        createdAt: backendOrderData.createdAt,
      };

      console.log("📦 Order object for UI:", newOrder);

      if (onSave) onSave(newOrder);

      // Get order ID for toast message
      const orderId = backendOrderData.orderCode || newOrder.id || `DH${backendOrderData.orderId}`;

      // Navigate to OrderManagement with toast message
      if (onNavigateToOrders) {
        onNavigateToOrders({
          type: "success",
          message: `Đơn hàng '${orderId}' được tạo thành công`,
        });
      } else {
        // Fallback: show toast and close modal
        showToast("success", `Đơn hàng '${orderId}' được tạo thành công`);
        setTimeout(() => {
          if (onClose) onClose();
        }, 500);
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo đơn hàng";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dealer-staff-create-quote-form">
      {toast && ReactDOM.createPortal(
        <div className={`quote-toast ${toast.type === 'error' ? 'quote-toast-error' : ''}`}>
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {toast.type === 'error' ? (<path d="M18 6L6 18M6 6l12 12" />) : (<path d="M20 6L9 17l-5-5" />)}
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.type === 'error' ? 'Thất bại' : 'Thành công'}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div className="toast-progress"></div>
        </div>, document.body)}

      <div className="quotation-modal-overlay" onClick={onClose}>
        <div
          className="quotation-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Tạo đơn hàng mới</h2>
            <button className="close-btn" onClick={onClose} type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-content">
              <div className="form-left">
                {/* Customer Information */}
                <div className="form-section">
                  <h3>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    Thông tin khách hàng
                  </h3>
                  <div className="form-section-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="customer-name">Họ và tên *</label>
                        <input
                          type="text"
                          id="customer-name"
                          value={formData.customer.name}
                          onChange={(e) =>
                            handleInputChange("customer", "name", e.target.value)
                          }
                          placeholder="Nhập họ và tên"
                          className={errors["customer.name"] ? "error" : ""}
                        />
                        {errors["customer.name"] && (
                          <span className="error-text">
                            {errors["customer.name"]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="customer-phone">Số điện thoại *</label>
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
                          placeholder="Nhập số điện thoại"
                          className={errors["customer.phone"] ? "error" : ""}
                        />
                        {errors["customer.phone"] && (
                          <span className="error-text">
                            {errors["customer.phone"]}
                          </span>
                        )}
                      </div>
                    </div>

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
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="form-section">
                  <h3>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-1.086-2h2.202zm-1.441 3.506c.639 1.186.946 2.252.946 3.666 0 1.414-.874 2.828-2.475 2.828h-.141v1c0 .276-.224.5-.5.5h-1c-.276 0-.5-.224-.5-.5v-1h-15.232v1c0 .276-.224.5-.5.5h-1c-.276 0-.5-.224-.5-.5v-1h-.141c-1.601 0-2.475-1.414-2.475-2.828 0-1.414.307-2.48.946-3.666.302-.558.688-1.032 1.146-1.46l-1.031-2.416C.505 4.788.224 4.5 0 4.5c0-.276.224-.5.5-.5h1.502l.99 2.316c.838-.418 1.87-.616 3.122-.616h11.772c1.252 0 2.284.198 3.122.616l.99-2.316h1.502c.276 0 .5.224.5.5zM3.5 17c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5S2 14.672 2 15.5 2.672 17 3.5 17zm17 0c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z" />
                    </svg>
                    Chọn xe
                  </h3>
                  <div className="form-section-body">
                    {/* Vehicle Model & Version - Same Row */}
                    <div className="form-row-inline">
                      {/* Step 1: Select Vehicle Model */}
                      <div className="form-group">
                        <label htmlFor="vehicle-model">Mẫu xe *</label>
                        <CustomDropdown
                          value={formData.vehicle.model}
                          onChange={handleVehicleModelSelect}
                          options={[
                            {
                              value: "",
                              label: productLoading
                                ? "Đang tải dữ liệu..."
                                : "-- Chọn mẫu xe --",
                              icon: "🚗",
                            },
                            ...Object.keys(vehicleData).map((modelName) => ({
                              value: modelName,
                              label: modelName,
                              icon: "🚗",
                            })),
                          ]}
                          placeholder="-- Chọn mẫu xe --"
                          icon="🚗"
                          disabled={productLoading}
                        />
                        {errors["vehicle.model"] && (
                          <span className="error-text">
                            {errors["vehicle.model"]}
                          </span>
                        )}
                      </div>

                      {/* Step 2: Select Vehicle Version */}
                      <div className="form-group">
                        <label htmlFor="vehicle-version">Phiên bản *</label>
                        <CustomDropdown
                          value={formData.vehicle.version}
                          onChange={handleVehicleVersionSelect}
                          options={[
                            {
                              value: "",
                              label: formData.vehicle.model
                                ? "-- Chọn phiên bản --"
                                : "Chọn mẫu xe trước",
                              icon: "⚙️",
                            },
                            ...(vehicleData[formData.vehicle.model]?.versions ||
                              []
                            ).map((version) => ({
                              value: version.name,
                              label: version.name,
                              icon: "⚙️",
                            })),
                          ]}
                          placeholder="-- Chọn phiên bản --"
                          icon="⚙️"
                          disabled={!formData.vehicle.model}
                        />
                        {errors["vehicle.version"] && (
                          <span className="error-text">
                            {errors["vehicle.version"]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Select Vehicle Color */}
                    {formData.vehicle.version && (
                      <div className="form-group">
                        <label htmlFor="vehicle-color">Màu sắc *</label>
                        <div className="color-options">
                          {/* ✅ Filter colors by selected model + version */}
                          {(() => {
                            const selectedModel = vehicleData[formData.vehicle.model];
                            const selectedVersion = selectedModel?.versions.find(
                              (v) => v.name === formData.vehicle.version
                            );
                            const availableColors = selectedVersion?.colors || [];
                            return availableColors.map((color) => (
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
                                    <span className="color-price">Miễn phí</span>
                                  </div>
                                </div>
                              </label>
                            ));
                          })()}
                        </div>
                        {errors["vehicle.color"] && (
                          <span className="error-text">
                            {errors["vehicle.color"]}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Ghi chú */}
                    <div className="form-group">
                      <label htmlFor="order-notes">Ghi chú</label>
                      <textarea
                        id="order-notes"
                        rows="3"
                        value={formData.order.notes}
                        onChange={(e) =>
                          handleInputChange("order", "notes", e.target.value)
                        }
                        placeholder="Ghi chú cho đơn hàng..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="form-right">
                <div className="price-summary-card">
                  <h3>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                    </svg>
                    Tóm tắt đơn hàng
                  </h3>
                  <div className="price-breakdown">
                    {formData.vehicle.model && (
                      <div className="price-row">
                        <span>Mẫu xe:</span>
                        <span>{formData.vehicle.model}</span>
                      </div>
                    )}
                    {formData.vehicle.version && (
                      <div className="price-row">
                        <span>Phiên bản:</span>
                        <span>{formData.vehicle.version}</span>
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
                      <span>{formatCurrency(formData.vehicle.price || 0)}</span>
                    </div>
                    <div className="price-row">
                      <span>Giảm giá:</span>
                      <span className={promotionDiscount > 0 ? "discount-amount" : ""}>
                        {formatCurrency(promotionDiscount || 0)}
                      </span>
                    </div>
                    {applicablePromotions.length > 0 && (
                      <div className="promotions-detail">
                        {applicablePromotions.map((promo) => (
                          <div key={promo.promotionId} className="promo-item">
                            <small>• {promo.name} ({promo.fundedBy}): {formatCurrency(promo.amountOff)}</small>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="price-divider"></div>
                    <div className="price-row total">
                      <span>Thành tiền:</span>
                      <span className="final-price">
                        {formatCurrency(calculateFinalPrice())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="quotation-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
                Tạo đơn hàng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderForm;
