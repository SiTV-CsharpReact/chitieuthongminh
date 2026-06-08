using System.Net;
using System.Net.Mail;
using backend.Models;
using Microsoft.Extensions.Configuration;

namespace backend.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendCardInfoAsync(string toEmail, CreditCard card)
    {
        var smtpSettings = _config.GetSection("SmtpSettings");
        string server = smtpSettings["Server"] ?? "smtp.gmail.com";
        int port = int.Parse(smtpSettings["Port"] ?? "587");
        string senderName = smtpSettings["SenderName"] ?? "CredBack";
        string senderEmail = smtpSettings["SenderEmail"] ?? "";
        string username = smtpSettings["Username"] ?? "";
        string password = smtpSettings["Password"] ?? "";

        using var client = new SmtpClient(server, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = $"[CredBack] Thông tin thẻ tín dụng: {card.Name}",
            IsBodyHtml = true,
            Body = GenerateEmailBody(card)
        };

        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }

    private string GenerateEmailBody(CreditCard card)
    {
        string rulesHtml = "";
        foreach(var rule in card.CashbackRules)
        {
            string capText = rule.CapAmount > 0 ? $" <span style='color:#64748b; font-size:14px;'>(Tối đa {rule.CapAmount.Value.ToString("N0")}đ)</span>" : "";
            rulesHtml += $"<li style='margin-bottom:10px;'><strong>{rule.Percentage}%</strong> cho chi tiêu <strong>{rule.Category}</strong>{capText}</li>";
        }

        string annualFee = card.AnnualFee > 0 ? $"{card.AnnualFee.ToString("N0")} VNĐ" : "Miễn phí";
        string maxCashback = card.MaxCashbackPerMonth > 0 ? $"{card.MaxCashbackPerMonth.Value.ToString("N0")} VNĐ" : "Không giới hạn";

        string registerLink = !string.IsNullOrEmpty(card.RegisterUrl) 
            ? $"<a href='{card.RegisterUrl}' style='display:inline-block; padding:14px 30px; background:linear-gradient(135deg, #10b981 0%, #047857 100%); color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-size:16px; box-shadow:0 4px 15px rgba(16,185,129,0.3);'>Đăng ký thẻ ngay</a>" 
            : "";

        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin:0; padding:0; background-color:#f4f7f6; font-family:""Segoe UI"", ""Helvetica Neue"", Helvetica, Arial, sans-serif;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f7f6; padding: 40px 10px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05); max-width:600px; width:100%;'>
          <!-- HEADER -->
          <tr>
            <td align='center' style='background: linear-gradient(135deg, #10b981 0%, #047857 100%); padding: 40px 20px;'>
              <h1 style='margin:0; color:#ffffff; font-size:36px; font-weight:900; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;'>
                <span style='color:#fef08a;'>$</span> CredBack
              </h1>
              <p style='margin:10px 0 0 0; color:#d1fae5; font-size:16px;'>Gợi ý thẻ tín dụng hoàn tiền thông minh</p>
            </td>
          </tr>
          
          <!-- BODY CONTENT -->
          <tr>
            <td style='padding: 40px 30px;'>
              <h2 style='margin:0 0 20px 0; color:#1f2937; font-size:24px; text-align:center;'>Chi tiết thẻ bạn đã lưu</h2>
              
              <div style='text-align:center; margin-bottom:30px;'>
                <img src='{card.ImageUrl}' alt='{card.Name}' style='max-width:100%; height:auto; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.15);' />
              </div>
              
              <h3 style='margin:0 0 5px 0; color:#111827; font-size:22px; text-align:center;'>{card.Name}</h3>
              <p style='margin:0 0 30px 0; color:#6b7280; font-size:16px; text-align:center;'>Phát hành bởi <strong style='color:#1f2937;'>{card.BankName}</strong></p>
              
              <div style='background-color:#f8fafc; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px;'>
                <h4 style='margin:0 0 15px 0; color:#047857; font-size:18px;'>🔥 Quy tắc hoàn tiền nổi bật:</h4>
                <ul style='margin:0; padding-left:20px; color:#374151; line-height:1.6;'>
                  {rulesHtml}
                </ul>
              </div>
              
              <table width='100%' border='0' cellspacing='0' cellpadding='0' style='margin-bottom:30px;'>
                <tr>
                  <td width='32%' align='center' valign='top' style='padding:15px 10px; background-color:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'>
                    <p style='margin:0; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;'>Hoàn tối đa</p>
                    <p style='margin:8px 0 0 0; font-size:15px; font-weight:bold; color:#10b981;'>{maxCashback}</p>
                  </td>
                  <td width='2%'></td>
                  <td width='32%' align='center' valign='top' style='padding:15px 10px; background-color:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'>
                    <p style='margin:0; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;'>Phí thường niên</p>
                    <p style='margin:8px 0 0 0; font-size:15px; font-weight:bold; color:#f59e0b;'>{annualFee}</p>
                  </td>
                  <td width='2%'></td>
                  <td width='32%' align='center' valign='top' style='padding:15px 10px; background-color:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'>
                    <p style='margin:0; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;'>Lương tối thiểu</p>
                    <p style='margin:8px 0 0 0; font-size:15px; font-weight:bold; color:#3b82f6;'>{card.MinSalary.ToString("N0")} đ</p>
                  </td>
                </tr>
              </table>
              
              <div style='text-align:center;'>
                {registerLink}
              </div>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td align='center' style='background-color:#f8fafc; padding: 25px; border-top:1px solid #e2e8f0;'>
              <p style='margin:0; color:#94a3b8; font-size:13px;'>Email này được gửi tự động từ hệ thống CredBack.</p>
              <p style='margin:5px 0 0 0; color:#94a3b8; font-size:13px;'>© 2026 CredBack. Tất cả các quyền được bảo lưu.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }
}
