import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import manufacturerInventoryApi from "../../services/manufacturerInventoryApi";

const InventoryManagement = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [vinList, setVinList] = useState([]);

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("🔄 Loading manufacturer inventory data from API...");
      const response =
        await manufacturerInventoryApi.getManufacturerInventoryList({});

      console.log("✅ API Response:", response);
      console.log(
        "✅ API Response Type:",
        Array.isArray(response) ? "Array" : typeof response
      );
      console.log("✅ API Response Length:", response?.length);

      // Backend trả về array trực tiếp
      const data = Array.isArray(response) ? response : response?.data || [];

      console.log("📊 Manufacturer inventory data:", data);
      console.log("📊 Total products:", data.length);

      // Log chi tiết từng product
      data.forEach((product, index) => {
        console.log(`📦 Product ${index + 1}:`, {
          productId: product.ProductId || product.productId,
          productCode: product.ProductCode || product.productCode,
          productName: product.ProductName || product.productName,
          totalVins:
            product.QuantityInfo?.TotalQuantity ||
            product.quantityInfo?.totalQuantity ||
            0,
          inStock:
            product.QuantityInfo?.InStockQuantity ||
            product.quantityInfo?.inStockQuantity ||
            0,
        });
      });

      // Sort by ProductCode ascending (alphabetical order)
      data.sort((a, b) => {
        const codeA = (a.ProductCode || a.productCode || "").toLowerCase();
        const codeB = (b.ProductCode || b.productCode || "").toLowerCase();
        return codeA.localeCompare(codeB);
      });

      setInventoryData(data);
    } catch (err) {
      console.error("❌ Error loading manufacturer inventory data:", err);
      setInventoryData([]);
    }
  };

  const handleViewDetails = async (product) => {
    try {
      setSelectedProduct(product);
      setLoadingDetail(true);
      setShowDetailModal(true);

      console.log("🔍 Viewing details for product:", product.productName);
    } catch (err) {
      console.error("❌ Error loading product details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
    setSelectedStatus(null);
    setVinList([]);
  };

  const handleStatusClick = async (status) => {
    try {
      setSelectedStatus(status);
      setVinList([]);
      console.log(
        `🔍 Loading VINs for status: ${status}, product: ${selectedProduct.productId}`
      );

      // Gọi API để lấy VIN chi tiết thực từ database
      const response = await manufacturerInventoryApi.getManufacturerDetailVins(
        {
          productId: selectedProduct.productId,
          status: status,
        }
      );

      console.log(`✅ Detail VINs response for ${status}:`, response);

      // Map response to vinList format
      if (response && Array.isArray(response)) {
        const vins = response.map((item) => ({
          vin: item.Vin || item.vin,
          productName: item.ProductName || item.productName,
          colorName: item.ColorName || item.colorName,
          vinNumber: item.Vin || item.vin,
          status: item.Status || item.status,
          orderId: item.OrderId || item.orderId,
          poId: item.PoId || item.poId,
          receivedAt: item.ReceivedAt || item.receivedAt,
        }));
        setVinList(vins);

        console.log(`📋 Total VINs for ${status}:`, vins.length);
      } else {
        console.log("⚠️ No VIN data found");
        setVinList([]);
      }
    } catch (err) {
      console.error(`❌ Error loading VINs for ${status}:`, err);
      setVinList([]);
    }
  };

  return (
    <div className="evm-staff-app">
      <div className="inventory-management">
        <div className="page-header">
          <h1 className="page-title">Quản lý kho</h1>
          <p className="page-subtitle">
            Quản lý và theo dõi kho hàng của hãng theo sản phẩm
          </p>
        </div>

        {/* Inventory Table */}
        <div className="inventory-table-section">
          <div className="table-header">
            <h3 className="table-title">Danh sách kho hãng</h3>
          </div>

          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Địa chỉ</th>
                  <th>Số lượng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item) => {
                  // Map PascalCase từ backend sang camelCase
                  const product = {
                    productId: item.ProductId || item.productId,
                    productName: item.ProductName || item.productName,
                    productCode: item.ProductCode || item.productCode,
                    quantityInfo: {
                      totalQuantity:
                        item.QuantityInfo?.TotalQuantity ??
                        item.quantityInfo?.totalQuantity ??
                        0,
                      inStockQuantity:
                        item.QuantityInfo?.InStockQuantity ??
                        item.quantityInfo?.inStockQuantity ??
                        0,
                      allocatedQuantity:
                        item.QuantityInfo?.AllocatedQuantity ??
                        item.quantityInfo?.allocatedQuantity ??
                        0,
                      inTransitQuantity:
                        item.QuantityInfo?.InTransitQuantity ??
                        item.quantityInfo?.inTransitQuantity ??
                        0,
                      deliveredQuantity:
                        item.QuantityInfo?.DeliveredQuantity ??
                        item.quantityInfo?.deliveredQuantity ??
                        0,
                    },
                    lastUpdated: item.LastUpdated || item.lastUpdated,
                  };

                  return (
                    <tr key={product.productId}>
                      <td>
                        <div className="branch-info">
                          <div className="branch-name">
                            {product.productName}
                          </div>
                          <div className="branch-code">
                            {product.productCode}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="warehouse-location-info">
                          <div className="branch-address">Manufacturer</div>
                        </div>
                      </td>
                      <td>
                        <div className="quantity-info">
                          <div className="total-quantity">
                            {product.quantityInfo.totalQuantity} xe
                          </div>
                          <div className="quantity-details">
                            InStock: {product.quantityInfo.inStockQuantity} |
                            Allocated: {product.quantityInfo.allocatedQuantity}{" "}
                            | InTransit:{" "}
                            {product.quantityInfo.inTransitQuantity}
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleViewDetails(product)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {inventoryData.length === 0 && (
            <div className="no-data">
              <div className="no-data-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 6H16L14 4H10L8 6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM20 19H4V8H6.83L8.83 6H15.17L17.17 8H20V19ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17Z" />
                </svg>
              </div>
              <h3>Không tìm thấy dữ liệu</h3>
              <p>Không có sản phẩm nào trong kho hãng.</p>
            </div>
          )}
        </div>

        {/* Modal Chi tiết kho */}
        {showDetailModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chi tiết kho - {selectedProduct?.productName}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {loadingDetail ? (
                  <div className="loading-state">
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="inventory-detail">
                    <div className="detail-summary">
                      <div className="summary-item">
                        <span className="label">Product ID:</span>
                        <span className="value">
                          {selectedProduct?.productId}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Mã sản phẩm:</span>
                        <span className="value">
                          {selectedProduct?.productCode}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Quyền sở hữu:</span>
                        <span className="value">Manufacturer</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Tổng số xe:</span>
                        <span className="value highlight">
                          {selectedProduct?.quantityInfo.totalQuantity} xe
                        </span>
                      </div>
                    </div>

                    <div className="status-breakdown">
                      <h3>Phân loại theo trạng thái (Click để xem VIN)</h3>
                      <div className="status-grid">
                        <div
                          className={`status-card ${
                            selectedStatus === "InStock" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("InStock")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">InStock</span>
                          <span className="status-count">
                            {selectedProduct?.quantityInfo.inStockQuantity}
                          </span>
                        </div>
                        <div
                          className={`status-card ${
                            selectedStatus === "Allocated" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("Allocated")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">Allocated</span>
                          <span className="status-count">
                            {selectedProduct?.quantityInfo.allocatedQuantity}
                          </span>
                        </div>
                        <div
                          className={`status-card ${
                            selectedStatus === "InTransit" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("InTransit")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">InTransit</span>
                          <span className="status-count">
                            {selectedProduct?.quantityInfo.inTransitQuantity}
                          </span>
                        </div>
                      </div>

                      {/* Danh sách VIN */}
                      {selectedStatus && (
                        <div className="vin-list-section">
                          <h4>
                            Danh sách VIN - {selectedStatus} ({vinList.length})
                          </h4>
                          {vinList.length > 0 ? (
                            <div className="vin-table-container">
                              <table className="vin-table">
                                <thead>
                                  <tr>
                                    <th>STT</th>
                                    <th>VIN</th>
                                    <th>Sản phẩm</th>
                                    <th>Màu sắc</th>
                                    <th>Trạng thái</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {vinList.map((vin, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td className="vin-code">
                                        {vin.vinNumber}
                                      </td>
                                      <td>{vin.productName}</td>
                                      <td>{vin.colorName || "N/A"}</td>
                                      <td>
                                        <span
                                          className={`vin-status ${vin.status.toLowerCase()}`}
                                        >
                                          {vin.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="no-vins">
                              Không có VIN nào trong trạng thái này.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
