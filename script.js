document.getElementById("year").innerHTML = new Date().getFullYear();



// JavaScript for Back-to-Top Button
document.addEventListener('DOMContentLoaded', () => {
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Show/Hide button based on scroll position
  function toggleBackToTopBtn() {
      if (window.scrollY > 200) { // Adjust the scroll threshold as needed
          backToTopBtn.style.display = 'flex'; // Show the button
      } else {
          backToTopBtn.style.display = 'none'; // Hide the button
      }
  }

  // Scroll to top functionality
  function scrollToTop() {
      window.scrollTo({
          top: 0,
          behavior: 'smooth', // Smooth scrolling
      });
  }

  // Attach event listeners
  window.addEventListener('scroll', toggleBackToTopBtn);
  backToTopBtn.addEventListener('click', scrollToTop);
});

// window.onload = function() {
//   window.scrollTo(0, 0);
// };






function setupNavbarScrollEffect() {
  const navbar = document.querySelector('.grid1');
  const menuItems = document.querySelectorAll('.menu-item');
  const whitesvg = document.querySelector('.bi-cart3');

  function handleScroll() {
    if (window.scrollY > 0) {
      // Apply styles when the user has scrolled down
      navbar.classList.add('fixed');
      menuItems.forEach((item) => item.classList.add('white'));
      navbar.classList.remove('grid-pos');
      whitesvg.classList.add('whitesvg');
    } else {
      // Remove styles when the user is at the top
      navbar.classList.remove('fixed');
      menuItems.forEach((item) => item.classList.remove('white'));
      navbar.classList.add('grid-pos');
      whitesvg.classList.remove('whitesvg');
    }
  }

  // Run this when the DOM content is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    handleScroll(); // Apply the effect immediately based on the current scroll position
  });

  // Also handle the scroll event
  window.addEventListener('scroll', handleScroll);
}

// Call the function to initialize the effect
setupNavbarScrollEffect();





// Initialize or retrieve cart from local storage
window.cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to local storage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// // Function to display products
// window.displayItem = (items) => {
//   const root = document.getElementById('root');
//   root.innerHTML = ''; // Clear existing content
//   items.forEach((item) => {
//       const card = document.createElement('div');
//       card.classList.add('col-6-sm', 'ballina-col');
//       card.innerHTML = `
//           <a class="catg-item card-text pop" href="#" type="" data-bs-toggle="modal" data-bs-target="#myModal" data-item-id="${item.id}">
//               <img class="album-img" src="${item.image}" alt="pieces">
//               <div class="img-ttl card-body" style="text-decoration: none; color: black;">
//                   ${item.title}
//               </div>
//               <div class="itm-price"> 
//            $ ${item.price}
//               </div>
//           </a>
//       `;
//       root.appendChild(card);

//       // Add click listener to open modal with item details
//       card.querySelector('.catg-item').addEventListener('click', () => openModal(item));
//   });
// };

// function openModal(item) {
//   document.getElementById('itemName').textContent = item.title;
//   document.querySelector('.imagepreview').src = item.image;
//   document.getElementById('prod-description').textContent = item.description;
  
//   const quantityInput = document.getElementById('quantityInput');  // Select the quantity input

//   // Add item to cart with specified quantity from modal
//   document.querySelector('.add-to-cart-btn').onclick = () => {
//       const quantity = parseInt(quantityInput.value) || 1; // Use quantity value from input
//       addToCart(item.id, quantity);
      
//       // Display confirmation message and reset quantity input to 1
//       document.getElementById('added-to-cart').textContent = 'Added to Cart!';
//       quantityInput.value = 1;  // Reset quantity after adding to cart

//       // Clear confirmation message after 1.5 seconds
//       setTimeout(() => document.getElementById('added-to-cart').textContent = '', 1500);
//   };
// }


function addToCart(productId, quantity = 1) {
  if (typeof window.products === 'undefined') {
    // console.error('Products list is not available.');
    return;
  }
  
  const product = window.products.find(item => item.id === productId);
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
    saveCart();
    updateCartDisplay();
  }
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


  if (cart.length === 0) {
    // Display "Cart is empty" message
    cartItemsContainer.innerHTML = '<p>Your cart is empty!</p>';
    
    // Check if cartButtonsContainer exists before accessing its style
    if (cartButtonsContainer) {
      cartButtonsContainer.style.opacity = '0';
    } else {
      console.error('cartButtonsContainer not found');
    }

    // Check if .empty-crt exists before accessing its style
    const emptyCart = document.querySelector('.empty-crt');
    if (emptyCart) {
      emptyCart.style.display = 'none';
    } else {
      // console.error('.empty-crt not found');
    }

    // Check if .total-sum exists before accessing its style
    const totalSum = document.querySelector('.total-sum');
    if (totalSum) {
      totalSum.style.display = 'none';
    } else {
      // console.error('.total-sum not found');
    }

  } else {
    // If cart is not empty, show the buttons and total sum
    if (cartButtonsContainer) {
      cartButtonsContainer.style.opacity = '1';
    } else {
      console.error('cartButtonsContainer not found');
    }
  }
}



// // Function to remove item from cart
// function removeFromCart(productId) {
//   cart = cart.filter(item => item.id !== productId);
//   saveCart();
//   updateCartDisplay();
// }



// Function to empty the cart
function emptyCart() {
  cart = [];
  saveCart();
  updateCartDisplay();
}





// Function to update the cart on the cart page
function updateCartPage() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalContainer = document.getElementById('cart-total');

  if (!cartItemsContainer || !cartTotalContainer) return; // Exit if on a different page

  cartItemsContainer.innerHTML = ''; // Clear any existing content

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center;font-size:2rem;">Your cart is empty!</p>';
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
            <p class="subtotal"><b>Total: $${(item.price * item.quantity).toFixed(2)}</b></p>
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

    cartTotalContainer.innerHTML = `<hr><p>Subtotal: $${grandTotal.toFixed(2)}</p>`;
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
  cartTotalContainer.innerHTML = `<hr><p>Subtotal: $${grandTotal.toFixed(2)}</p>`;
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
  localStorage.setItem('cart', JSON.stringify(cart));

  saveCart();
  updateCartPage();
  updateCartDisplay();

}



// Initial load for cart and offcanvas display
updateCartDisplay();
if (document.getElementById('cart-items-container')) {
  updateCartPage();
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.products) {  // Ensure products is defined
    displayItem(products);
    updateCartDisplay();
  } else {
    // console.error("Products are not defined.");
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const togglers = document.querySelectorAll('[data-toggle]');
  
    togglers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
         const selector = e.currentTarget.dataset.toggle
         const block = document.querySelector(`${selector}`);
        if (e.currentTarget.classList.contains('active')) {
          block.style.maxHeight = '';
        } else {
          block.style.maxHeight = block.scrollHeight + 'px';
        }
          
         e.currentTarget.classList.toggle('active')
      })
    })
  })


