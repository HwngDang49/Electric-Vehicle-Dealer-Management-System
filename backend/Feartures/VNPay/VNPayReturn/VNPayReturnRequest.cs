using Ardalis.Result;
using MediatR;

namespace backend.Feartures.VNPay.VNPayReturn;

public record VNPayReturnRequest : IRequest<Result<VNPayReturnResponse>>
{
    // Core params needed for processing
    public string vnp_TxnRef { get; init; } = "";
    public string vnp_Amount { get; init; } = "";
    public string vnp_ResponseCode { get; init; } = "";
    public string vnp_TransactionStatus { get; init; } = "";
    public string vnp_SecureHash { get; init; } = "";
    public string vnp_TransactionNo { get; init; } = "";
    public string vnp_BankCode { get; init; } = "";
    
    // Additional params for signature verification
    public string vnp_TmnCode { get; init; } = "";
    public string vnp_BankTranNo { get; init; } = "";
    public string vnp_CardType { get; init; } = "";
    public string vnp_PayDate { get; init; } = "";
    public string vnp_OrderInfo { get; init; } = "";
    public string vnp_TransactionType { get; init; } = "";
    public string vnp_SecureHashType { get; init; } = "";
    
    // Extra params VNPay might send
    public string vnp_Locale { get; init; } = "";
    public string vnp_CurrCode { get; init; } = "";
    public string vnp_Command { get; init; } = "";
    public string vnp_Version { get; init; } = "";
}

