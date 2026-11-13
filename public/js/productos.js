const API_URL = '/api';

let carrito = [];
let usuarioActual = null;
let subtotalGlobal = 0;

if (typeof window !== 'undefined') {
  carrito = JSON.parse(localStorage.getItem('wtf_pets_carrito')) || [];
  usuarioActual = JSON.parse(localStorage.getItem('wtf_pets_user')) || null;

  // Asignar funciones globales al objeto window solo en el navegador
  window.agregarAlCarrito = function(id) {
    carrito.push(id);
    localStorage.setItem('wtf_pets_carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
  };

  window.eliminarDelCarrito = function(id) {
    carrito = carrito.filter(item => item !== id);
    localStorage.setItem('wtf_pets_carrito', JSON.stringify(carrito));
    renderizarPaginaCarrito();
    actualizarCarritoUI();
  };

  window.procesarCompra = function() {
    if (!usuarioActual) {
      const authModal = document.getElementById('auth-modal');
      if (authModal) authModal.classList.remove('hidden');
      return;
    }
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) checkoutModal.classList.remove('hidden');
  };
}

function inicializarApp() {
  actualizarCarritoUI();
  actualizarUIAuth();

  configurarEventosAuth();
  configurarEventosPago();

  if (document.getElementById('products-grid')) {
    cargarProductos();
    configurarEventosCatalogo();
  }

  if (document.getElementById('cart-content')) {
    renderizarPaginaCarrito();
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#cart-btn')) {
      window.location.href = '/carrito';
    }
  });
}

// Ejecutar solo en el navegador y asegurar que el DOM esté listo
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
  } else {
    inicializarApp();
  }
}

function configurarEventosAuth() {
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (!usuarioActual) {
        document.getElementById('auth-modal').classList.remove('hidden');
      } else {
        localStorage.removeItem('wtf_pets_user');
        usuarioActual = null;
        actualizarUIAuth();
      }
    });
  }

  const closeModal = document.getElementById('close-modal-btn');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      document.getElementById('auth-modal').classList.add('hidden');
    });
  }

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', (e) => {
      e.target.classList.replace('tab-inactive', 'tab-active');
      tabRegister.classList.replace('tab-active', 'tab-inactive');
      document.getElementById('form-login').classList.remove('hidden');
      document.getElementById('form-register').classList.add('hidden');
    });

    tabRegister.addEventListener('click', (e) => {
      e.target.classList.replace('tab-inactive', 'tab-active');
      tabLogin.classList.replace('tab-active', 'tab-inactive');
      document.getElementById('form-register').classList.remove('hidden');
      document.getElementById('form-login').classList.add('hidden');
    });
  }

  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, pass })
        });
        const data = await res.json();
        if (res.ok) {
          usuarioActual = data.usuario;
          localStorage.setItem('wtf_pets_user', JSON.stringify(usuarioActual));
          document.getElementById('auth-modal').classList.add('hidden');
          actualizarUIAuth();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error en login:', error);
      }
    });
  }

  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const petName = document.getElementById('reg-pet').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;

      try {
        const res = await fetch(`${API_URL}/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, petName, email, pass })
        });
        const data = await res.json();
        if (res.ok) {
          usuarioActual = data.usuario;
          localStorage.setItem('wtf_pets_user', JSON.stringify(usuarioActual));
          document.getElementById('auth-modal').classList.add('hidden');
          actualizarUIAuth();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error en registro:', error);
      }
    });
  }

  const togglePassBtns = document.querySelectorAll('.btn-show-pass');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Ocultar';
      } else {
        input.type = 'password';
        btn.textContent = 'Ver';
      }
    });
  });
}

function configurarEventosPago() {
  const closeCheckout = document.getElementById('close-checkout-btn');
  if (closeCheckout) {
    closeCheckout.addEventListener('click', () => {
      document.getElementById('checkout-modal').classList.add('hidden');
    });
  }

  const methodSelect = document.getElementById('chk-metodo');
  if (methodSelect) {
    methodSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const tarjeta = document.getElementById('payment-tarjeta');
      const yape = document.getElementById('payment-yape');
      const inputsTarjeta = tarjeta.querySelectorAll('input');

      if (val === 'Tarjeta') {
        tarjeta.classList.remove('hidden');
        yape.classList.add('hidden');
        inputsTarjeta.forEach(i => i.required = true);
      } else if (val === 'Yape') {
        tarjeta.classList.add('hidden');
        yape.classList.remove('hidden');
        inputsTarjeta.forEach(i => i.required = false);
      } else {
        tarjeta.classList.add('hidden');
        yape.classList.add('hidden');
        inputsTarjeta.forEach(i => i.required = false);
      }
    });
  }

  const formCheckout = document.getElementById('form-checkout');
  if (formCheckout) {
    formCheckout.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!usuarioActual) return;

      const direccion = document.getElementById('chk-direccion').value;
      const distrito = document.getElementById('chk-distrito').value;
      const metodoPago = document.getElementById('chk-metodo').value;

      try {
        const res = await fetch(`${API_URL}/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: usuarioActual.email,
            productosIds: carrito,
            direccion,
            distrito,
            metodoPago,
            total: subtotalGlobal
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Pago procesado con éxito. Número de Pedido: ' + data.pedido.id);
          carrito = [];
          localStorage.removeItem('wtf_pets_carrito');
          window.location.href = '/';
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error al procesar pago:', error);
      }
    });
  }
}

