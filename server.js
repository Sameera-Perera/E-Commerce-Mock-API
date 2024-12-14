const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom login route
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value();

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.jsonp({ token: 'fake-jwt-token', user });
  } else {
    res.status(401).jsonp({ error: 'Invalid email or password' });
  }
});

// Custom register route
server.post('/register', (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value();

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    res.status(400).jsonp({ error: 'User already exists' });
  } else {
    const newUser = { id: users.length + 1, email, password };
    router.db.get('users').push(newUser).write();
    res.status(201).jsonp(newUser);
  }
});

// Custom route to return products with pagination metadata
server.get('/products', (req, res) => {
  const page = parseInt(req.query._page) || 1;
  const limit = parseInt(req.query._limit) || 10;

  // Get full products data
  const products = router.db.get('products').value();
  
  // Paginate the data manually
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Calculate pagination metadata
  const total = products.length;
  const meta = {
    page: page,
    pageSize: paginatedProducts.length,
    total: total
  };

  // Send the response with meta and data
  res.jsonp({
    meta: meta,
    data: paginatedProducts
  });
});

server.get('/categories', (req, res) => {
  const categories = router.db.get('categories').value();
  res.jsonp({
    data: categories
  });
});

// Use default router
server.use(router);

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('JSON Server is running');
});
