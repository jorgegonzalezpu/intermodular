const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Configuración del servidor
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'svelte_store'
});

// Configurar almacenamiento para las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  }
});

// Middleware de multer
const upload = multer({ storage });


// Conectar a la base de datos
db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Rutas para productos
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/products', (req, res) => {
  const { name, price, stock, image_url } = req.body;
  const query = 'INSERT INTO products (name, price, stock, image_url) VALUES (?, ?, ?, ?)';
  db.query(query, [name, price, stock, image_url], (err, results) => {
      if (err) throw err;
      res.json({ id: results.insertId, name, price, stock, image_url });
  });
});


app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, stock, image_url } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, stock = ?, image_url = ? WHERE id = ?';
  db.query(query, [name, price, stock, image_url, id], err => {
      if (err) throw err;
      res.json({ message: 'Producto actualizado' });
  });
});


app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], err => {
        if (err) throw err;
        res.json({ message: 'Producto eliminado' });
    });
});

// Rutas para pedidos
app.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/orders', (req, res) => {
  const { customer, products, total } = req.body;

  // Validar que los datos sean correctos
  if (!customer || !Array.isArray(products) || products.length === 0 || isNaN(total)) {
      return res.status(400).json({ error: 'Datos de pedido inválidos' });
  }

  // Insertar el pedido en la base de datos
  const query = 'INSERT INTO orders (customer, products, total) VALUES (?, ?, ?)';
  db.query(query, [customer, JSON.stringify(products), total], (err, results) => {
      if (err) {
          console.error('Error al registrar el pedido:', err);
          return res.status(500).json({ error: 'Error al registrar el pedido' });
      }

      res.json({
          id: results.insertId,
          customer,
          products: JSON.stringify(products),
          total,
      });
  });
});


// Para updatear el stock
app.post('/update-stock', (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Productos inválidos' });
  }

  const queries = products.map(product => {
      return new Promise((resolve, reject) => {
          const query = 'UPDATE products SET stock = stock - ? WHERE id = ?';
          db.query(query, [product.quantity, product.id], (err) => {
              if (err) return reject(err);
              resolve();
          });
      });
  });

  Promise.all(queries)
      .then(() => res.json({ message: 'Stock actualizado correctamente' }))
      .catch(err => {
          console.error('Error al actualizar el stock:', err);
          res.status(500).json({ error: 'Error al actualizar el stock' });
      });
});

// Ruta para subir imágenes
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
  }
  // Devuelve la ruta de la imagen
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Asegúrate de que la carpeta "uploads" sea accesible públicamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
