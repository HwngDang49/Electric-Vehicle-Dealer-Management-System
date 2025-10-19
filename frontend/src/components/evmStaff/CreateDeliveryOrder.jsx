import React, { useState, useEffect } from "react";
import { formatDate } from "../../utils/dateUtils";
import "./CreateDeliveryOrder.css";

const CreateDeliveryOrder = ({ order, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Order Information
    orderId: "",
    dealerId: "",
    dealerName: "",
    dealerAddress: "",
    dealerPhone: "",
    dealerEmail: "",

    // Delivery Information
    deliveryDate: "",
    deliveryTime: "",
    deliveryAddress: "",
    deliveryNotes: "",

    // Product Information
    selectedProducts: [],

    // Status
    status: "pending",
  });

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      // Auto-populate order and dealer information
      setFormData((prev) => ({
        ...prev,
        orderId: order.id,
        dealerId: order.dealerId,
        dealerName: order.dealerName,
        dealerAddress: order.dealerAddress,
        dealerPhone: order.dealerPhone,
        dealerEmail: order.dealerEmail,
        deliveryAddress: order.dealerAddress, // Default to dealer address
        selectedProducts: order.items || [],
      }));

      // Load inventory data
      loadInventory();
    }
  }, [order]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock inventory data
      const mockInventory = [
        {
          id: "INV-001",
          productCode: "VF6",
          productName: "VinFast VF6",
          version: "Eco",
          color: "Cam",
          availableQuantity: 15,
          location: "Kho A - Tầng 1",
          condition: "Mới",
        },
        {
          id: "INV-002",
          productCode: "VF6",
          productName: "VinFast VF6",
          version: "Premium",
          color: "Trắng",
          availableQuantity: 8,
          location: "Kho A - Tầng 2",
          condition: "Mới",
        },
        {
          id: "INV-003",
          productCode: "VF9",
          productName: "VinFast VF9",
          version: "Luxury",
          color: "Đen",
          availableQuantity: 5,
          location: "Kho B - Tầng 1",
          condition: "Mới",
        },
      ];

      setInventory(mockInventory);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductSelection = (inventoryItem, isSelected) => {
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          {
            ...inventoryItem,
            selectedQuantity: 1,
          },
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter(
          (item) => item.id !== inventoryItem.id
        ),
      }));
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((item) =>
        item.id === productId
          ? {
              ...item,
              selectedQuantity: Math.max(
                1,
                Math.min(quantity, item.availableQuantity)
              ),
            }
          : item
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save delivery order to backend
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Saving delivery order:", formData);

      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      console.error("Error saving delivery order:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!order) {
    return null;
  }

  return (
    <div className="evm-staff-create-delivery-overlay">
      <div className="evm-staff-create-delivery-modal">
        <div className="evm-staff-modal-header">
          <div className="evm-staff-modal-title">
            <h1>Tạo đơn giao hàng</h1>
            <p>Tạo đơn giao hàng cho đơn đặt hàng {order.id}</p>
          </div>
          <div className="evm-staff-header-actions">
            <button
              className="evm-staff-btn evm-staff-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              ← Quay lại
            </button>
          </div>
        </div>

        <div className="evm-staff-modal-content">
          <div className="evm-staff-delivery-form">
            {/* Main Content Grid */}
            <div className="evm-staff-main-grid">
              {/* Left Column - Order Information */}
              <div className="evm-staff-left-column">
                <div className="evm-staff-form-section">
                  <h2>Thông tin đơn hàng</h2>
                  <div className="evm-staff-form-grid">
                    <div className="evm-staff-form-group">
                      <label>Mã đơn hàng</label>
                      <input
                        type="text"
                        value={formData.orderId}
                        disabled
                        className="evm-staff-input evm-staff-input-disabled"
                      />
                    </div>
                    <div className="evm-staff-form-group">
                      <label>Mã đại lý</label>
                      <input
                        type="text"
                        value={formData.dealerId}
                        disabled
                        className="evm-staff-input evm-staff-input-disabled"
                      />
                    </div>
                    <div className="evm-staff-form-group">
                      <label>Tên đại lý</label>
                      <input
                        type="text"
                        value={formData.dealerName}
                        disabled
                        className="evm-staff-input evm-staff-input-disabled"
                      />
                    </div>
                    <div className="evm-staff-form-group">
                      <label>Địa chỉ đại lý</label>
                      <input
                        type="text"
                        value={formData.dealerAddress}
                        disabled
                        className="evm-staff-input evm-staff-input-disabled"
                      />
                    </div>
                    <div className="evm-staff-form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        value={formData.dealerPhone}
                        disabled
                        className="evm-staff-input evm-staff-input-disabled"
                      />
                    </div>
                    <div className="evm-staff-form-group">
                      <label>Email</label>
                      <input
                        type="text"
                        value={formData.dealerEmail}
                        disabled
                        className="evm-staff-input evm-staff-input-disabled"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="evm-staff-right-column">
                <div className="evm-staff-form-section">
                  <h2>Tóm tắt đơn giao hàng</h2>
                  <div className="evm-staff-summary-content">
                    <div className="evm-staff-summary-item">
                      <span className="evm-staff-summary-label">
                        Tổng sản phẩm:
                      </span>
                      <span className="evm-staff-summary-value">
                        {formData.selectedProducts.length} sản phẩm
                      </span>
                    </div>
                    <div className="evm-staff-summary-item">
                      <span className="evm-staff-summary-label">
                        Ngày giao dự kiến:
                      </span>
                      <span className="evm-staff-summary-value">
                        {formData.deliveryDate
                          ? formatDate(new Date(formData.deliveryDate))
                          : "Chưa chọn"}
                      </span>
                    </div>
                    <div className="evm-staff-summary-item">
                      <span className="evm-staff-summary-label">
                        Giờ giao dự kiến:
                      </span>
                      <span className="evm-staff-summary-value">
                        {formData.deliveryTime || "Chưa chọn"}
                      </span>
                    </div>
                    <div className="evm-staff-summary-item evm-staff-summary-total">
                      <span className="evm-staff-summary-label">
                        Trạng thái:
                      </span>
                      <span className="evm-staff-summary-value evm-staff-status-pending">
                        Chờ xử lý
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information Section */}
            <div className="evm-staff-form-section">
              <h2>Thông tin giao hàng</h2>
              <div className="evm-staff-form-grid">
                <div className="evm-staff-form-group">
                  <label>Ngày giao dự kiến *</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      handleInputChange("deliveryDate", e.target.value)
                    }
                    className="evm-staff-input"
                    required
                  />
                </div>
                <div className="evm-staff-form-group">
                  <label>Giờ giao dự kiến</label>
                  <select
                    value={formData.deliveryTime}
                    onChange={(e) =>
                      handleInputChange("deliveryTime", e.target.value)
                    }
                    className="evm-staff-select"
                  >
                    <option value="">Chọn giờ giao</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
                <div className="evm-staff-form-group evm-staff-form-group-full">
                  <label>Địa chỉ giao hàng *</label>
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      handleInputChange("deliveryAddress", e.target.value)
                    }
                    className="evm-staff-textarea"
                    rows="3"
                    required
                  />
                </div>
                <div className="evm-staff-form-group evm-staff-form-group-full">
                  <label>Ghi chú giao hàng</label>
                  <textarea
                    value={formData.deliveryNotes}
                    onChange={(e) =>
                      handleInputChange("deliveryNotes", e.target.value)
                    }
                    className="evm-staff-textarea"
                    rows="2"
                    placeholder="Ghi chú đặc biệt cho việc giao hàng..."
                  />
                </div>
              </div>
            </div>

            {/* Product Selection Section */}
            <div className="evm-staff-form-section">
              <h2>Chọn sản phẩm từ kho</h2>
              <p className="evm-staff-section-description">
                Đối chiếu yêu cầu đơn hàng với sản phẩm có sẵn trong kho
              </p>

              {/* Original Order Requirements */}
              <div className="evm-staff-requirements-section">
                <h3>Yêu cầu từ đơn hàng</h3>
                <div className="evm-staff-requirements-list">
                  {order.items?.map((item, index) => (
                    <div key={index} className="evm-staff-requirement-item">
                      <span className="evm-staff-requirement-product">
                        {item.product} {item.version} - {item.color}
                      </span>
                      <span className="evm-staff-requirement-quantity">
                        Số lượng: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Selection */}
              <div className="evm-staff-inventory-section">
                <h3>Sản phẩm có sẵn trong kho</h3>
                {loading ? (
                  <div className="evm-staff-loading">
                    <div className="evm-staff-spinner"></div>
                    <p>Đang tải dữ liệu kho...</p>
                  </div>
                ) : (
                  <div className="evm-staff-inventory-grid">
                    {inventory.map((item) => (
                      <div key={item.id} className="evm-staff-inventory-item">
                        <div className="evm-staff-inventory-checkbox">
                          <input
                            type="checkbox"
                            id={`inventory-${item.id}`}
                            checked={formData.selectedProducts.some(
                              (p) => p.id === item.id
                            )}
                            onChange={(e) =>
                              handleProductSelection(item, e.target.checked)
                            }
                          />
                          <label htmlFor={`inventory-${item.id}`}>
                            <div className="evm-staff-inventory-info">
                              <div className="evm-staff-inventory-product">
                                {item.productName} {item.version}
                              </div>
                              <div className="evm-staff-inventory-details">
                                <span>Màu: {item.color}</span>
                                <span>Kho: {item.location}</span>
                                <span>Tình trạng: {item.condition}</span>
                              </div>
                              <div className="evm-staff-inventory-quantity">
                                Có sẵn: {item.availableQuantity} chiếc
                              </div>
                            </div>
                          </label>
                        </div>

                        {formData.selectedProducts.some(
                          (p) => p.id === item.id
                        ) && (
                          <div className="evm-staff-quantity-selector">
                            <label>Số lượng:</label>
                            <input
                              type="number"
                              min="1"
                              max={item.availableQuantity}
                              value={
                                formData.selectedProducts.find(
                                  (p) => p.id === item.id
                                )?.selectedQuantity || 1
                              }
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="evm-staff-quantity-input"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Products Summary */}
              {formData.selectedProducts.length > 0 && (
                <div className="evm-staff-selected-summary">
                  <h3>Sản phẩm đã chọn</h3>
                  <div className="evm-staff-selected-list">
                    {formData.selectedProducts.map((product) => (
                      <div key={product.id} className="evm-staff-selected-item">
                        <span className="evm-staff-selected-name">
                          {product.productName} {product.version} -{" "}
                          {product.color}
                        </span>
                        <span className="evm-staff-selected-quantity">
                          {product.selectedQuantity} chiếc
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="evm-staff-modal-footer">
          <div className="evm-staff-modal-actions">
            <button
              className="evm-staff-btn evm-staff-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              className="evm-staff-btn evm-staff-btn-primary"
              onClick={handleSave}
              disabled={
                saving || !formData.deliveryDate || !formData.deliveryAddress
              }
            >
              {saving ? "Đang lưu..." : "Tạo đơn giao hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDeliveryOrder;
