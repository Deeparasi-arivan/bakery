const http = require('http');

function get(path, token = '') {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    http.get({ hostname: 'localhost', port: 5000, path, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

const post = (path, body) => new Promise((resolve) => {
  const data = JSON.stringify(body);
  const req = http.request({
    hostname: 'localhost', port: 5000, path, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  }, (res) => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => resolve(JSON.parse(b)));
  });
  req.write(data);
  req.end();
});

async function run() {
  const ownerRes = await post('/api/auth/owner/login', { phone: '9042487448', password: 'deepadhiya' });
  const ownerToken = ownerRes.token;

  const ordersRes = await get('/api/orders', ownerToken);
  console.log('GET /api/orders (Owner) -> Status:', ordersRes.status, 'Total Orders:', ordersRes.data?.orders?.length);

  const productsRes = await get('/api/products');
  console.log('GET /api/products -> Status:', productsRes.status, 'Count:', productsRes.data?.products?.length);

  const expensesRes = await get('/api/expenses', ownerToken);
  console.log('GET /api/expenses (Owner) -> Status:', expensesRes.status, 'Count:', expensesRes.data?.expenses?.length);

  const bulkRes = await get('/api/bulk-orders', ownerToken);
  console.log('GET /api/bulk-orders (Owner) -> Status:', bulkRes.status, 'Count:', bulkRes.data?.bulkOrders?.length);

  const salesRes = await get('/api/sales', ownerToken);
  console.log('GET /api/sales (Owner) -> Status:', salesRes.status, 'Count:', salesRes.data?.sales?.length);
}

run();
