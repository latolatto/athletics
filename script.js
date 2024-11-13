document.getElementById("year").innerHTML = new Date().getFullYear();

const backToTopBtn = document.getElementById("backToTopBtn");


// window.onload = function() {
//   window.scrollTo(0, 0);
// };


window.onscroll = function() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    backToTopBtn.style.display = "flex"; /* Shows the button */
  } else {
    backToTopBtn.style.display = "none";
  }
};

backToTopBtn.addEventListener("click", function() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
const products = [
  { 
    id: 0, 
    title: 'Leather Clean Solution', 
    price: 5, 
    image: './images/leatherclean/leatherclean1-removebg-preview.png', 
    description: 'Cleans and restores leather shoes.'
     },
  {
    id: 1, 
    title: 'All-in-One Basic Pack', 
    price: 5, 
    image: './images/basicpack/basicpack1-removebg-preview.png', 
    description: 'Includes all essentials for shoe care.'
 },
  { 
    id: 2, 
    title: 'Waterproof Solution', 
    price: 5, 
    image: './images/waterstop/waterstop1-removebg-preview.png', 
    description: 'Keeps shoes dry and protected.' 
 },
     {
        id: 3,
        image: './images/deosanitizier/deosanitizier1-removebg-preview.png',
        title: 'Deo Sanitizier',
        price: '5',
        description:'Athletics Deo , our top-performance shoe deodorant, designed for active lifestyles. This powerful formula tackles tough odors and keeps your shoes smelling fresh, no matter how intense your workouts are. ',
    },

    {
        id: 4,
        image: './images/deostick/deostick1-removebg-preview.png',
        title: 'Deo Stick',
        price: '5',
        description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    }
];

// Initialize or retrieve cart from local storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to local storage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to display products
const displayItem = (items) => {
  const root = document.getElementById('root');
  root.innerHTML = ''; // Clear existing content
  items.forEach((item) => {
      const card = document.createElement('div');
      card.classList.add('col-6-sm', 'ballina-col');
      card.innerHTML = `
          <a class="catg-item card-text pop" href="#" type="" data-bs-toggle="modal" data-bs-target="#myModal" data-item-id="${item.id}">
              <img class="album-img" src="${item.image}" alt="pieces">
              <div class="img-ttl card-body" style="text-decoration: none; color: black;">
                  ${item.title}
              </div>
              <div class="itm-price"> 
           $ ${item.price}
              </div>
          </a>
      `;
      root.appendChild(card);

      // Add click listener to open modal with item details
      card.querySelector('.catg-item').addEventListener('click', () => openModal(item));
  });
};

function openModal(item) {
  document.getElementById('itemName').textContent = item.title;
  document.querySelector('.imagepreview').src = item.image;
  document.getElementById('prod-description').textContent = item.description;
  
  const quantityInput = document.getElementById('quantityInput');  // Select the quantity input

  // Add item to cart with specified quantity from modal
  document.querySelector('.add-to-cart-btn').onclick = () => {
      const quantity = parseInt(quantityInput.value) || 1; // Use quantity value from input
      addToCart(item.id, quantity);
      
      // Display confirmation message and reset quantity input to 1
      document.getElementById('added-to-cart').textContent = 'Added to Cart!';
      quantityInput.value = 1;  // Reset quantity after adding to cart

      // Clear confirmation message after 1.5 seconds
      setTimeout(() => document.getElementById('added-to-cart').textContent = '', 1500);
  };
}


function addToCart(productId, quantity = 1) {
  const product = products.find(item => item.id === productId);
  console.log('Adding to cart:', product);  // Check the product object
  if (product) {
      const existingProduct = cart.find(item => item.id === productId);
      if (existingProduct) {
          existingProduct.quantity += quantity;
      } else {
          cart.push({
              ...product,
              quantity: quantity,
              totalPrice: product.price
          });
      }
  }
  saveCart();
  updateCartDisplay();
}


// Function to update cart display in offcanvas
function updateCartDisplay() {
  const cartIconBadge = document.getElementById('cartItemCount');
  const cartTotal = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartIconBadge.textContent = cartCount;

  const cartItemsContainer = document.querySelector('.offcanvas-body');
  cartItemsContainer.innerHTML = '';
  
  // const cartTotalContainer = document.getElementById('cart-total-container');
  const cartButtonsContainer = document.getElementById('cart-buttons-container');


  if (cart.length === 0) {
    // Display "Cart is empty" message
    cartItemsContainer.innerHTML = '<p>Your cart is empty!</p>';
  
  
    // cartTotalContainer.style.display = 'none';
    if (cartButtonsContainer) {
      cartButtonsContainer.style.opacity = '0';
      document.querySelector('.empty-crt').style.display='none';
      document.querySelector('.total-sum').style.display='none';
    }
  } else{
      cartButtonsContainer.style.opacity = '1';
  
  
  }

  cart.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.innerHTML = `
          <div class="cart-item">
              <img src="${item.image}" alt="${item.title}" class="cart-item-img">
              <div class="cart-item-info">
                  <h5>${item.title}</h5>
                  <p>Quantity: ${item.quantity}</p>
                  <p>Price per item: $${item.price}</p>
                  <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
                  <button class="remove-item-btn" data-product-id="${item.id}">Remove</button>
              </div>
          </div>
      `;
      cartItemsContainer.appendChild(itemElement);

      // Add event listener for removing items from cart
      itemElement.querySelector('.remove-item-btn').addEventListener('click', () => removeFromCart(item.id));


  });


  const totalElement = document.createElement('div');
  totalElement.classList.add('total-sum');
  totalElement.innerHTML = `<hr><p>Grand Total: $${cartTotal.toFixed(2)}</p>`;
  cartItemsContainer.appendChild(totalElement);

  const emptyCartButton = document.createElement('button');
  emptyCartButton.classList.add('empty-crt');
  emptyCartButton.textContent = 'Empty Cart';
  emptyCartButton.addEventListener('click', emptyCart);
  cartItemsContainer.appendChild(emptyCartButton);

  // const emptyCartButton = document.createElement('button');
  // emptyCartButton.textContent = 'Empty Cart';
  // emptyCartButton.addEventListener('click', emptyCart);
  // cartItemsContainer.appendChild(emptyCartButton);
}



