import React, { useState, useEffect } from "react";
import "./ContractView.css";
import { API_ENDPOINTS } from "../../services/constants";
import apiClient from "../../services/api";

const ContractView = ({ order, onBack, onContractCreated }) => {
  // Check if order has contract
  const [hasContract, setHasContract] = useState(order.hasContract || false);
  const [contractData, setContractData] = useState(
    order.contractData || {
      contractNumber: "",
      prefix: "",
      runningNumber: "",
      pdfFile: null,
      signedAt: "",
      isSigned: false,
      depositAmount: 0, // Thêm field deposit amount
    }
  );
  const [loading, setLoading] = useState(false);

  // Sync with order data
  useEffect(() => {
    setHasContract(order.hasContract || false);
    setContractData(
      order.contractData || {
        contractNumber: "",
        prefix: "",
        runningNumber: "",
        pdfFile: null,
        signedAt: "",
        isSigned: false,
        depositAmount: 0,
      }
    );
  }, [order.hasContract, order.contractData]);

  const handleGenerateNumber = () => {};

  const handleUploadPDF = (event) => {
    const file = event.target.files[0];
    if (file) {
      setContractData((prev) => ({
        ...prev,
        pdfFile: file,
      }));
    }
  };

  const handleSendToESign = () => {
    alert("Đã gửi hợp đồng để ký điện tử");
  };

  const handleMarkAsSigned = async () => {
    try {
      setLoading(true);

      // Validate: Contract must be created first
      if (!order.hasContract) {
        alert("Vui lòng tạo hợp đồng trước khi ký!");
        setLoading(false);
        return;
      }


      // Call backend API to mark contract as signed
      const response = await apiClient.patch(
        `/orders/${order.backendId}/mark-as-signed`
      );

      

      // Extract signed date from response
      const signedAtData =
        response.data?.value || response.data?.data || new Date().toISOString();
      const signedAtDate = new Date(signedAtData);
      const formattedDate = signedAtDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Update local state
      setContractData((prev) => ({
        ...prev,
        isSigned: true,
        signedAt: formattedDate,
      }));

      alert(`✅ Hợp đồng đã được ký thành công!\nThời gian: ${formattedDate}`);
    } catch (error) {
      console.error("❌ Error signing contract:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể ký hợp đồng";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewContract = () => {
    setHasContract(true);
  };

  const handleConfirmOrder = () => {
    alert("Đã xác nhận đơn hàng với hợp đồng");
  };

  return (
    <div className="contract-view">
      <div className="contract-content">
        {/* Header */}
        <div className="contract-header">
          <button className="back-btn" onClick={onBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="header-info">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1>Hợp đồng đơn hàng {order.id}</h1>
              {order.hasContract && (
                <span
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✓ Đã có hợp đồng
                </span>
              )}
            </div>
            <div className="order-info">
              <span className="customer">
                Khách hàng: {order.customer?.name || "N/A"}
              </span>
              <span className="total">Tổng: {order.amount || "0"} ₫</span>
            </div>
          </div>
        </div>

        {/* Contract Content */}
        <div className="contract-body">
          {!hasContract && !order.hasContract ? (
            // No contract - show create button
            <div className="no-contract-section">
              <div className="no-contract-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="14,2 14,8 20,8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="16"
                    y1="13"
                    x2="8"
                    y2="13"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="16"
                    y1="17"
                    x2="8"
                    y2="17"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="10,9 9,9 8,9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2>Chưa có hợp đồng</h2>
              <p>Đơn hàng này chưa có hợp đồng. Bạn có thể tạo hợp đồng mới.</p>
              <button
                className="create-contract-btn"
                onClick={handleCreateNewContract}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Tạo hợp đồng mới
              </button>
            </div>
          ) : (
            // Has contract - show contract form
            <div className="contract-form">
              {/* Info banner for existing contract */}
              {order.hasContract && (
                <div
                  style={{
                    backgroundColor: "#d1fae5",
                    border: "1px solid #10b981",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <strong style={{ color: "#059669" }}>
                      Đơn hàng này đã có hợp đồng
                    </strong>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#047857",
                      }}
                    >
                      Thông tin hợp đồng chỉ được xem, không thể chỉnh sửa.
                    </p>
                  </div>
                </div>
              )}

              {/* Contract Number Section */}
              <div className="form-section">
                <h3>Contract Number</h3>

                <div className="contract-number-fields">
                  <div className="field-group">
                    <label>Prefix</label>
                    <input
                      type="text"
                      value={contractData.prefix}
                      onChange={(e) =>
                        setContractData((prev) => ({
                          ...prev,
                          prefix: e.target.value,
                        }))
                      }
                      placeholder="Nhập prefix"
                      readOnly={order.hasContract}
                    />
                  </div>
                  <div className="field-group">
                    <label>Running</label>
                    <input
                      type="text"
                      value={contractData.runningNumber}
                      onChange={(e) =>
                        setContractData((prev) => ({
                          ...prev,
                          runningNumber: e.target.value,
                        }))
                      }
                      placeholder="Nhập running number"
                      readOnly={order.hasContract}
                    />
                  </div>
                  <div className="field-group">
                    <label>Preview</label>
                    <input
                      type="text"
                      value={
                        order.hasContract && order.contractData?.contractNumber
                          ? order.contractData.contractNumber
                          : contractData.contractNumber
                      }
                      onChange={(e) =>
                        setContractData((prev) => ({
                          ...prev,
                          contractNumber: e.target.value,
                        }))
                      }
                      placeholder="Nhập contract number"
                      className="preview-field"
                      readOnly={order.hasContract}
                      style={
                        order.hasContract
                          ? {
                              backgroundColor: "#f3f4f6",
                              fontWeight: "600",
                              color: "#059669",
                            }
                          : {}
                      }
                    />
                    {order.hasContract &&
                      order.contractData?.contractNumber && (
                        <small style={{ color: "#059669", fontSize: "12px" }}>
                          ✓ Hợp đồng đã được tạo
                        </small>
                      )}
                  </div>
                </div>
              </div>

              {/* Contract File Section */}
              <div className="form-section">
                <h3>File hợp đồng (PDF)</h3>
                <div className="upload-area">
                  {contractData.pdfFile ? (
                    <div className="uploaded-file">
                      <div className="file-info">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <polyline
                            points="14,2 14,8 20,8"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        <div className="file-details">
                          <p className="file-name">
                            {contractData.pdfFile.name}
                          </p>
                          <p className="file-size">
                            {(contractData.pdfFile.size / 1024 / 1024).toFixed(
                              2
                            )}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                      <div className="file-actions">
                        <button
                          className="remove-file-btn"
                          onClick={() => {
                            setContractData((prev) => ({
                              ...prev,
                              pdfFile: null,
                            }));
                          }}
                          disabled={order.hasContract}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-zone">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <polyline
                          points="7,10 12,15 17,10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="12"
                          y1="15"
                          x2="12"
                          y2="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <p>Chọn file PDF để upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadPDF}
                    style={{ display: "none" }}
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`upload-btn ${
                      order.hasContract ? "disabled" : ""
                    }`}
                    style={{
                      pointerEvents: order.hasContract ? "none" : "auto",
                      opacity: order.hasContract ? 0.5 : 1,
                    }}
                  >
                    {contractData.pdfFile ? "Thay đổi PDF" : "Upload PDF"}
                  </label>
                </div>
              </div>

              {/* Deposit Amount Section */}
              <div className="form-section">
                <h3>Thông tin đặt cọc</h3>
                <div className="form-group">
                  <label>Số tiền đặt cọc yêu cầu (VND) *</label>
                  <input
                    type="number"
                    value={contractData.depositAmount}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        depositAmount: e.target.value,
                      }))
                    }
                    placeholder="Nhập số tiền đặt cọc (VD: 50000000)"
                    disabled={order.hasContract}
                    min="0"
                    step="1000000"
                  />
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Số tiền khách hàng cần đặt cọc để xác nhận đơn hàng
                  </small>
                </div>
              </div>

              {/* Sign Section */}
              <div className="form-section">
                <h3>Sign</h3>
                <div className="sign-actions">
                  <button
                    className="manual-sign-btn"
                    onClick={handleMarkAsSigned}
                    disabled={
                      !order.hasContract || contractData.isSigned || loading
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {loading
                      ? "Đang xử lý..."
                      : contractData.isSigned
                      ? "Đã ký"
                      : "Mark as Signed (manual)"}
                  </button>
                  <div className="signed-at-field">
                    <label>Signed at</label>
                    <input
                      type="text"
                      value={contractData.signedAt}
                      placeholder="—"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Confirm Contract Button */}
              <div className="form-section">
                <button
                  className="confirm-contract-btn"
                  disabled={order.hasContract || loading}
                  onClick={async () => {
                    try {
                      setLoading(true);

                      // Validate required fields
                      if (
                        !contractData.depositAmount ||
                        contractData.depositAmount <= 0
                      ) {
                        alert("Vui lòng nhập số tiền đặt cọc yêu cầu!");
                        setLoading(false);
                        return;
                      }

                        "📤 Creating contract for order:",
                        order.backendId
                      );

                      // Call backend API to create contract
                      const response = await apiClient.post(
                        API_ENDPOINTS.ORDERS.CREATE_CONTRACT(order.backendId),
                        {
                          ContractFileUrl: contractData.pdfFile
                            ? URL.createObjectURL(contractData.pdfFile)
                            : null,
                          RequiredDepositAmount:
                            parseFloat(contractData.depositAmount) || 0,
                        }
                      );

                        "✅ Contract created successfully:",
                        response.data
                      );

                      // Extract contract number from response
                      const contractNo =
                        response.data?.value ||
                        response.data?.data ||
                        "UNKNOWN";

                      // Save contract data for frontend display
                      const contractInfo = {
                        orderId: order.id,
                        backendOrderId: order.backendId,
                        contractNumber: contractNo,
                        prefix: contractData.prefix,
                        runningNumber: contractData.runningNumber,
                        pdfFile: contractData.pdfFile,
                        signedAt: contractData.signedAt,
                        isSigned: contractData.isSigned,
                        depositAmount: contractData.depositAmount,
                      };

                      // Update order status to "has contract"
                      if (onContractCreated) {
                        onContractCreated(order.id, contractInfo);
                      }

                      // Show success message
                      alert(
                        `✅ Hợp đồng đã được tạo thành công!\nMã hợp đồng: ${contractNo}`
                      );

                      // Redirect back to Order Detail page
                      onBack();
                    } catch (error) {
                      console.error("❌ Error creating contract:", error);
                      const errorMessage =
                        error.response?.data?.errors?.[0] ||
                        error.response?.data?.message ||
                        error.message ||
                        "Không thể tạo hợp đồng";
                      alert(`Lỗi: ${errorMessage}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận hợp đồng"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractView;
