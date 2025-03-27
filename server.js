require('dotenv').config();
// const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const express = require('express');
const multer = require('multer');
const cloudinary = require('./upload');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs-extra'); // Importación necesaria


const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Pool de conexiones MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --------------------------------------
// ENDPOINTS CRUD
// --------------------------------------
// Endpoint para subir imágenes
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      await fs.unlink(req.file.path); // Ahora funciona
      res.json({ url: result.secure_url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Modifica el endpoint de creación de productos
  app.post('/productos', async (req, res) => {
    const { nombre_producto, descripcion_producto, imagen_url } = req.body;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO producto1 (nombre_producto, descripcion_producto, imagen_producto) VALUES (?, ?, ?)',
        [nombre_producto, descripcion_producto, imagen_url]
      );
      
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
// [R] READ - Obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM producto1');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [R] READ - Obtener un producto por ID
app.get('/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM producto1 WHERE identificador = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [U] UPDATE - Actualizar producto
app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_producto, descripcion_producto, imagen_producto } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE producto1 SET nombre_producto = ?, descripcion_producto = ?, imagen_producto = ? WHERE identificador = ?',
            [nombre_producto, descripcion_producto, imagen_producto, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const [updatedProduct] = await pool.query('SELECT * FROM producto1 WHERE identificador = ?', [id]);
        res.json(updatedProduct[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [D] DELETE - Eliminar producto
app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM producto1 WHERE identificador = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 API corriendo en http://localhost:${port}`);
});