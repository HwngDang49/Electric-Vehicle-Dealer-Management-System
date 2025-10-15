import React, { useState, useEffect } from "react";
import "./ContractView.css";

const ContractView = ({ order, onBack, onContractCreated }) => {
  console.log("ContractView received order:", order);

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
    }
  );

  console.log("ContractView received order:", order);
  console.log("ContractView - order.hasContract:", order.hasContract);
  console.log("ContractView - order.contractData:", order.contractData);
  console.log("ContractView - hasContract:", hasContract);
  console.log("ContractView - contractData:", contractData);

  // Sync with order data
  useEffect(() => {
    console.log(
      "ContractView - useEffect - order.hasContract:",
      order.hasContract
    );
    console.log(
      "ContractView - useEffect - order.contractData:",
      order.contractData
    );
    console.log("ContractView - useEffect - order object:", order);
    setHasContract(order.hasContract || false);
    setContractData(
      order.contractData || {
        contractNumber: "",
        prefix: "",
        runningNumber: "",
        pdfFile: null,
        signedAt: "",
        isSigned: false,
      }
    );
  }, [order.hasContract, order.contractData]);

  const handleGenerateNumber = () => {
    console.log("Generate Number button clicked - no logic implemented");
  };

  const handleUploadPDF = (event) => {
    const file = event.target.files[0];
    if (file) {
      setContractData((prev) => ({
        ...prev,
        pdfFile: file,
      }));
      console.log("PDF uploaded:", file.name);
    }
  };

  const handleSendToESign = () => {
    console.log("Sending to eSign:", contractData.contractNumber);
    alert("Đã gửi hợp đồng để ký điện tử");
  };

  const handleMarkAsSigned = () => {
    setContractData((prev) => ({
      ...prev,
      isSigned: true,
      signedAt: new Date().toLocaleDateString("vi-VN"),
    }));
    console.log("Contract marked as signed");
  };

  const handleCreateNewContract = () => {
    setHasContract(true);
    console.log("Creating new contract for order:", order.id);
    console.log("ContractView - Setting hasContract to true");
  };

  const handleConfirmOrder = () => {
    console.log("Confirming order with contract:", contractData);
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
            <h1>Hợp đồng đơn hàng {order.id}</h1>
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
          {!hasContract ? (
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
                      value={contractData.contractNumber}
                      onChange={(e) =>
                        setContractData((prev) => ({
                          ...prev,
                          contractNumber: e.target.value,
                        }))
                      }
                      placeholder="Nhập contract number"
                      className="preview-field"
                      readOnly={order.hasContract}
                    />
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

              {/* Sign Section */}
              <div className="form-section">
                <h3>Sign</h3>
                <div className="sign-actions">
                  <button
                    className="manual-sign-btn"
                    onClick={handleMarkAsSigned}
                    disabled={order.hasContract}
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
                    Mark as Signed (manual)
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
                  disabled={order.hasContract}
                  onClick={() => {
                    console.log("Confirming contract for order:", order.id);

                    // Save contract data
                    const contractInfo = {
                      orderId: order.id,
                      contractNumber: contractData.contractNumber,
                      prefix: contractData.prefix,
                      runningNumber: contractData.runningNumber,
                      pdfFile: contractData.pdfFile,
                      signedAt: contractData.signedAt,
                      isSigned: contractData.isSigned,
                    };

                    // Update order status to "has contract"
                    console.log(
                      "ContractView - Calling onContractCreated with:",
                      order.id,
                      contractInfo
                    );
                    if (onContractCreated) {
                      onContractCreated(order.id, contractInfo);
                    }

                    // Show success message
                    alert("Hợp đồng đã được xác nhận thành công!");

                    // Redirect back to Order Detail page
                    onBack();
                  }}
                >
                  Xác nhận hợp đồng
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
