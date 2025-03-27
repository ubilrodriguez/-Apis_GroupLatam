Aquí tienes una guía paso a paso detallada para ejecutar y probar el proyecto:

### **Paso 1: Configuración de la Base de Datos**
1. **Iniciar MySQL**:
   ```bash
   sudo service mysql start  # Linux
   mysql -u root -p          # Acceder a la consola
   ```

2. **Crear Base de Datos**:
   ```sql
   CREATE DATABASE ProdutsGroupLatam;
   USE ProdutsGroupLatam;
   ```

3. **Ejecutar Script de la Tabla**:
   ```sql
   CREATE TABLE producto1 (
       identificador INT PRIMARY KEY AUTO_INCREMENT,
       nombre_producto VARCHAR(255) NOT NULL,
       descripcion_producto TEXT,
       imagen_producto VARCHAR(500),
       fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

### **Paso 2: Configuración del Backend**
1. **Instalar Dependencias**:
   ```bash
   npm install express mysql2 multer cloudinary cors dotenv
   ```

2. **Archivo `.env`**:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=ProdutsGroupLatam
   CLOUDINARY_CLOUD_NAME=tu_cloud
   CLOUDINARY_API_KEY=tu_key
   CLOUDINARY_API_SECRET=tu_secret
   PORT=3000
   ```

3. **Estructura de `server.js`**:
   ```javascript
   const express = require('express');
   const multer = require('multer');
   const cloudinary = require('cloudinary').v2;
   const mysql = require('mysql2/promise');
   const cors = require('cors');
   const fs = require('fs-extra');
   require('dotenv').config();

   const app = express();
   const upload = multer({ dest: 'uploads/' });

   // Configuración de Cloudinary
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   // Pool de conexiones MySQL
   const pool = mysql.createPool({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME
   });

   app.use(cors());
   app.use(express.json());

   // Endpoint: Subir imagen
   app.post('/upload', upload.single('image'), async (req, res) => {
     try {
       const result = await cloudinary.uploader.upload(req.file.path);
       await fs.unlink(req.file.path);
       res.json({ url: result.secure_url });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   // Endpoint: Crear producto
   app.post('/productos', async (req, res) => {
     try {
       const [result] = await pool.query(
         'INSERT INTO producto1 SET ?',
         req.body
       );
       res.status(201).json({ id: result.insertId });
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   });

   // Repetir estructura para GET, PUT, DELETE...

   app.listen(process.env.PORT, () => {
     console.log(`🚀 Servidor en http://localhost:${process.env.PORT}`);
   });
   ```

### **Paso 3: Ejecutar el Backend**
```bash
node server.js
# Deberías ver: "🚀 Servidor en http://localhost:3000"
```

### **Paso 4: Probar Endpoints con Postman**

#### **1. Subir Imagen (POST /upload)**:
- **Método**: POST
- **URL**: `http://localhost:3000/upload`
- **Body**: `form-data`
  - Key: `image` (tipo File)
  - Value: Seleccionar archivo

**Respuesta Exitosa**:
```json
{
  "url": "https://res.cloudinary.com/.../imagen.jpg"
}
```

#### **2. Crear Producto (POST /productos)**:
- **Método**: POST
- **URL**: `http://localhost:3000/productos`
- **Body** (JSON):
  ```json
  {
    "nombre_producto": "Laptop Gamer",
    "descripcion_producto": "RTX 4080, 32GB RAM",
    "imagen_producto": "URL_DE_CLOUDINARY"
  }
  ```

**Respuesta Exitosa**:
```json
{
  "id": 1
}
```

#### **3. Obtener Productos (GET /productos)**:
- **Método**: GET
- **URL**: `http://localhost:3000/productos`

**Respuesta Exitosa**:
```json
[
  {
    "identificador": 1,
    "nombre_producto": "Laptop Gamer",
    "descripcion_producto": "RTX 4080, 32GB RAM",
    "imagen_producto": "https://...",
    "fecha_creacion": "2025-03-27T03:00:00.000Z",
    "fecha_actualizacion": "2025-03-27T03:00:00.000Z"
  }
]
```

