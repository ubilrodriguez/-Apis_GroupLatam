📚 Base de Datos

CREATE TABLE producto1 (
    identificador INT PRIMARY KEY AUTO_INCREMENT,
    nombre_producto VARCHAR(255) NOT NULL,
    descripcion_producto TEXT,
    imagen_producto VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
🌐 Endpoints API
Método	Endpoint	Descripción
POST	/productos	Crear producto
GET	/productos	Obtener todos los productos
GET	/productos/:id	Obtener un producto por ID
PUT	/productos/:id	Actualizar producto
DELETE	/productos/:id	Eliminar producto
POST	/upload	Subir imagen a Cloudinary
🖼️ Funcionalidades Clave
Backend
✅ CRUD completo de productos

🔄 Actualización automática de timestamps

📤 Upload de imágenes a Cloudinary

🔐 Validación de campos requeridos

🛡️ Configuración CORS para seguridad
