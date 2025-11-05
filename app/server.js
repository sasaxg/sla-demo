
const express = require('express');     //framework để tạo web server và định nghĩa các API endpoint"
const client = require('prom-client');
const app = express();
const register = new client.Registry();     //register là nơi lưu tất cả metrics mà Prometheus se tt"
client.collectDefaultMetrics({ register });     //tdthuthap"

//Tạo Histogram đo thời gian phản hồi HTTP"
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'url'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1],   //mốc
  registers: [register]
});
//Endpoint /health — kiểm tra tình trạng server
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api', async (req, res) => {
  const end = httpRequestDuration.startTimer({ method: 'GET', url: '/api' });
  // Tạo độ trễ
  //await new Promise(resolve => setTimeout(resolve, Math.random() * 450 + 50));
  end();
  res.json({ data: 'Hello from SLA Demo' });
});
//endpoint chính Prometheus gọi tới (ví dụ /metrics) để lấy toàn bộ dữ liệu metric.
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(8080, () => console.log('App running on port 8080'));