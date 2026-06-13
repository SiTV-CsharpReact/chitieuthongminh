const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/Notifications/admin',
  method: 'GET'
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});
req.end();
