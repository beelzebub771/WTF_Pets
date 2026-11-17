# 🐾 WTF PETS?

### Tienda virtual de accesorios para mascotas

WTF PETS? es una aplicación web de comercio electrónico enfocada en accesorios y productos para mascotas, con un catálogo organizado por especies: perros, gatos y aves.

El proyecto fue desarrollado utilizando **Astro para el frontend, Express para el backend y Turso como base de datos**, con despliegue en Netlify.

## Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| Astro | Desarrollo del frontend |
| HTML, CSS y JavaScript | Interfaz e interactividad |
| Node.js | Entorno de ejecución |
| Express | API del backend |
| Turso / libSQL | Base de datos |
| Netlify | Alojamiento y funciones del backend |
| Git y GitHub | Control de versiones |

## Requisitos previos

Antes de comenzar, instala:

- Node.js y npm, en una versión compatible con el proyecto.
- Git.
- Visual Studio Code u otro editor de código.
- Una cuenta de Turso o acceso autorizado a la base de datos del proyecto.

## Instalación

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

Accede a la carpeta del proyecto:

```bash
cd wtf-frontend
```

### 2. Instalar dependencias

Instala las dependencias del frontend:

```bash
npm install
```

El backend utiliza su propio `package.json`, instala también sus dependencias:

```bash
cd backend
npm install
cd ..
```

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto, si la configuración existente utiliza esa ubicación.

Incluye las siguientes variables:

```env
TURSO_DATABASE_URL=URL_DE_TU_BASE_DE_DATOS
TURSO_AUTH_TOKEN=TOKEN_DE_ACCESO
```

**Importante:** Solicita las credenciales de desarrollo al responsable del proyecto. Nunca publiques tokens reales ni compartas el archivo `.env` en GitHub.

### 4. Ejecutar el proyecto

Para iniciar el frontend en modo de desarrollo:

```bash
npm run dev
```

Astro normalmente utiliza:

```text
http://localhost:4321
```

**Para probar las funciones del backend integradas con Netlify**, utiliza:

```bash
npx netlify dev
```

Abre la dirección local que muestre Netlify en la terminal.

Se recomienda utilizar `netlify dev` al probar funcionalidades que requieren acceder a Turso, como productos, inicio de sesión y pedidos.

## Estructura del proyecto

```text
wtf-frontend/
├── backend/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed.sql
├── netlify/
├── public/
│   └── js/
│       └── productos.js
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   └── carrito.astro
│   └── styles/
├── .env
├── astro.config.mjs
├── netlify.toml
└── package.json
```

## Despliegue

El proyecto utiliza GitHub para el control de versiones y Netlify para su publicación.

Para enviar cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Si el despliegue automático está habilitado, Netlify construirá y publicará la nueva versión desde la rama configurada.

## Colaboración

Antes de realizar cambios:

1. Actualiza tu copia local con `git pull`.
2. Trabaja preferentemente en una rama independiente.
3. Prueba los cambios antes de enviarlos.
4. No publiques credenciales ni archivos `.env`.
5. Documenta las nuevas funcionalidades.

## Estado del proyecto

Proyecto funcional, con catálogo, filtros por especie, carrito, autenticación básica y conexión con Turso. Las funcionalidades de pedidos, pagos y seguridad requieren validación adicional antes de utilizarse en un entorno comercial real.

---

**WTF PETS? — 2026**

*0% Vergüenza • 100% Estilo para tus mascotas.*
