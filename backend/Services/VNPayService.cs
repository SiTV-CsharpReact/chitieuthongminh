using backend.Utils;

namespace backend.Services;

public class VNPayService
{
    private readonly IConfiguration _config;

    public VNPayService(IConfiguration config)
    {
        _config = config;
    }

    public string CreatePaymentUrl(HttpContext context, string userId, decimal amount = 199000)
    {
        var vnpay = new VnPayLibrary();
        
        var vnp_Returnurl = _config["VNPay:ReturnUrl"];
        var vnp_Url = _config["VNPay:BaseUrl"];
        var vnp_TmnCode = _config["VNPay:TmnCode"];
        var vnp_HashSecret = _config["VNPay:HashSecret"];

        // OrderInfo or TxnRef can contain the userId. We will use TxnRef.
        var orderId = $"VIP_{userId}_{DateTime.Now.Ticks}";

        vnpay.AddRequestData("vnp_Version", "2.1.0");
        vnpay.AddRequestData("vnp_Command", "pay");
        vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode ?? "");
        // Amount is multiplied by 100
        vnpay.AddRequestData("vnp_Amount", (amount * 100).ToString("0"));
        vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        vnpay.AddRequestData("vnp_CurrCode", "VND");
        vnpay.AddRequestData("vnp_IpAddr", VnPayLibrary.GetIpAddress(context));
        vnpay.AddRequestData("vnp_Locale", "vn");
        vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan nang cap VIP Chi Tieu Thong Minh");
        vnpay.AddRequestData("vnp_OrderType", "other");
        vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl ?? "");
        vnpay.AddRequestData("vnp_TxnRef", orderId);

        string paymentUrl = vnpay.CreateRequestUrl(vnp_Url ?? "", vnp_HashSecret ?? "");

        return paymentUrl;
    }

    public bool ValidateSignature(IQueryCollection collections, out string txnRef, out string responseCode)
    {
        var vnpay = new VnPayLibrary();
        
        foreach (var (key, value) in collections)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
            {
                vnpay.AddResponseData(key, value.ToString());
            }
        }

        txnRef = vnpay.GetResponseData("vnp_TxnRef");
        responseCode = vnpay.GetResponseData("vnp_ResponseCode");
        var vnp_SecureHash = collections["vnp_SecureHash"].ToString();
        var vnp_HashSecret = _config["VNPay:HashSecret"];

        bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret ?? "");
        return checkSignature;
    }
}