function configurarEventosCatalogo() {
  const botonesFiltro = document.querySelectorAll('.filter-btn');
  botonesFiltro.forEach(btn => {
    btn.addEventListener('click', (e) => {
      botonesFiltro.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const especie = e.target.dataset.filter;
      cargarProductos(especie !== 'todos' ? especie : null);
    });
  });
}

async function cargarProductos(especie = null) {
  try {
    const url = especie ? `${API_URL}/productos/buscar?especie=${especie}` : `${API_URL}/productos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se encontraron productos');
    const productos = await res.json();
    renderizarProductos(productos);
  } catch (error) {
    const grid = document.getElementById('products-grid');
    if (grid) grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">${error.message}</p>`;
  }
}

function renderizarProductos(productos) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = '';

  productos.forEach(p => {
    const article = document.createElement('article');
    article.style.background = 'white';
    article.style.borderRadius = '24px';
    article.style.overflow = 'hidden';
    article.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';

    article.innerHTML = `
      <div style="position: relative; height: 260px; overflow: hidden; background: #f4f4f5;">
        <img src="${p.imagenPrincipal}" style="width: 100%; height: 100%; object-fit: cover;">
        <img src="${p.clienteFoto1}" class="foto-hover" style="position: absolute; top: 16px; right: 16px; width: 56px; height: 56px; border-radius: 50%; border: 3px solid white; object-fit: cover; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <img src="${p.clienteFoto2}" class="foto-hover" style="position: absolute; top: 80px; right: 16px; width: 56px; height: 56px; border-radius: 50%; border: 3px solid white; object-fit: cover; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation-delay: 0.2s;">
      </div>
      <div style="padding: 24px;">
        <span style="background: #f4f4f5; color: #52525b; font-size: 0.75rem; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">${p.categoria}</span>
        <h3 style="font-weight: 900; font-size: 1.25rem; margin-top: 12px; color: #18181b;">${p.nombre}</h3>
        <p style="color: #71717a; font-size: 0.875rem; margin-top: 6px; min-height: 42px; line-height: 1.5;">${p.descripcion}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
          <span style="font-weight: 900; font-size: 1.5rem; color: #18181b;">S/ ${p.precio.toFixed(2)}</span>
          <button onclick="agregarAlCarrito(${p.id})" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 9999px; cursor: pointer; font-weight: 700; font-size: 0.875rem;">+ Agregar</button>
        </div>
      </div>
    `;
    grid.appendChild(article);
  });
}

function actualizarCarritoUI() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = carrito.length;
}

function actualizarUIAuth() {
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    if (usuarioActual) {
      authBtn.textContent = 'Salir (' + usuarioActual.name + ')';
    } else {
      authBtn.textContent = 'Ingresar';
    }
  }
}

async function renderizarPaginaCarrito() {
  const container = document.getElementById('cart-content');
  if (!container) return;

  if (carrito.length === 0) {
    container.innerHTML = `<div class="empty-cart" style="grid-column: 1/-1;"><p>Tu carrito está vacío.</p><a href="/" style="color: #4f46e5; font-weight: 700; margin-top: 12px; display: inline-block;">Volver al catálogo</a></div>`;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const itemsMap = {};
    carrito.forEach(id => itemsMap[id] = (itemsMap[id] || 0) + 1);

    let htmlItems = '<div class="cart-items">';
    let subtotal = 0;

    for (const [idStr, cantidad] of Object.entries(itemsMap)) {
      const producto = productos.find(p => p.id == idStr);
      if (producto) {
        subtotal += producto.precio * cantidad;
        htmlItems += `
          <div class="cart-item-card">
            <img src="${producto.imagenPrincipal}" alt="${producto.nombre}">
            <div class="cart-item-info">
              <div class="cart-item-title">${producto.nombre}</div>
              <div class="cart-item-price">S/ ${producto.precio.toFixed(2)} x ${cantidad}</div>
            </div>
            <button class="btn-remove" onclick="eliminarDelCarrito(${producto.id})">Eliminar</button>
          </div>
        `;
      }
    }
    htmlItems += '</div>';

    subtotalGlobal = subtotal;

    let htmlSummary = `
      <div class="cart-summary">
        <div class="summary-title">Resumen de Compra</div>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>S/ ${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Envío</span>
          <span>Gratis</span>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <span>S/ ${subtotal.toFixed(2)}</span>
        </div>
        <button class="btn-checkout" onclick="procesarCompra()">Proceder al Pago</button>
      </div>
    `;

    container.innerHTML = htmlItems + htmlSummary;
  } catch (error) {
    container.innerHTML = '<p>Error al cargar los productos del carrito.</p>';
  }
}