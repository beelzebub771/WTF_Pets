PRAGMA foreign_keys = ON;

-- 1. Tablas independientes (sin llaves foráneas)
CREATE TABLE CATEGORIA (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_categoria TEXT NOT NULL,
    descripcion TEXT NULL
);

CREATE TABLE COLECCION (
    id_coleccion INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_coleccion TEXT NOT NULL,
    descripcion TEXT NULL,
    fecha_inicio TEXT NULL,
    fecha_fin TEXT NULL,
    estado TEXT NULL
);

CREATE TABLE ESPECIE (
    id_especie INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_especie TEXT NOT NULL
);

CREATE TABLE ROL (
    id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_rol TEXT NOT NULL
);

-- 2. Tablas con dependencias de primer nivel
CREATE TABLE USUARIO (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    contrasena TEXT NOT NULL,
    telefono TEXT NULL,
    fecha_registro TEXT NULL DEFAULT CURRENT_TIMESTAMP,
    id_rol INTEGER NOT NULL,
    CONSTRAINT FK_USUARIO_ROL FOREIGN KEY (id_rol) REFERENCES ROL (id_rol)
);

CREATE TABLE PRODUCTO (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_producto TEXT NOT NULL,
    descripcion TEXT NULL,
    precio_base REAL NOT NULL,
    imagen_url TEXT NULL,
    id_categoria INTEGER NOT NULL,
    id_coleccion INTEGER NULL,
    id_especie INTEGER NULL,
    CONSTRAINT FK_PRODUCTO_CATEGORIA FOREIGN KEY (id_categoria) REFERENCES CATEGORIA (id_categoria),
    CONSTRAINT FK_PRODUCTO_COLECCION FOREIGN KEY (id_coleccion) REFERENCES COLECCION (id_coleccion),
    CONSTRAINT FK_PRODUCTO_ESPECIE FOREIGN KEY (id_especie) REFERENCES ESPECIE (id_especie)
);

-- 3. Tablas con dependencias de segundo nivel
CREATE TABLE CARRITO (
    id_carrito INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    fecha_creacion TEXT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_CARRITO_USUARIO FOREIGN KEY (id_usuario) REFERENCES USUARIO (id_usuario)
);

CREATE TABLE DIRECCION (
    id_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    direccion_linea1 TEXT NOT NULL,
    distrito TEXT NULL,
    ciudad TEXT NULL,
    referencia TEXT NULL,
    CONSTRAINT FK_DIRECCION_USUARIO FOREIGN KEY (id_usuario) REFERENCES USUARIO (id_usuario)
);

CREATE TABLE PRODUCTO_IMAGEN (
    id_imagen INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto INTEGER NOT NULL,
    url_imagen TEXT NOT NULL,
    es_principal INTEGER NULL DEFAULT 0,
    CONSTRAINT FK_IMAGEN_PRODUCTO FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)
);

CREATE TABLE VARIANTE_PRODUCTO (
    id_variante INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto INTEGER NOT NULL,
    talla_o_tamano TEXT NULL,
    color_o_estilo TEXT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT NULL UNIQUE,
    CONSTRAINT FK_VARIANTE_PRODUCTO FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)
);

-- 4. Tablas con dependencias de tercer y cuarto nivel
CREATE TABLE CARRITO_DETALLE (
    id_carrito_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrito INTEGER NOT NULL,
    id_variante INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    CONSTRAINT FK_CARRITO_DETALLE_CARRITO FOREIGN KEY (id_carrito) REFERENCES CARRITO (id_carrito),
    CONSTRAINT FK_CARRITO_DETALLE_VARIANTE FOREIGN KEY (id_variante) REFERENCES VARIANTE_PRODUCTO (id_variante)
);

CREATE TABLE PEDIDO (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_direccion INTEGER NOT NULL,
    fecha_pedido TEXT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_total REAL NOT NULL,
    estado_pedido TEXT NULL,
    CONSTRAINT FK_PEDIDO_DIRECCION FOREIGN KEY (id_direccion) REFERENCES DIRECCION (id_direccion),
    CONSTRAINT FK_PEDIDO_USUARIO FOREIGN KEY (id_usuario) REFERENCES USUARIO (id_usuario)
);

CREATE TABLE PEDIDO_DETALLE (
    id_pedido_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER NOT NULL,
    id_variante INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    CONSTRAINT FK_PEDIDO_DETALLE_PEDIDO FOREIGN KEY (id_pedido) REFERENCES PEDIDO (id_pedido),
    CONSTRAINT FK_PEDIDO_DETALLE_VARIANTE FOREIGN KEY (id_variante) REFERENCES VARIANTE_PRODUCTO (id_variante)
);

CREATE TABLE PAGO (
    id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER NOT NULL,
    metodo_pago TEXT NOT NULL,
    monto REAL NOT NULL,
    fecha_pago TEXT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_pago TEXT NULL,
    CONSTRAINT FK_PAGO_PEDIDO FOREIGN KEY (id_pedido) REFERENCES PEDIDO (id_pedido)
);