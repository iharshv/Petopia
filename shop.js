let allProducts = [];

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check for login
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    await loadProducts();
    await loadCategories();
    filterProducts('all');
});

async function loadCategories() {
    try {
        const baseUrl = window.API_BASE_URL || '';
        const response = await fetch(baseUrl + '/api/categories');
        if (response.ok) {
            const categories = await response.json();
            renderFilters(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderFilters(categories) {
    const container = document.getElementById('dynamic-filters');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <button class="filter-btn" onclick="filterProducts('${cat}')">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
    `).join('');
}

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
        document.getElementById('productProxy').innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #666;">
                <p>Connection error. Please check your internet.</p>
                <small style="color: #999;">Attempted URL: ${baseUrl + '/api/products'}</small>
            </div>`;
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

    // Find correctly clicked button from event or item click
    if (typeof event !== 'undefined' && event && event.target && event.target.classList.contains('filter-btn')) {
        event.target.classList.add('active');
    } else if (category === 'all') {
        const btnAll = document.getElementById('btn-all');
        if (btnAll) btnAll.classList.add('active');
    } else {
        // Highlight based on text content (for programmatic calls)
        const targetBtn = Array.from(buttons).find(b => b.textContent.trim().toLowerCase() === category.toLowerCase());
        if (targetBtn) targetBtn.classList.add('active');
    }

    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category && p.category.includes(category));
        displayProducts(filtered);
    }
}

