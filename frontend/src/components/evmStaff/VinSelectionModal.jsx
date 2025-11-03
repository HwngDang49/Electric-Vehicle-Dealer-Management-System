import React, { useState, useEffect } from "react";
import "./VinSelectionModal.css";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import { useToast } from "../../contexts/useToast";

const VinSelectionModal = ({ isOpen, onClose, order, onConfirm }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [availableVins, setAvailableVins] = useState({}); // { productId: [{ vin, createdAt, ... }] }
  const [selectedVins, setSelectedVins] = useState({}); // { productId: [vin1, vin2, ...] }
  const [loadingVins, setLoadingVins] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      loadAvailableVins();
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
    <div className="vin-modal-overlay" onClick={onClose}>
      <div className="vin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vin-modal-header">
          <h2>Gán VIN cho PO ID {order?.id}</h2>
          <button className="vin-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="vin-modal-body">
          {loadingVins ? (
            <div className="vin-loading">
              <div className="spinner"></div>
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

                return (
                  <div key={item.productId} className="vin-product-section">
                    <div className="vin-product-header">
                      <h3>{item.productName}</h3>
                      <span
                        className={`vin-selection-status ${
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

                    {available.length === 0 ? (
                      <div className="vin-no-data">
                        ❌ Không có VIN nào khả dụng cho sản phẩm này
                      </div>
                    ) : available.length < required ? (
                      <div className="vin-warning">
                        ⚠️ Chỉ có {available.length} VIN khả dụng, cần{" "}
                        {required} VIN
                      </div>
                    ) : null}

                    <div className="vin-list">
                      {available.map((vinData) => {
                        const isSelected = selectedVins[
                          item.productId
                        ]?.includes(vinData.vin);

                        return (
                          <label
                            key={vinData.vin}
                            className={`vin-item ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                handleVinToggle(item.productId, vinData.vin)
                              }
                            />
                            <div className="vin-info">
                              <span className="vin-code">{vinData.vin}</span>
                              <span className="vin-date">
                                Ngày tạo:{" "}
                                {new Date(vinData.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="vin-modal-footer">
          <button
            className="vin-btn vin-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="vin-btn vin-btn-confirm"
            onClick={handleConfirm}
            disabled={loading || loadingVins}
          >
            {loading ? "Đang xử lý..." : "Xác nhận Allocate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VinSelectionModal;
