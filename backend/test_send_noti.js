async function run() {
  const loginRes = await fetch("http://localhost:5000/api/Auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@credback.com", password: "password123" })
  });
  const { token } = await loginRes.json();
  
  // Target Sĩ Văn's ID
  const targetId = "69e85302d76f862de69a6423";
  
  const sendRes = await fetch("http://localhost:5000/api/Notifications/admin", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({
      Target: targetId,
      Title: "⏳ Sắp đến hạn thanh toán thẻ",
      Message: "Thẻ VPBank S Rewards Mastercard của bạn sẽ đến hạn thanh toán trong 13 ngày tới. Vui lòng sắp xếp thanh toán.",
      Link: "/wallet"
    })
  });
  
  const result = await sendRes.json();
  console.log("Send Result:", result);
  
  // Now verify it's in the DB
  const getRes = await fetch("http://localhost:5000/api/Notifications", {
    headers: { "Authorization": "Bearer " + token }
  });
  // Admin checking their own notifications won't see it if they are not the target, wait.
  // We can fetch admin notifications:
  const getAdminRes = await fetch("http://localhost:5000/api/Notifications/admin", {
     headers: { "Authorization": "Bearer " + token }
  });
  const notis = await getAdminRes.json();
  console.log("Admin Notis:", notis.slice(0, 1));
}
run();
