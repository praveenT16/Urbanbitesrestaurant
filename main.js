import { menuItems } from './data.js';

// Application State
let cart = JSON.parse(localStorage.getItem('urban_bites_cart')) || [];
let activeCategory = 'All';
let searchQuery = '';
let activeTestimonialSlide = 0;
let appliedPromo = null; // Store promo code details: { code: '...', discount: 0 }

// DOM Elements
const preloader = document.getElementById('preloader');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleIcon = themeToggleBtn.querySelector('i');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenuIcon = mobileMenuBtn.querySelector('i');
const navLinks = document.getElementById('nav-links');
const navLinksAnchors = navLinks.querySelectorAll('a');
const header = document.querySelector('header');

const menuDishesGrid = document.getElementById('menu-dishes-grid');
const featuredDishesContainer = document.getElementById('featured-dishes-container');
const menuSearchInput = document.getElementById('menu-search-input');
const menuPillsContainer = document.getElementById('menu-pills-container');
const categoryCards = document.querySelectorAll('.category-card');

// Cart Elements
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartOverlayBackground = document.getElementById('cart-overlay-background');
const cartSidebarDrawer = document.getElementById('cart-sidebar-drawer');
const closeCartDrawerBtn = document.getElementById('close-cart-drawer-btn');
const cartItemsListContainer = document.getElementById('cart-items-list-container');
const cartEmptyState = document.getElementById('cart-empty-state');
const cartStartOrderingBtn = document.getElementById('cart-start-ordering-btn');
const cartHeaderQty = document.getElementById('cart-header-qty');
const cartFooterCalculations = document.getElementById('cart-footer-calculations');
const promoCodeInput = document.getElementById('promo-code-input');
const applyPromoBtn = document.getElementById('apply-promo-btn');
const cartSubtotalVal = document.getElementById('cart-subtotal-val');
const cartDeliveryVal = document.getElementById('cart-delivery-val');
const cartTaxVal = document.getElementById('cart-tax-val');
const promoDiscountRow = document.getElementById('promo-discount-row');
const promoDiscountVal = document.getElementById('promo-discount-val');
const cartTotalVal = document.getElementById('cart-total-val');
const checkoutCtaBtn = document.getElementById('checkout-cta-btn');

// Testimonials Elements
const testimonialsTrack = document.getElementById('testimonials-track');
const testimonialSlides = document.querySelectorAll('.testimonial-slide');
const testPrevBtn = document.getElementById('test-prev');
const testNextBtn = document.getElementById('test-next');

// Floating elements
const backToTopBtn = document.getElementById('back-to-top-btn');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// Contact Form Elements
const contactForm = document.getElementById('contact-form-element');
const newsletterForm = document.getElementById('newsletter-form-element');

// ==========================================
// 1. Initial Setup & Loader
// ==========================================
window.addEventListener('load', () => {
  // Ensure theme is applied before fading loader
  const savedTheme = localStorage.getItem('urban_bites_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Fade out preloader
  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    
    // Trigger first check for reveal animations
    handleScrollReveal();
  }, 600);

  // Render initial sections
  renderFeaturedDishes();
  renderMenuGrid();
  updateCartUI();
});

// Scroll Event Handler for Header styling and back-to-top button
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  if (window.scrollY > 500) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }

  handleScrollReveal();
});

// Back to Top functionality
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ==========================================
// 2. Light / Dark Theme Management
// ==========================================
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('urban_bites_theme', newTheme);
  updateThemeIcon(newTheme);
  
  showToast(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'success');
});

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeToggleIcon.className = 'fa-solid fa-sun';
  } else {
    themeToggleIcon.className = 'fa-solid fa-moon';
  }
}

// ==========================================
// 3. Mobile Navigation Menu Drawer
// ==========================================
mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  if (navLinks.classList.contains('active')) {
    mobileMenuIcon.className = 'fa-solid fa-xmark';
  } else {
    mobileMenuIcon.className = 'fa-solid fa-bars-staggered';
  }
});

// Close Mobile Navbar Drawer when any navigation link is clicked
navLinksAnchors.forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    // Active styling toggle
    navLinksAnchors.forEach(a => a.classList.remove('active'));
    anchor.classList.add('active');

    // Close Mobile Drawer
    navLinks.classList.remove('active');
    mobileMenuIcon.className = 'fa-solid fa-bars-staggered';
  });
});

// ==========================================
// 4. Cart Sidebar & State Operations
// ==========================================

// Opening & Closing Cart Drawer
cartToggleBtn.addEventListener('click', openCartDrawer);
cartStartOrderingBtn.addEventListener('click', closeCartDrawer);
closeCartDrawerBtn.addEventListener('click', closeCartDrawer);
cartOverlayBackground.addEventListener('click', closeCartDrawer);

