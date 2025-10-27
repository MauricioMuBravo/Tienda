let cart = [];
const cartCount = document.getElementById('cart-count');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const buyAllBtn = document.getElementById('buy-all');

const modal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalAddBtn = document.getElementById('modal-add-to-cart');
const modalClose = document.querySelector('.modal .close');
let currentProduct = null;

// Agregar productos al carrito desde tarjeta
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(btn.parentElement);
  });
});

// Modal al hacer clic en el producto
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

modalClose.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target == modal) modal.style.display = 'none'; }

modalAddBtn.onclick = () => {
  addToCart(currentProduct);
  modal.style.display = 'none';
};

// Agregar al carrito
function addToCart(product) {
  cart.push({ name: product.dataset.name, price: parseInt(product.dataset.price) });
  updateCart();
}

// Actualizar carrito
function updateCart() {
  cartCount.textContent = cart.length;
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    const li = document.createElement('li');
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

// BOTÓN “COMPRAR TODO” FUNCIONAL
buyAllBtn.addEventListener('click', () => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  if (total === 0) return;

  // Crear contenedor temporal para PayPal
  const container = document.createElement('div');
  container.id = 'temp-paypal';
  document.body.appendChild(container);

  paypal.Buttons({
    style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{
        amount: { value: total },
        description: 'Compra de ' + cart.map(p => p.name).join(', ')
      }]
    }),
    onApprove: (data, actions) => actions.order.capture().then(details => {
      alert('Pago completado por ' + details.payer.name.given_name);
      cart = [];
      updateCart();
      container.remove();
    }),
    onError: err => {
      console.error(err);
      alert('Error en el pago. Asegúrate de usar sandbox o un Client ID válido.');
      container.remove();
    }
  }).render('#temp-paypal');
});

// Filtro de categorías
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const category = btn.dataset.category;
    const products = document.querySelectorAll('.product');
    products.forEach((product, index) => {
      if(category === 'all' || product.dataset.category === category) {
        product.classList.remove('hidden');
        setTimeout(() => product.classList.add('show'), index * 50);
      } else {
        product.classList.remove('show');
        product.classList.add('hidden');
      }
    });
  });
});
