import React, { useState, useEffect } from "react";
import "./VinSelectionModal.css";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import manufacturerInventoryApi from "../../services/manufacturerInventoryApi";
import { useToast } from "../../contexts/useToast";

const VinSelectionModal = ({ isOpen, onClose, order, onConfirm }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [availableVins, setAvailableVins] = useState({}); // { productId: [{ vin, createdAt, ... }] }
  const [selectedVins, setSelectedVins] = useState({}); // { productId: [vin1, vin2, ...] }
  const [loadingVins, setLoadingVins] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({}); // { productId: true/false }
  const [inStockCounts, setInStockCounts] = useState({}); // { productId: number } - Số lượng VIN InStock trong kho

  useEffect(() => {
    if (isOpen && order) {
      loadAvailableVins();
      loadInStockCounts();
      // Initialize all sections as collapsed by default
      const initialCollapsed = {};
      order.items?.forEach((item) => {
        initialCollapsed[item.productId] = true;
      });
      setCollapsedSections(initialCollapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order]);

  const loadAvailableVins = async () => {
    setLoadingVins(true);
    try {
      const vinsData = {};
      const selectedData = {};

      for (const item of order.items || []) {
        try {
          const response =
            await purchaseOrderApiService.getAvailableVinsForProduct(
              item.productId
            );

          const mappedVins = (response.data || []).map((vinData) => ({
            vin: vinData.Vin || vinData.vin,
            productId: vinData.ProductId || vinData.productId,
            productName: vinData.ProductName || vinData.productName,
            colorName: vinData.ColorName || vinData.colorName,
            status: vinData.Status || vinData.status,
            createdAt:
              vinData.CreatedAt ||
              vinData.createdAt ||
              new Date().toISOString(),
            orderId: vinData.OrderId || vinData.orderId,
            poId: vinData.PoId || vinData.poId,
          }));

          vinsData[item.productId] = mappedVins;
          selectedData[item.productId] = [];
        } catch {
          vinsData[item.productId] = [];
          selectedData[item.productId] = [];
        }
      }

      setAvailableVins(vinsData);
      setSelectedVins(selectedData);
    } catch {
      toast.error("Lỗi", {
        message: "Lỗi khi tải danh sách VIN",
      });
    } finally {
      setLoadingVins(false);
    }
  };

  const loadInStockCounts = async () => {
    try {
      const counts = {};

      // Load inventory list to get InStock counts for all products
      const inventoryResponse =
        await manufacturerInventoryApi.getManufacturerInventoryList({});
      const inventoryData = Array.isArray(inventoryResponse)
        ? inventoryResponse
        : inventoryResponse?.data || [];

      // Create a map of productId -> InStockQuantity
      const inventoryMap = {};
      inventoryData.forEach((product) => {
        const productId = product.ProductId || product.productId;
        const inStockQuantity =
          product.QuantityInfo?.InStockQuantity ||
          product.quantityInfo?.inStockQuantity ||
          0;
        inventoryMap[productId] = inStockQuantity;
      });

      // Set InStock counts for each product in the order
      order.items?.forEach((item) => {
        counts[item.productId] = inventoryMap[item.productId] || 0;
      });

      setInStockCounts(counts);
    } catch (error) {
      console.error("Error loading InStock counts:", error);
      // Set default values to 0 if error
      const defaultCounts = {};
      order.items?.forEach((item) => {
        defaultCounts[item.productId] = 0;
      });
      setInStockCounts(defaultCounts);
    }
  };

  const handleVinToggle = (productId, vin) => {
    setSelectedVins((prev) => {
      const currentSelected = prev[productId] || [];
      const isSelected = currentSelected.includes(vin);

      if (isSelected) {
        // Unselect
        return {
          ...prev,
          [productId]: currentSelected.filter((v) => v !== vin),
        };
      } else {
        // Select
        return {
          ...prev,
          [productId]: [...currentSelected, vin],
        };
      }
    });
  };

  const getSelectedCount = (productId) => {
    return selectedVins[productId]?.length || 0;
  };

  const toggleSection = (productId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const isSectionCollapsed = (productId) => {
    return collapsedSections[productId] !== false; // Default to collapsed (true)
  };

  const validateSelection = () => {
    const errors = [];

    order.items?.forEach((item) => {
      const required = item.quantity;
      const selected = getSelectedCount(item.productId);

      if (selected === 0) {
        errors.push(`❌ Chưa chọn VIN cho ${item.productName}`);
      } else if (selected < required) {
        errors.push(`❌ ${item.productName}: Thiếu ${required - selected} VIN`);
      } else if (selected > required) {
        errors.push(`❌ ${item.productName}: Thừa ${selected - required} VIN`);
      }
    });

    return errors;
  };

  const handleConfirm = async () => {
    // Validate
    const errors = validateSelection();
    if (errors.length > 0) {
      toast.error("Lỗi xác thực", {
        message: errors.join(". "),
      });
      return;
    }

    // Prepare data
    const vinAllocations = order.items.map((item) => ({
      productId: item.productId,
      selectedVins: selectedVins[item.productId] || [],
    }));

    setLoading(true);
    try {
      await onConfirm(vinAllocations);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="evm-staff-vin-selection-modal-app">
      <div className="evm-staff-vin-selection-modal-overlay" onClick={onClose}>
        <div
          className="evm-staff-vin-selection-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="evm-staff-vin-selection-modal-header">
            <div className="evm-staff-vin-selection-modal-header-left">
              <div className="evm-staff-vin-selection-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div>
                <h2 className="evm-staff-vin-selection-modal-title">
                  Gán VIN cho PO ID {order?.id}
                </h2>
              </div>
            </div>
            <button
              className="evm-staff-vin-selection-modal-close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="evm-staff-vin-selection-modal-body">
            {loadingVins ? (
              <div className="evm-staff-vin-selection-loading">
                <div className="evm-staff-vin-selection-spinner"></div>
                <p>Đang tải danh sách VIN...</p>
              </div>
            ) : (
              <>
                {order?.items?.map((item) => {
                  const required = item.quantity;
                  const selected = getSelectedCount(item.productId);
                  const available = availableVins[item.productId] || [];
                  const isComplete = selected === required;
                  const hasError = selected > 0 && selected !== required;
                  const inStockCount = inStockCounts[item.productId] || 0;

                  const isCollapsed = isSectionCollapsed(item.productId);

                  return (
                    <div
                      key={item.productId}
                      className="evm-staff-vin-selection-product-section"
                    >
                      <div
                        className="evm-staff-vin-selection-product-header"
                        onClick={() => toggleSection(item.productId)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="evm-staff-vin-selection-product-header-left">
                          <span className="evm-staff-vin-selection-collapse-icon">
                            {isCollapsed ? "▶" : "▼"}
                          </span>
                          <h3>{item.productName}</h3>
                          <span className="evm-staff-vin-selection-instock-info">
                            (Kho: {inStockCount} VIN InStock)
                          </span>
                        </div>
                        <span
                          className={`evm-staff-vin-selection-status ${
                            isComplete
                              ? "complete"
                              : hasError
                              ? "error"
                              : "pending"
                          }`}
                        >
                          Đã gán: {selected}/{required} VIN
                          {isComplete && " ✅"}
                          {hasError && " ⚠️"}
                        </span>
                      </div>

                      {!isCollapsed && (
                        <div className="evm-staff-vin-selection-product-content">
                          {available.length === 0 ? (
                            <div className="evm-staff-vin-selection-no-data">
                              ❌ Không có VIN nào khả dụng cho sản phẩm này
                            </div>
                          ) : available.length < required ? (
                            <div className="evm-staff-vin-selection-warning">
                              ⚠️ Chỉ có {available.length} VIN khả dụng, cần{" "}
                              {required} VIN
                            </div>
                          ) : null}

                          <div className="evm-staff-vin-selection-list">
                            {available.map((vinData) => {
                              const isSelected = selectedVins[
                                item.productId
                              ]?.includes(vinData.vin);

                              return (
                                <label
                                  key={vinData.vin}
                                  className={`evm-staff-vin-selection-item ${
                                    isSelected ? "selected" : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleVinToggle(
                                        item.productId,
                                        vinData.vin
                                      )
                                    }
                                  />
                                  <div className="evm-staff-vin-selection-info">
                                    <span className="evm-staff-vin-selection-code">
                                      {vinData.vin}
                                    </span>
                                    <span className="evm-staff-vin-selection-date">
                                      Ngày tạo:{" "}
                                      {new Date(
                                        vinData.createdAt
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="evm-staff-vin-selection-modal-footer">
            <div className="evm-staff-vin-selection-modal-actions">
              <button
                className="evm-staff-vin-selection-btn evm-staff-vin-selection-btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                className="evm-staff-vin-selection-btn evm-staff-vin-selection-btn-confirm"
                onClick={handleConfirm}
                disabled={loading || loadingVins}
              >
                {loading ? "Đang xử lý..." : "Xác nhận Allocate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinSelectionModal;