function openCartDrawer() {
  cartSidebarDrawer.classList.add('active');
  cartOverlayBackground.classList.add('active');
  document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeCartDrawer() {
  cartSidebarDrawer.classList.remove('active');
  cartOverlayBackground.classList.remove('active');
  document.body.style.overflow = ''; // Re-enable background scrolling
}

// Cart actions helpers
window.addToCart = function(itemId, qtyInputId = null) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;

  let qty = 1;
  if (qtyInputId) {
    const inputEl = document.getElementById(qtyInputId);
    if (inputEl) {
      qty = parseInt(inputEl.textContent) || 1;
      // Reset input counter back to 1
      inputEl.textContent = '1';
    }
  }

  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === itemId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += qty;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      quantity: qty
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added ${qty}x ${item.name} to cart`, 'success');
  
  // Open cart drawer so user sees feedback instantly
  setTimeout(() => {
    openCartDrawer();
  }, 200);
};

window.changeCartQty = function(itemId, amount) {
  const cartItemIndex = cart.findIndex(item => item.id === itemId);
  if (cartItemIndex === -1) return;

  const currentQty = cart[cartItemIndex].quantity;
  const newQty = currentQty + amount;

  if (newQty <= 0) {
    const itemName = cart[cartItemIndex].name;
    cart.splice(cartItemIndex, 1);
    showToast(`Removed ${itemName} from cart`, 'success');
  } else {
    cart[cartItemIndex].quantity = newQty;
  }

  saveCart();
  updateCartUI();
};

window.removeFromCart = function(itemId) {
  const cartItemIndex = cart.findIndex(item => item.id === itemId);
  if (cartItemIndex === -1) return;

  const itemName = cart[cartItemIndex].name;
  cart.splice(cartItemIndex, 1);
  
  saveCart();
  updateCartUI();
  showToast(`Removed ${itemName} from cart`, 'success');
};

function saveCart() {
  localStorage.setItem('urban_bites_cart', JSON.stringify(cart));
}

function updateCartUI() {
  // Update badges & headers
  const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadgeCount.textContent = totalItemsCount;
  cartHeaderQty.textContent = totalItemsCount;

  // Clear previous rendered items (keeping the empty placeholder)
  const cartItemEls = cartItemsListContainer.querySelectorAll('.cart-item');
  cartItemEls.forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmptyState.style.display = 'flex';
    cartFooterCalculations.style.display = 'none';
  } else {
    cartEmptyState.style.display = 'none';
    cartFooterCalculations.style.display = 'block';

    // Render list
    cart.forEach(item => {
      const itemHtml = `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-controls">
              <div class="qty-selector">
                <button class="qty-btn" onclick="changeCartQty('${item.id}', -1)" aria-label="Decrease quantity"><i class="fa-solid fa-minus fa-xs"></i></button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn" onclick="changeCartQty('${item.id}', 1)" aria-label="Increase quantity"><i class="fa-solid fa-plus fa-xs"></i></button>
              </div>
              <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i> Remove</button>
            </div>
          </div>
        </div>
      `;
      cartItemsListContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    calculateCartTotals();
  }
}

// Promo Code logic
applyPromoBtn.addEventListener('click', () => {
  const code = promoCodeInput.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a promo code first', 'default');
    return;
  }

  if (code === 'PIZZA50') {
    appliedPromo = { code: 'PIZZA50', type: 'pizza_half' };
    showToast('Promo PIZZA50 applied! 50% off all Pizza items', 'success');
  } else if (code === 'FREEGO') {
    appliedPromo = { code: 'FREEGO', type: 'free_delivery' };
    showToast('Promo FREEGO applied! Delivery fee waived', 'success');
  } else {
    appliedPromo = null;
    showToast('Invalid promo code. Try PIZZA50 or FREEGO', 'default');
  }

  promoCodeInput.value = '';
  calculateCartTotals();
});

function calculateCartTotals() {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  let deliveryFee = subtotal > 40 ? 0 : 4.99; // Free delivery automatically over $40
  const gstRate = 0.18; // 18% GST
  let promoDiscount = 0;

  if (appliedPromo) {
    if (appliedPromo.type === 'pizza_half') {
      // Calculate 50% discount only on pizza category items
      const pizzaSubtotal = cart
        .filter(item => item.category === 'Pizza')
        .reduce((total, item) => total + (item.price * item.quantity), 0);
      promoDiscount = pizzaSubtotal * 0.5;
    } else if (appliedPromo.type === 'free_delivery') {
      promoDiscount = deliveryFee;
      deliveryFee = 0;
    }
  }

  const tax = subtotal * gstRate;
  const grandTotal = Math.max(0, (subtotal + deliveryFee + tax) - promoDiscount);

  // Update DOM values
  cartSubtotalVal.textContent = `$${subtotal.toFixed(2)}`;
  
  if (deliveryFee === 0) {
    cartDeliveryVal.textContent = 'FREE';
    cartDeliveryVal.style.color = 'var(--accent-green)';
    cartDeliveryVal.style.fontWeight = '700';
  } else {
    cartDeliveryVal.textContent = `$${deliveryFee.toFixed(2)}`;
    cartDeliveryVal.style.color = '';
    cartDeliveryVal.style.fontWeight = '';
  }

  cartTaxVal.textContent = `$${tax.toFixed(2)}`;

  if (promoDiscount > 0) {
    promoDiscountRow.style.display = 'flex';
    promoDiscountVal.textContent = `-$${promoDiscount.toFixed(2)}`;
  } else {
    promoDiscountRow.style.display = 'none';
  }

  cartTotalVal.textContent = `$${grandTotal.toFixed(2)}`;
}

// Checkout button action (UI only)
checkoutCtaBtn.addEventListener('click', () => {
  showToast('Order processing simulation...', 'success');
  
  setTimeout(() => {
    // Clear cart on success simulation
    cart = [];
    appliedPromo = null;
    saveCart();
    updateCartUI();
    closeCartDrawer();
    
    // Big Success Toast
    showToast('🎉 Order Placed Successfully! Your food is on its way.', 'success');
  }, 1500);
});

// Helper functions for dynamic UI quantity controls outside cart
window.adjustQuantityVal = function(elementId, amount) {
  const counterEl = document.getElementById(elementId);
  if (!counterEl) return;
  let val = parseInt(counterEl.textContent) || 1;
  val = Math.max(1, val + amount);
  counterEl.textContent = val;
};

// ==========================================
// 5. Featured Dishes Rendering
// ==========================================
function renderFeaturedDishes() {
  // Select top 3 items with specific tags for the featured showcase
  const featured = menuItems.filter(item => 
    item.tags.includes('Best Seller') || 
    item.tags.includes('Signature') || 
    item.tags.includes('Must Try')
  ).slice(0, 3);

  featuredDishesContainer.innerHTML = '';

  featured.forEach(dish => {
    // Choose veggie/non-veggie tag style
    const isVeg = dish.tags.includes('Veg');
    const tagClass = isVeg ? 'dish-tag veg' : 'dish-tag';
    const tagText = isVeg ? 'Veg' : 'Non-Veg';

    const cardHtml = `
      <div class="dish-card glass">
        <div class="dish-img-wrapper">
          <span class="${tagClass}">${tagText}</span>
          <img src="${dish.image}" alt="${dish.name}" class="dish-img" loading="lazy">
        </div>
        <div class="dish-info">
          <div class="dish-meta">
            <span class="dish-rating"><i class="fa-solid fa-star"></i> ${dish.rating.toFixed(1)}</span>
            <span class="dish-price">$${dish.price.toFixed(2)}</span>
          </div>
          <h3 class="dish-name">${dish.name}</h3>
          <p class="dish-desc">${dish.description}</p>
          <div class="card-action">
            <div class="qty-selector">
              <button class="qty-btn" onclick="adjustQuantityVal('feat-qty-${dish.id}', -1)" aria-label="Decrease quantity"><i class="fa-solid fa-minus fa-xs"></i></button>
              <span class="qty-num" id="feat-qty-${dish.id}">1</span>
              <button class="qty-btn" onclick="adjustQuantityVal('feat-qty-${dish.id}', 1)" aria-label="Increase quantity"><i class="fa-solid fa-plus fa-xs"></i></button>
            </div>
            <button class="btn btn-primary" onclick="addToCart('${dish.id}', 'feat-qty-${dish.id}')">Add To Bag <i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
      </div>
    `;
    featuredDishesContainer.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// ==========================================
// 6. Interactive Craft Menu (Grid, Filters & Search)
// ==========================================
function renderMenuGrid() {
  menuDishesGrid.innerHTML = '';

  // Filter items by active category & text search
  const filtered = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    menuDishesGrid.innerHTML = `
      <div class="no-items-message">
        <i class="fa-regular fa-face-frown fa-2xl" style="color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
        No dishes match your search "${searchQuery}". Try exploring another category!
      </div>
    `;
    return;
  }

  filtered.forEach(dish => {
    const isVeg = dish.tags.includes('Veg');
    const tagClass = isVeg ? 'dish-tag veg' : 'dish-tag';
    const tagText = isVeg ? 'Veg' : 'Non-Veg';

    const cardHtml = `
      <div class="dish-card glass">
        <div class="dish-img-wrapper">
          <span class="${tagClass}">${tagText}</span>
          <img src="${dish.image}" alt="${dish.name}" class="dish-img" loading="lazy">
        </div>
        <div class="dish-info">
          <div class="dish-meta">
            <span class="dish-rating"><i class="fa-solid fa-star"></i> ${dish.rating.toFixed(1)}</span>
            <span class="dish-price">$${dish.price.toFixed(2)}</span>
          </div>
          <h3 class="dish-name">${dish.name}</h3>
          <p class="dish-desc">${dish.description}</p>
          <div class="card-action">
            <div class="qty-selector">
              <button class="qty-btn" onclick="adjustQuantityVal('menu-qty-${dish.id}', -1)" aria-label="Decrease quantity"><i class="fa-solid fa-minus fa-xs"></i></button>
              <span class="qty-num" id="menu-qty-${dish.id}">1</span>
              <button class="qty-btn" onclick="adjustQuantityVal('menu-qty-${dish.id}', 1)" aria-label="Increase quantity"><i class="fa-solid fa-plus fa-xs"></i></button>
            </div>
            <button class="btn btn-primary" onclick="addToCart('${dish.id}', 'menu-qty-${dish.id}')">Add <i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
      </div>
    `;
    menuDishesGrid.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// Search bar input with debounced trigger
let searchDebounceTimer;
menuSearchInput.addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    searchQuery = e.target.value;
    renderMenuGrid();
  }, 250);
});

// Category Pill clicking
menuPillsContainer.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill-btn');
  if (!pill) return;

  // Toggle active class on pills
  const pills = menuPillsContainer.querySelectorAll('.pill-btn');
  pills.forEach(p => p.classList.remove('active'));
  pill.classList.add('active');

  // Sync category cards state in Popular section
  categoryCards.forEach(card => {
    if (card.dataset.category === pill.dataset.category) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  activeCategory = pill.dataset.category;
  renderMenuGrid();
});

// Sync Popular Categories Section clicks with Menu Section filter
categoryCards.forEach(card => {
  card.addEventListener('click', () => {
    // Remove active state from all category cards
    categoryCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    // Sync menu pills
    const pills = menuPillsContainer.querySelectorAll('.pill-btn');
    pills.forEach(p => {
      if (p.dataset.category === card.dataset.category) {
        p.classList.add('active');
        // Scroll menu pills into view on mobile
        p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        p.classList.remove('active');
      }
    });

    activeCategory = card.dataset.category;
    renderMenuGrid();

    // Scroll smoothly to menu items grid
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  });
});

// ==========================================
// 7. Customer Reviews Testimonial Carousel
// ==========================================
function updateTestimonialCarousel() {
  testimonialsTrack.style.transform = `translateX(-${activeTestimonialSlide * 100}%)`;
}

testNextBtn.addEventListener('click', () => {
  activeTestimonialSlide = (activeTestimonialSlide + 1) % testimonialSlides.length;
  updateTestimonialCarousel();
});

testPrevBtn.addEventListener('click', () => {
  activeTestimonialSlide = (activeTestimonialSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
  updateTestimonialCarousel();
});

// Optional: Auto play testimonials slide every 6 seconds
setInterval(() => {
  activeTestimonialSlide = (activeTestimonialSlide + 1) % testimonialSlides.length;
  updateTestimonialCarousel();
}, 6000);

// ==========================================
// 8. Contact & Newsletter Forms submission
// ==========================================
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Simulating sending animation feedback
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const origText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.innerHTML = origText;
    submitBtn.disabled = false;
    
    // Clear Form inputs
    contactForm.reset();
    showToast('✉️ Message Sent! Our representative will call you back shortly.', 'success');
  }, 1200);
});

newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = newsletterForm.querySelector('input');
  
  showToast('📧 Thank you! Subscribed to special food deals newsletter.', 'success');
  input.value = '';
});

// ==========================================
// 9. Scroll Reveal Animations (Intersection Observer)
// ==========================================
const revealElements = document.querySelectorAll('.reveal');

function handleScrollReveal() {
  const triggerBottom = window.innerHeight * 0.85;

  revealElements.forEach(el => {
    const elTop = el.getBoundingClientRect().top;

    if (elTop < triggerBottom) {
      el.classList.add('active');
    }
  });
}

// ==========================================
// 10. Toast Helper Engine
// ==========================================
function showToast(message, type = 'default') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'success' : ''}`;
  
  let iconHtml = '<i class="fa-solid fa-info-circle"></i>';
  if (type === 'success') {
    iconHtml = '<i class="fa-solid fa-circle-check" style="color: var(--accent-green);"></i>';
  }

  toast.innerHTML = `
    ${iconHtml}
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      toast.remove();
    }, 400); // match fade out delay
  }, 3500);
}
