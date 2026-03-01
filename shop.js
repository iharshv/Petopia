let allProducts = [];

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check for login
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    await loadProducts();
});

async function loadProducts() {
    try {
        const baseUrl = window.API_BASE_URL || '';
        const response = await fetch(baseUrl + '/api/products');
        if (response.ok) {
            allProducts = await response.json();
            displayProducts(allProducts);
        } else {
            console.error('Failed to fetch products');
            document.getElementById('productProxy').innerHTML = '<p style="text-align:center; padding: 2rem; color: #666;">Failed to load products. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productProxy').innerHTML = '<p style="text-align:center; padding: 2rem; color: #666;">Connection error. Please check your internet.</p>';
    }
}

// Render Products List View
function displayProducts(items) {
    const grid = document.getElementById('productProxy');
    grid.innerHTML = items.map(product => {
        // Calculate discount percentage
        const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

        return `
        <div class="product-row">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details-list">
                <div class="product-header">
                    <h3>${product.name}</h3>
                    <span class="product-category-tag">${product.category.join(', ')}</span>
                </div>
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Weight:</span>
                        <span class="meta-value">${product.weight}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">MRP:</span>
                        <span class="meta-value old-price">₹${product.mrp}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Price:</span>
                        <span class="meta-value current-price">₹${product.price}</span>
                    </div>
                </div>
            </div>
            <div style="margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                 <div class="product-discount-badge">
                    ${discount}% OFF
                </div>
                <a href="tel:+919987801581" class="btn btn-primary" style="text-decoration: none; padding: 5px 15px; font-size: 0.9rem;">
                    <i class="fas fa-phone-alt"></i> Call to Order
                </a>
            </div>
        </div>
    `}).join('');
}

// Filter Logic
function filterProducts(category) {
    // Update Active Button
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Find correctly clicked button from event
    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category && p.category.includes(category));
        displayProducts(filtered);
    }
}