### **Paso 5: Integración con Frontend (React)**
1. **Componente `ProductCreate.jsx`**:
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     
     try {
       // 1. Subir imagen si existe
       let imageUrl = '';
       if (file) {
         const formData = new FormData();
         formData.append('image', file);
         const uploadResponse = await axios.post('http://localhost:3000/upload', formData);
         imageUrl = uploadResponse.data.url;
       }

       // 2. Crear producto
       await axios.post('http://localhost:3000/productos', {
         nombre_producto: formData.nombre,
         descripcion_producto: formData.descripcion,
         imagen_producto: imageUrl
       });

       // 3. Redirigir
       navigate('/productos');
     } catch (error) {
       console.error('Error:', error);
     }
   };
   ```

### **Paso 6: Verificar Automatización de Timestamps**
- **Inspeccionar Base de Datos**:
  ```sql
  SELECT * FROM producto1;
  ```
  - `fecha_creacion` y `fecha_actualizacion` se actualizan automáticamente.

### **Paso 7: Validaciones**
1. **Backend - Validación de Campos**:
   ```javascript
   app.post('/productos', async (req, res) => {
     if (!req.body.nombre_producto) {
       return res.status(400).json({ error: "Nombre es requerido" });
     }
     // Resto del código...
   });
   ```

2. **Frontend - Validación en Formulario**:
   ```jsx
   <input 
     type="text" 
     required
     onChange={(e) => setFormData({...formData, nombre: e.target.value})}
   />
   ```

### **Paso 8: Configuración de CORS**
- **En `server.js`**:
  ```javascript
  app.use(cors({
    origin: 'http://localhost:5173', // URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
  ```

### **Flujo Completo de Ejecución**
1. Iniciar MySQL
2. Ejecutar servidor Node.js
3. Ejecutar aplicación React
4. Crear producto desde frontend → Sube imagen → Guarda en DB
5. Listar productos con imágenes desde Cloudinary
6. Actualizar/Eliminar y ver cambios en tiempo real

### **Troubleshooting Común**
1. **Error 500 en `/upload`**:
   - Verificar credenciales de Cloudinary
   - Asegurar que la carpeta `uploads` existe

2. **Campos Nulos en DB**:
   - Revisar que el JSON enviado coincida con la estructura de la tabla

3. **Problemas de CORS**:
   - Verificar el `origin` en la configuración de CORS
   - Usar `Access-Control-Allow-Headers: '*'` en desarrolloPaso 4: Ejecutar el Backend
bash
Copy
cd api-productos
node server.js
Deberías ver:

bash
Copy
🚀 Servidor en http://localhost:3000
Paso 5: Ejecutar el Frontend
bash
Copy
cd frontend-productos
npm run dev
Deberías ver:

bash
Copy
VITE v4.5.0 ready in 500 ms
➜  Local:   http://localhost:5173/
Paso 6: Probar el Sistema
Abrir navegador:

Frontend: http://localhost:5173

Backend (opcional): http://localhost:3000/productos

Flujo de creación de producto:

Paso 1: Haz clic en "Nuevo Producto".

Paso 2: Completa el formulario y sube una imagen.

Paso 3: Verifica que el producto aparezca en el listado.

Paso 7: Verificar Base de Datos
Conéctate a MySQL:

bash
Copy
mysql -u root -p
USE ProdutsGroupLatam;
Consulta los datos:

sql
Copy
SELECT * FROM producto1;
Deberías ver los productos creados con sus fechas automáticas.

Solución de Problemas Comunes
Error 500 al subir imágenes:

Verifica las credenciales de Cloudinary en .env.

Crea la carpeta uploads manualmente:

bash
Copy
mkdir api-productos/uploads
Conexión rechazada por MySQL:

Asegúrate que el servicio esté activo.

Verifica usuario/contraseña en .env.

Errores CORS en el frontend:

En server.js, configura CORS:

javascript
Copy
app.use(cors({
  origin: 'http://localhost:5173' // URL de tu frontend
}));
Comandos Útiles
Acción	Comando
Reiniciar backend	Ctrl + C → node server.js
Reiniciar frontend	Ctrl + C → npm run dev
Limpiar imágenes temporales	rm -rf api-productos/uploads/*

