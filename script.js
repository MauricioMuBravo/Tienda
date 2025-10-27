let cart = [];
const cartCount = document.getElementById('cart-count');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const buyAllBtn = document.getElementById('buy-all');

// Modal
const modal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalAddBtn = document.getElementById('modal-add-to-cart');
const modalClose = document.querySelector('.modal .close');
let currentProduct = null;

// Agregar al carrito desde botón del producto
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', e => {
    e.stopPropagation();
    const product = button.parentElement;
    addToCart(product);
  });
});

// Abrir modal al hacer clic en el producto
document.querySelectorAll('.product').forEach(product => {
  product.addEventListener('click', () => {
    currentProduct = product;
    modalImg.src = product.querySelector('img').src;
    modalName.textContent = product.dataset.name;
    modalPrice.textContent = "$" + product.dataset.price;
    modalDescription.textContent = product.dataset.description || "Sin descripción";
    modal.style.display = 'block';
  });
});

// Cerrar modal
modalClose.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target == modal) modal.style.display = 'none'; }

// Agregar al carrito desde modal
modalAddBtn.onclick = () => {
  addToCart(currentProduct);
  modal.style.display = 'none';
};

// Función para agregar al carrito
function addToCart(product) {
  const name = product.dataset.name;
  const price = parseInt(product.dataset.price);
  cart.push({ name, price });
  updateCart();
}

// Función para actualizar carrito
function updateCart() {
  cartCount.textContent = cart.length;
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `${item.name} - $${item.price} <button onclick="removeItem(${index})">Eliminar</button>`;
    cartList.appendChild(li);
    total += item.price;
  });
  cartTotal.textContent = total;
  buyAllBtn.disabled = cart.length === 0;
}

// Eliminar item del carrito
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Botón "Comprar todo" funcional
buyAllBtn.addEventListener('click', () => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  if(total === 0) return;

  // Crear contenedor temporal para PayPal
  const container = document.createElement('div');
  container.id = 'temp-paypal';
  document.body.appendChild(container);

  paypal.Buttons({
    style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: { value: total },
          description: 'Compra completa tienda online'
        }]
      });
    },
    onApprove: (data, actions) => actions.order.capture().then(details => {
      alert('Pago completado por ' + details.payer.name.given_name);
      cart = [];
      updateCart();
      container.remove(); // eliminar contenedor temporal
    }),
    onError: err => { console.error(err); alert('Error en el pago.'); container.remove(); }
  }).render('#temp-paypal');
});

// Filtrado de categorías con animación escalonada
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category;
    const products = document.querySelectorAll('.product');

    products.forEach((product, index) => {
      if(category === 'all' || product.dataset.category === category) {
        product.classList.remove('hidden');
        setTimeout(() => {
          product.classList.add('show');
        }, index * 50);
      } else {
        product.classList.remove('show');
        product.classList.add('hidden');
      }
    });
  });
});