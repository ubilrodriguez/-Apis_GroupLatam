require('dotenv').config(); // Cargar variables de entorno
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conexión exitosa a MySQL!');
        
        const [rows] = await connection.query('SELECT 1 + 1 AS result');
        console.log('✅ Consulta de prueba exitosa:', rows[0].result);

        await connection.end();
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
}

testConnection();