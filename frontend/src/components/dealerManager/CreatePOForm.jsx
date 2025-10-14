import React, { useState } from "react";
import { vinfastModels } from "./VinFastModels";
import "./CreatePOForm.css";

const CreatePOForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    dealerName: "",
    dealerCode: "",
    contactPerson: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    deliveryDate: "",
    priority: "normal",
    notes: "",
  });

  const [selectedItems, setSelectedItems] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addToOrder = (model) => {
    const existingItem = selectedItems.find((item) => item.id === model.id);
    if (existingItem) {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.id === model.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedItems((prev) => [...prev, { ...model, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[₫,]/g, ""));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      ...formData,
      selectedItems: selectedItems,
      totalAmount: calculateTotal(),
      orderDate: new Date().toISOString().split("T")[0],
    };
    onSubmit(orderData);
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
              <div className="form-group">
                <label>Tên đại lý</label>
                <input
                  type="text"
                  value={formData.dealerName}
                  onChange={(e) =>
                    handleInputChange("dealerName", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Mã đại lý</label>
                <input
                  type="text"
                  value={formData.dealerCode}
                  onChange={(e) =>
                    handleInputChange("dealerCode", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Người liên hệ</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    handleInputChange("contactPerson", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    handleInputChange("deliveryAddress", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Ngày giao hàng mong muốn</label>
                <div className="date-input">
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      handleInputChange("deliveryDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Độ ưu tiên</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                >
                  <option value="low">Thấp</option>
                  <option value="normal">Bình thường</option>
                  <option value="high">Cao</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Ghi chú thêm về đơn hàng..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="vehicle-selection-section">
            <h2 className="section-title">Danh mục xe có sẵn</h2>
            <p className="section-subtitle">Chọn xe cần nhập từ hãng</p>

            <div className="vehicle-grid">
              {vinfastModels.map((model) => (
                <div key={model.id} className="vehicle-card">
                  <div className="vehicle-image">
                    <img src={model.image} alt={model.name} />
                  </div>
                  <div className="vehicle-info">
                    <h3 className="vehicle-name">{model.name}</h3>
                    <p className="vehicle-model">
                      Model: {model.id.toUpperCase()}-2024
                    </p>
                    <p className="vehicle-price">{model.price}</p>
                    <button
                      className="add-to-order-btn"
                      onClick={() => addToOrder(model)}
                    >
                      + Thêm vào đơn
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.id} className="selected-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-model">{item.id.toUpperCase()}-2024</p>
                      <p className="item-price">{item.price}</p>
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
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
                              item.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="quantity-input"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="quantity-btn"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromOrder(item.id)}
                          className="remove-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
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

                <div className="order-info">
                  <div className="info-message">
                    ℹ️ Đơn hàng sẽ được gửi đến hãng để xét duyệt theo chính
                    sách mua bán.
                  </div>
                </div>
              </>
            )}

            <button
              className="create-order-btn"
              onClick={handleSubmit}
              disabled={selectedItems.length === 0}
            >
              Tạo đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePOForm;
