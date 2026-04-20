const url = "https://www.vpbank.com.vn/ca-nhan/the-tin-dung";
fetch("http://localhost:5000/api/Scraper/extract-card-details", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url })
}).then(res => res.json()).then(console.log).catch(console.error);