// Function to remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartDisplay();
}

// Function to empty the cart
function emptyCart() {
  cart = [];
  saveCart();
  updateCartDisplay();
}

// Initial display of all products
displayItem(products);
updateCartDisplay();




// Function to update the cart on the cart page
function updateCartPage() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalContainer = document.getElementById('cart-total');

  if (!cartItemsContainer || !cartTotalContainer) return; // Exit if on a different page

  cartItemsContainer.innerHTML = ''; // Clear any existing content

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty!</p>';
    cartTotalContainer.style.display ='none';
    document.getElementsByClassName('checkout-btn')[0].innerHTML='';
  } else {
    let grandTotal = 0;

    cart.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('cart-item');
      itemElement.innerHTML = `
        <div class="cart-item-details">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img">
          <div class="cart-item-info">
            <h5>${item.title}</h5>
            <p>Price: $${item.price}</p>
            <div class="quantity-container">
              <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
              <button class="quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
            </div>
            <button class="remove-item-btn" data-product-id="${item.id}">Remove</button>
            <p class="subtotal">Total: $${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemElement);

      grandTotal += item.price * item.quantity;

      // Add event listeners for buttons
      itemElement.querySelector('.remove-item-btn').addEventListener('click', () => removeFromCart(item.id));
      itemElement.querySelector('.quantity-btn[data-action="increase"]').addEventListener('click', () => updateQuantity(item.id, 1));
      itemElement.querySelector('.quantity-btn[data-action="decrease"]').addEventListener('click', () => updateQuantity(item.id, -1));

      // Event listener for manual quantity input change
      const quantityInput = itemElement.querySelector('.quantity-input');
      quantityInput.addEventListener('input', () => {
        let newQuantity = parseInt(quantityInput.value);
        
        // Default to 1 if input is invalid or empty
        if (!newQuantity || newQuantity < 1) { 
          newQuantity = 1;
        }
        
        // Update item quantity and save to local storage
        item.quantity = newQuantity;
        saveCart();  // Save the updated cart to local storage
        updateCartTotals();  // Update totals based on new quantity
      });
      
    });

    cartTotalContainer.innerHTML = `<hr><p>Grand Total: $${grandTotal.toFixed(2)}</p>`;
  }
}

// Function to update the grand total after any quantity change
function updateCartTotals() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalContainer = document.getElementById('cart-total');

  let grandTotal = 0;
  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    grandTotal += itemSubtotal;

    // Update the displayed subtotal for each item
    const itemElement = cartItemsContainer.querySelector(`[data-product-id="${item.id}"]`).closest('.cart-item');
    itemElement.querySelector('.subtotal').textContent = `Total: $${itemSubtotal.toFixed(2)}`;
  });

  // Update the grand total display
  cartTotalContainer.innerHTML = `<hr><p>Grand Total: $${grandTotal.toFixed(2)}</p>`;
}


// Quantity update function
function updateQuantity(productId, change) {
  const product = cart.find(item => item.id === productId);
  if (product) {
    product.quantity = Math.max(1, product.quantity + change); // Prevent quantity below 1
    saveCart();
    updateCartPage();
  }
}

// Remove from cart function
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartPage();
}

// Initial load for cart and offcanvas display
updateCartDisplay();
if (document.getElementById('cart-items-container')) {
  updateCartPage();
}