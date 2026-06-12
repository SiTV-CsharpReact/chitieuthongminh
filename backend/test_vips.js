async function run() {
  const loginRes = await fetch("http://localhost:5000/api/Auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@credback.com", password: "password123" })
  });
  const { token } = await loginRes.json();
  const res = await fetch("http://localhost:5000/api/Users/admin/vips", {
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
