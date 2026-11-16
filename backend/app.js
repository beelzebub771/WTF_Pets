require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');

const app = express();

app.use(cors());
app.use(express.json());

// Inicializamos el cliente una sola vez (reutilizable en todas las rutas)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT
        p.id_producto AS id,
        p.nombre_producto AS nombre,
        LOWER(TRIM(e.nombre_especie)) AS especie,
        c.nombre_categoria AS categoria,
        p.precio_base AS precio,
        p.descripcion AS descripcion,
        p.imagen_url AS imagenPrincipal,
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80' AS clienteFoto1,
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=200&q=80' AS clienteFoto2
      FROM PRODUCTO p
      INNER JOIN CATEGORIA c
        ON p.id_categoria = c.id_categoria
      LEFT JOIN ESPECIE e
        ON p.id_especie = e.id_especie
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Error en GET /api/productos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Buscar productos según la especie
app.get('/api/productos/buscar', async (req, res) => {
  try {
    const especie = String(req.query.especie || '')
      .trim()
      .toLowerCase();

    if (!['perro', 'gato', 'ave'].includes(especie)) {
      return res.status(400).json({
        error: 'Especie no válida'
      });
    }

    const result = await db.execute({
      sql: `
        SELECT
          p.id_producto AS id,
          p.nombre_producto AS nombre,
          LOWER(TRIM(e.nombre_especie)) AS especie,
          c.nombre_categoria AS categoria,
          p.precio_base AS precio,
          p.descripcion AS descripcion,
          p.imagen_url AS imagenPrincipal,
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80' AS clienteFoto1,
          'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=200&q=80' AS clienteFoto2
        FROM PRODUCTO p
        INNER JOIN CATEGORIA c
          ON p.id_categoria = c.id_categoria
        INNER JOIN ESPECIE e
          ON p.id_especie = e.id_especie
        WHERE LOWER(TRIM(e.nombre_especie)) = ?
      `,
      args: [especie]
    });

    res.json(result.rows);

  } catch (error) {
    console.error("Error al buscar productos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Registro de usuario
app.post('/api/registro', async (req, res) => {
  const { name, petName, email, pass } = req.body;
  if (!name || !petName || !email || !pass) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const check = await db.execute({
      sql: 'SELECT id_usuario FROM USUARIO WHERE email = ?',
      args: [email]
    });

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }

    await db.execute({
      sql: 'INSERT INTO USUARIO (nombre, apellido, email, contrasena, id_rol) VALUES (?, ?, ?, ?, 1)',
      args: [name, petName, email, pass]
    });

    res.status(201).json({ mensaje: 'Exito', usuario: { name, petName, email } });
  } catch (error) {
    console.error("ERROR EN REGISTRO:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  const { email, pass } = req.body;

  try {
    const result = await db.execute({
      sql: 'SELECT nombre, apellido AS petName, email FROM USUARIO WHERE email = ? AND contrasena = ?',
      args: [email, pass]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    res.json({ mensaje: 'Exito', usuario: { name: usuario.nombre, petName: usuario.petName, email: usuario.email } });
  } catch (error) {
    console.error("ERROR EN LOGIN:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Guardar pedidos, direcciones y pagos
app.post('/api/pedidos', async (req, res) => {
  const { email, productosIds, direccion, distrito, metodoPago, total } = req.body;
  if (!email || !productosIds || productosIds.length === 0) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    const userCheck = await db.execute({
      sql: 'SELECT id_usuario FROM USUARIO WHERE email = ?',
      args: [email]
    });

    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const idUsuario = userCheck.rows[0].id_usuario;

    // En SQLite/libSQL se usa RETURNING en lugar de OUTPUT INSERTED
    const dirResult = await db.execute({
      sql: 'INSERT INTO DIRECCION (id_usuario, direccion_linea1, distrito) VALUES (?, ?, ?) RETURNING id_direccion',
      args: [idUsuario, direccion, distrito]
    });
    const idDireccion = dirResult.rows[0].id_direccion;

    const pedResult = await db.execute({
      sql: 'INSERT INTO PEDIDO (id_usuario, id_direccion, monto_total, estado_pedido) VALUES (?, ?, ?, ?) RETURNING id_pedido',
      args: [idUsuario, idDireccion, total, 'Procesado']
    });
    const idPedido = pedResult.rows[0].id_pedido;

    await db.execute({
      sql: 'INSERT INTO PAGO (id_pedido, metodo_pago, monto, estado_pago) VALUES (?, ?, ?, ?)',
      args: [idPedido, metodoPago, total, 'Completado']
    });

    res.status(201).json({ mensaje: 'Exito', pedido: { id: idPedido, total } });
  } catch (error) {
    console.error("ERROR EN PEDIDO:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;