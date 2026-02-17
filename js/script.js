// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navRight = document.querySelector('.nav-right');

if (hamburger && navRight) {
    hamburger.addEventListener('click', () => {
        navRight.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navRight.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
    }

    lastScroll = currentScroll;
});

// Shopping Cart System
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartUI();
        this.attachEventListeners();
    }

    loadCart() {
        const savedCart = localStorage.getItem('almaCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('almaCart', JSON.stringify(this.items));
    }

    addItem(product, price) {
        const existingItem = this.items.find(item => item.product === product);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                product,
                price: parseFloat(price),
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        showNotification(`${product} добавени в количката!`, 'success');
    }

    removeItem(product) {
        this.items = this.items.filter(item => item.product !== product);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(product, change) {
        const item = this.items.find(item => item.product === product);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(product);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateCartUI() {
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.getTotalItems();
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Update cart items
        const cartItemsContainer = document.getElementById('cartItems');
        const totalPriceElement = document.getElementById('totalPrice');
        
        if (cartItemsContainer) {
            if (this.items.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-cart">Количката е празна</p>';
            } else {
                cartItemsContainer.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.product} чорапи</h4>
                            <p>Цена: ${item.price}€</p>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" data-product="${item.product}" data-action="decrease">−</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-product="${item.product}" data-action="increase">+</button>
                        </div>
                        <div class="cart-item-actions">
                            <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</span>
                            <button class="remove-item" data-product="${item.product}">Премахни</button>
                        </div>
                    </div>
                `).join('');

                // Attach event listeners to quantity and remove buttons
                this.attachCartItemListeners();
            }
        }

        // Update total price
        if (totalPriceElement) {
            totalPriceElement.textContent = `${this.getTotalPrice().toFixed(2)}€`;
        }
    }

    attachCartItemListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = e.target.dataset.product;
                const action = e.target.dataset.action;
                const change = action === 'increase' ? 1 : -1;
                this.updateQuantity(product, change);
            });
        });

        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = e.target.dataset.product;
                this.removeItem(product);
                showNotification(`${product} премахнати от количката`, 'info');
            });
        });
    }

    attachEventListeners() {
        // Cart icon click
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        const cartClose = document.getElementById('cartClose');

        if (cartIcon && cartModal) {
            cartIcon.addEventListener('click', () => {
                cartModal.classList.add('active');
            });
        }

        if (cartClose && cartModal) {
            cartClose.addEventListener('click', () => {
                cartModal.classList.remove('active');
            });

            // Close on background click
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                }
            });
        }

        // Add to cart buttons
        const cartButtons = document.querySelectorAll('.btn-cart');
        cartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const product = button.dataset.product;
                const price = button.dataset.price;
                
                if (product && price) {
                    this.addItem(product, price);
                    
                    // Visual feedback
                    button.textContent = '✓ Добавено';
                    button.style.background = '#48bb78';
                    
                    setTimeout(() => {
                        button.textContent = 'Поръчай';
                        button.style.background = '';
                    }, 1500);
                }
            });
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    showNotification('Количката е празна!', 'error');
                    return;
                }

                // Create order summary
                const orderSummary = this.items.map(item => 
                    `${item.product} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€`
                ).join('\n');
                
                const total = this.getTotalPrice().toFixed(2);
                const message = `Поръчка:\n\n${orderSummary}\n\nОбща сума: ${total}€\n\nМоля, попълнете данните си в контактната форма за да финализираме поръчката.`;
                
                alert(message);
                
                // Scroll to contact form
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const cartModal = document.getElementById('cartModal');
                    if (cartModal) {
                        cartModal.classList.remove('active');
                    }
                    
                    const headerOffset = 80;
                    const elementPosition = contactSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add to Cart Buttons (legacy support, now handled by cart class)

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !message) {
            showNotification('Моля, попълнете всички задължителни полета!', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Моля, въведете валиден имейл адрес!', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Благодарим за съобщението! Ще се свържем с вас скоро.', 'success');
        this.reset();
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS for notifications dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-container {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .notification {
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .notification-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .notification-success .notification-icon {
        background: #48bb78;
        color: white;
    }
    
    .notification-error .notification-icon {
        background: #f56565;
        color: white;
    }
    
    .notification-info .notification-icon {
        background: #4299e1;
        color: white;
    }
    
    .notification-message {
        flex: 1;
        color: #2d3748;
    }
    
    @media (max-width: 480px) {
        .notification-container {
            right: 10px;
            left: 10px;
        }
        
        .notification {
            min-width: auto;
            width: 100%;
        }
    }
    
    /* Mobile Navigation Styles */
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 2rem 0;
            gap: 1rem;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(notificationStyles);

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
});

// Product Quick View (Future Enhancement)
// This can be expanded to show product details in a modal
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
});

// Lazy Loading for Images (Future Enhancement)
// If you add real images, implement lazy loading here

console.log('🧦 Alma Pilates Socks website loaded successfully!');