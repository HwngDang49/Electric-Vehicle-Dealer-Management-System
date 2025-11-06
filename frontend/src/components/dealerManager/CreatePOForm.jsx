import React, { useState, useEffect } from "react";
import productsWithPricingApiService from "../../services/productsWithPricingApi";
import branchApiService from "../../services/branchApi";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import authService from "../../services/AuthService";
import CustomDropdown from "../admin/CustomDropdown";
import { useProductImageMapping } from "../../utils/productImageUtils";
import "./CreatePOForm.css";

const CreatePOForm = ({
  onClose,
  onSubmit,
  initialBranchCode,
  initialItems,
}) => {
  const [formData, setFormData] = useState({
    branchName: "",
    contactPerson: "",
    deliveryAddress: "",
    deliveryDate: "",
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [productsWithPricing, setProductsWithPricing] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use dynamic image mapping hook (shared utility, no hard-coding)
  const getProductImagePath = useProductImageMapping();

  // Load products and current user on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set contact person and get dealerId from JWT token
        let dealerId = null;
        const token = authService.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userName =
              payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
              ] ||
              payload["name"] ||
              payload["fullName"] ||
              payload["FullName"] ||
              payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
              ] ||
              payload["email"] ||
              "Manager";

            if (userName) {
              setFormData((prev) => ({
                ...prev,
                contactPerson: userName,
              }));
            }

            // Lấy dealerId từ JWT token
            const dealerIdClaim = payload["dealer_id"];
            if (dealerIdClaim) {
              dealerId = parseInt(dealerIdClaim);
            }
          } catch {
            // Silently fail if JWT decode fails
          }
        }

        const response =
          await productsWithPricingApiService.getAllProductsWithPricingForPo(
            true
          ); // true = only show products in pricebook, uses merged pricebook (dealer + global)
        setProductsWithPricing(response.products);

        // Chỉ lấy branches của dealer hiện tại
        const branchesResponse = await branchApiService.getBranches(
          dealerId ? { dealerId } : {}
        );

        // ✅ Handle PagedResult format from backend
        const paged = branchesResponse?.data ?? branchesResponse;
        const fetchedBranches = Array.isArray(paged)
          ? paged
          : paged?.items ?? [];
        setBranches(fetchedBranches);

        // Pre-fill form if initial data is provided
        if (initialBranchCode) {
          setFormData((prev) => ({
            ...prev,
            branchName: initialBranchCode,
          }));

          // Find branch and set address
          const branch = fetchedBranches.find(
            (b) => (b.code || b.name) === initialBranchCode
          );
          if (branch) {
            setFormData((prev) => ({
              ...prev,
              branchName: initialBranchCode,
              deliveryAddress: branch.address || "",
            }));
          }
        }

        // Pre-fill selected items if provided
        if (initialItems && initialItems.length > 0) {
          // Map initial items to full product objects from products API
          // Try to match by productId first, then by productName or name
          const productsMapById = response.products.reduce((acc, product) => {
            acc[product.productId] = product;
            return acc;
          }, {});

          const productsMapByName = response.products.reduce((acc, product) => {
            const key = (product.name || "").toLowerCase();
            if (key && !acc[key]) {
              acc[key] = product;
            }
            return acc;
          }, {});

          const prefillItems = initialItems.map((item) => {
            // Try to find by productId first
            let fullProduct = productsMapById[item.productId];

            // If not found by ID, try to find by productName or name
            if (!fullProduct && (item.productName || item.name)) {
              const searchName = (item.productName || item.name).toLowerCase();
              fullProduct = productsMapByName[searchName];
            }

            if (fullProduct) {
              return {
                ...fullProduct,
                quantity: item.quantity,
                price:
                  item.floorPrice ||
                  item.effectivePrice ||
                  fullProduct.effectivePrice,
              };
            }

            // Fallback if product not found in API
            return {
              productId: item.productId || Math.random().toString(),
              name: item.name || item.productName || `Product`,
              floorPrice: item.floorPrice || item.effectivePrice || 0,
              effectivePrice: item.effectivePrice || item.floorPrice || 0,
              quantity: item.quantity,
              price: item.floorPrice || item.effectivePrice || 0,
            };
          });

          setSelectedItems(prefillItems);
        }
      } catch {
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialBranchCode, initialItems]); // Re-run if initial data changes

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle branch selection from dropdown
  const handleBranchSelection = (branchId) => {
    const selectedBranch = branches.find(
      (branch) => branch.branchId === parseInt(branchId)
    );
    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branchName: selectedBranch.code || selectedBranch.name,
        deliveryAddress: selectedBranch.address || "",
      }));
      // Clear validation errors when branch is selected
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.branchName;
        if (selectedBranch.address) {
          delete newErrors.deliveryAddress;
        }
        return newErrors;
      });
    } else {
      // Clear branch data if deselected
      setFormData((prev) => ({
        ...prev,
        branchName: "",
        deliveryAddress: "",
      }));
    }
  };

  const addToOrder = (product) => {
    const existingItem = selectedItems.find(
      (item) => item.productId === product.productId
    );
    if (existingItem) {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          ...product,
          quantity: 1,
          price: product.effectivePrice, // Use effective price for calculations
        },
      ]);
    }
    // Clear selectedItems error when item is added
    if (validationErrors.selectedItems) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.selectedItems;
        return newErrors;
      });
    }

    // Clear API error when items change
    if (apiError) {
      setApiError(null);
    }
  };

  const removeFromOrder = (productId) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromOrder(productId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      // Use floorPrice for calculation (not price or effectivePrice)
      const price = item.floorPrice || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Validate form trước khi submit
  const validateForm = () => {
    const errors = {};

    // Validate BranchCode
    if (!formData.branchName || formData.branchName.trim() === "") {
      errors.branchName = "Mã chi nhánh là bắt buộc";
    }

    // Validate DeliveryAddress
    if (!formData.deliveryAddress || formData.deliveryAddress.trim() === "") {
      errors.deliveryAddress = "Địa chỉ giao hàng là bắt buộc";
    }

    // Validate DeliveryDate
    if (!formData.deliveryDate || formData.deliveryDate.trim() === "") {
      errors.deliveryDate = "Ngày giao hàng mong muốn là bắt buộc";
    }

    // Validate selectedItems
    if (!selectedItems || selectedItems.length === 0) {
      errors.selectedItems = "Vui lòng chọn ít nhất 1 sản phẩm";
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous API errors
    setApiError(null);

    // Validate form trước khi submit
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      // Scroll to first error field after state update
      setTimeout(() => {
        const firstErrorField = Object.keys(validationResult.errors)[0];
        if (firstErrorField) {
          const element =
            document.querySelector(`[name="${firstErrorField}"]`) ||
            document.querySelector(`[data-field="${firstErrorField}"]`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
      return;
    }

    try {
      setIsSubmitting(true);

      const backendData = {
        BranchCode: formData.branchName || "",
        PoItems: selectedItems.map((item) => ({
          ProductId: parseInt(item.productId),
          Qty: parseInt(item.quantity),
        })),
      };

      const response = await purchaseOrderApiService.createPurchaseOrder(
        backendData
      );

      if (response.status === "success") {
        // Success - call parent onSubmit callback
        const orderData = {
          ...formData,
          selectedItems: selectedItems,
          totalAmount: calculateTotal(),
          orderDate: new Date().toISOString().split("T")[0],
        };
        onSubmit(orderData);
      } else {
        setApiError(
          response.message || "Không thể tạo đơn hàng. Vui lòng thử lại."
        );
      }
    } catch (error) {
      // Extract error message from API error
      let errorMessage = "Không thể tạo đơn hàng. Vui lòng thử lại.";

      // Handle Ardalis.Result format (from backend)
      if (error?.response?.data) {
        const data = error.response.data;

        // Check for Ardalis.Result format: { errors: [...], message: "...", ... }
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors[0] || errorMessage;
        } else if (data.errors && typeof data.errors === "object") {
          // Handle errors object dictionary: { "field": ["msg1", "msg2"] }
          const allMessages = Object.values(data.errors).flat();
          errorMessage = allMessages[0] || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (Array.isArray(data)) {
          // Handle array of errors directly
          errorMessage = data[0] || errorMessage;
        }
      } else if (error?.message) {
        // Handle error object with message property
        errorMessage = error.message;
      }

      setApiError(errorMessage);

      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector(".api-error-message");
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-po-form">
      {/* Header */}
      <div className="form-header">
        <button className="back-btn" onClick={onClose}>
          ←
        </button>
        <div className="header-content">
          <h1 className="form-title">Tạo đơn nhập hàng</h1>
          <p className="form-subtitle">Tạo đơn hàng nhập xe từ hãng</p>
        </div>
      </div>

      <div className="form-content">
        {/* Left Column - Dealer Info & Vehicle Selection */}
        <div className="left-column">
          {/* Dealer Information */}
          <div className="dealer-info-section">
            <h2 className="section-title">Thông tin đại lý</h2>
            <p className="section-subtitle">Thông tin liên hệ và giao hàng</p>

            <div className="form-grid">
              <div className="form-group" data-field="branchName">
                <label>
                  Mã Chi nhánh <span style={{ color: "red" }}>*</span>
                </label>
                <CustomDropdown
                  value={
                    formData.branchName
                      ? branches
                          .find(
                            (b) => (b.code || b.name) === formData.branchName
                          )
                          ?.branchId?.toString() || ""
                      : ""
                  }
                  onChange={handleBranchSelection}
                  options={[
                    { value: "", label: "Chọn chi nhánh" },
                    ...branches.map((branch) => ({
                      value: branch.branchId?.toString() || "",
                      label: `${branch.code || branch.name} - ${
                        branch.name || branch.code
                      }`,
                    })),
                  ]}
                  minWidth="100%"
                  icon=""
                  style={{
                    borderColor: validationErrors.branchName
                      ? "red"
                      : undefined,
                  }}
                />
                {validationErrors.branchName && (
                  <span
                    style={{
                      color: "red",
                      fontSize: "12px",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {validationErrors.branchName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Người liên hệ</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  readOnly
                  placeholder="Tự động lấy từ tài khoản hiện tại"
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Địa chỉ giao hàng <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => {
                    handleInputChange("deliveryAddress", e.target.value);
                    // Clear error when user starts typing
                    if (validationErrors.deliveryAddress) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.deliveryAddress;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Địa chỉ sẽ tự động điền khi nhập mã chi nhánh"
                  readOnly={formData.branchName ? true : false}
                  style={{
                    backgroundColor: formData.branchName ? "#f5f5f5" : "white",
                    cursor: formData.branchName ? "not-allowed" : "text",
                    borderColor: validationErrors.deliveryAddress
                      ? "red"
                      : undefined,
                  }}
                />
                {validationErrors.deliveryAddress && (
                  <span
                    style={{
                      color: "red",
                      fontSize: "12px",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {validationErrors.deliveryAddress}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Ngày giao hàng mong muốn{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <div className="date-input">
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      handleInputChange("deliveryDate", e.target.value);
                      // Clear error when user selects date
                      if (validationErrors.deliveryDate) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.deliveryDate;
                          return newErrors;
                        });
                      }
                    }}
                    style={{
                      borderColor: validationErrors.deliveryDate
                        ? "red"
                        : undefined,
                    }}
                  />
                </div>
                {validationErrors.deliveryDate && (
                  <span
                    style={{
                      color: "red",
                      fontSize: "12px",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {validationErrors.deliveryDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="vehicle-selection-section">
            <h2 className="section-title">Danh mục xe có sẵn</h2>
            <p className="section-subtitle">Chọn xe cần nhập từ hãng</p>

            {loading && (
              <div className="loading-state">
                <p>Đang tải danh sách sản phẩm...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="vehicle-grid">
                {productsWithPricing.map((product) => {
                  const imagePath = getProductImagePath(product);
                  return (
                    <div key={product.productId} className="vehicle-card">
                      <div className="vehicle-image">
                        {imagePath ? (
                          <img
                            src={imagePath}
                            alt={product.name || `Model ${product.modelCode}`}
                            onError={(e) => {
                              // Hide image and show placeholder if image fails to load
                              e.target.style.display = "none";
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) {
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="vehicle-placeholder"
                          style={{ display: imagePath ? "none" : "flex" }}
                        >
                          <span className="vehicle-icon">🚗</span>
                        </div>
                      </div>
                      <div className="vehicle-info">
                        <h3 className="vehicle-name">{product.name}</h3>
                        <p className="vehicle-model">
                          Model:{" "}
                          {product.modelCode || `ID: ${product.productId}`}
                        </p>
                        <p className="vehicle-price">
                          {product.formattedPrice}
                        </p>
                        <button
                          className="add-to-order-btn"
                          onClick={() => addToOrder(product)}
                        >
                          + Thêm vào đơn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="right-column">
          <div className="order-summary">
            <div className="summary-header">
              <h2 className="section-title">🛒 Tóm tắt đơn hàng</h2>
            </div>

            <div className="selected-items">
              {selectedItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Chưa có xe nào được chọn</p>
                  {validationErrors.selectedItems && (
                    <span
                      style={{
                        color: "red",
                        fontSize: "12px",
                        display: "block",
                        marginTop: "8px",
                      }}
                    >
                      {validationErrors.selectedItems}
                    </span>
                  )}
                </div>
              ) : (
                selectedItems.map((item) => {
                  const itemImagePath = getProductImagePath(item);
                  return (
                    <div key={item.productId} className="selected-item">
                      <div className="item-image">
                        {itemImagePath ? (
                          <img
                            src={itemImagePath}
                            alt={item.name || `Model ${item.modelCode}`}
                            onError={(e) => {
                              // Hide image and show placeholder if image fails to load
                              e.target.style.display = "none";
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) {
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="vehicle-placeholder"
                          style={{ display: itemImagePath ? "none" : "flex" }}
                        >
                          <span className="vehicle-icon">🚗</span>
                        </div>
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-model">
                          {item.modelCode || `ID: ${item.productId}`}-2024
                        </p>
                        <p className="item-price">
                          {item.formattedPrice || formatPrice(item.price)}
                        </p>
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.productId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="quantity-input"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="quantity-btn"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromOrder(item.productId)}
                            className="remove-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedItems.length > 0 && (
              <>
                <div className="order-totals">
                  <div className="total-row">
                    <span>Tổng số lượng:</span>
                    <span>
                      {selectedItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      xe
                    </span>
                  </div>
                  <div className="total-row">
                    <span>Tổng tiền:</span>
                    <span className="total-amount">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                </div>
              </>
            )}

            <button
              className="create-order-btn"
              onClick={handleSubmit}
              disabled={selectedItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Đang tạo đơn hàng..." : "Tạo đơn hàng"}
            </button>

            {/* Show API error message */}
            {apiError && (
              <div
                className="api-error-message"
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "#ffe6e6",
                  borderRadius: "4px",
                  border: "1px solid #ff9999",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#d32f2f",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  ⚠️ Lỗi: {apiError}
                </p>
              </div>
            )}

            {/* Show validation errors summary if any */}
            {Object.keys(validationErrors).length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "#ffe6e6",
                  borderRadius: "4px",
                  border: "1px solid #ff9999",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#d32f2f",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Vui lòng điền đầy đủ thông tin bắt buộc:
                </p>
                <ul
                  style={{
                    margin: "8px 0 0 0",
                    paddingLeft: "20px",
                    color: "#d32f2f",
                  }}
                >
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index} style={{ fontSize: "13px" }}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePOForm;
