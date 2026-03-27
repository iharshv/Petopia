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
    const baseUrl = window.API_BASE_URL || '';
    const apiUrl = baseUrl + '/api/categories';
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const categories = await response.json();
            renderFilters(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        const container = document.getElementById('dynamic-filters');
        if (container) container.innerHTML = `<small style="color:#666">Failed to load tags. (URL: ${apiUrl})</small>`;
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
        let variantsHtml = '';
        let mainPrice = product.price;
        let mainMrp = product.mrp;
        let mainWeight = product.weight;

        if (product.variants && product.variants.length > 0) {
            mainPrice = product.variants[0].price;
            mainMrp = product.variants[0].mrp;
            mainWeight = product.variants[0].weight;

            const uniqueWeights = [...new Set(product.variants.map(v => v.weight).filter(w => w))];
            const uniqueFlavors = [...new Set(product.variants.map(v => v.flavor).filter(f => f))];

            variantsHtml = `
                <div class="variant-selection" style="display: flex; gap: 0.5rem; margin-top: 0.8rem;">
                    ${uniqueWeights.length > 0 ? `
                        <select class="v-weight-select" onchange="updateVariantOptions('${product._id}', 'weight')" style="padding: 5px; border-radius: 5px; border: 1px solid #ddd; font-size: 0.85rem; flex: 1;">
                            <option value="">Weight</option>
                            ${uniqueWeights.map(w => `<option value="${w}">${w}</option>`).join('')}
                        </select>
                    ` : ''}
                    ${uniqueFlavors.length > 0 ? `
                        <select class="v-flavor-select" onchange="updateVariantOptions('${product._id}', 'flavor')" style="padding: 5px; border-radius: 5px; border: 1px solid #ddd; font-size: 0.85rem; flex: 1;">
                            <option value="">Flavor</option>
                            ${uniqueFlavors.map(f => `<option value="${f}">${f}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>
            `;
        }

        const discount = mainMrp > 0 ? Math.round(((mainMrp - mainPrice) / mainMrp) * 100) : 0;

        return `
        <div class="product-row" data-id="${product._id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details-list">
                <div class="product-header">
                    <h3>${product.name}</h3>
                    <span class="product-category-tag">${(product.category || []).join(', ')}</span>
                </div>
                <div class="product-description" style="font-size: 0.8rem; color: #666; margin: 0.3rem 0;">
                    ${product.description || ''}
                </div>
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Selected:</span>
                        <span class="meta-value v-selected-label">${mainWeight || '-'}</span>
                    </div>
                </div>
                ${variantsHtml}
            </div>
            <div style="margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; min-width: 120px;">
                 <div class="product-discount-badge v-discount-label">
                    ${discount}% OFF
                </div>
                <div class="price-box" style="text-align: right;">
                    <div class="old-price v-mrp-label" style="text-decoration: line-through; color: #888; font-size: 0.8rem;">₹${mainMrp}</div>
                    <div class="current-price v-price-label" style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">₹${mainPrice}</div>
                </div>
                <a href="tel:+919987801581" class="btn btn-primary" style="text-decoration: none; padding: 5px 15px; font-size: 0.9rem;">
                    <i class="fas fa-phone-alt"></i> Order
                </a>
            </div>
        </div>
    `}).join('');
}

function updateVariantOptions(productId, type) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    const row = document.querySelector(`.product-row[data-id="${productId}"]`);
    const weightSelect = row.querySelector('.v-weight-select');
    const flavorSelect = row.querySelector('.v-flavor-select');
    const priceLabel = row.querySelector('.v-price-label');
    const mrpLabel = row.querySelector('.v-mrp-label');
    const discountLabel = row.querySelector('.v-discount-label');
    const selectedLabel = row.querySelector('.v-selected-label');

    const selectedWeight = weightSelect ? weightSelect.value : '';
    const selectedFlavor = flavorSelect ? flavorSelect.value : '';

    // Dynamic filtering for Flavors based on Weight
    if (type === 'weight' && flavorSelect) {
        const currentFlavor = flavorSelect.value;
        const availableFlavors = [...new Set(product.variants
            .filter(v => !selectedWeight || v.weight === selectedWeight)
            .map(v => v.flavor))];
        
        flavorSelect.innerHTML = '<option value="">Flavor</option>' + 
            availableFlavors.map(f => `<option value="${f}" ${f === currentFlavor ? 'selected' : ''}>${f}</option>`).join('');
    }

    // Dynamic filtering for Weights based on Flavor
    if (type === 'flavor' && weightSelect) {
        const currentWeight = weightSelect.value;
        const availableWeights = [...new Set(product.variants
            .filter(v => !selectedFlavor || v.flavor === selectedFlavor)
            .map(v => v.weight))];
        
        weightSelect.innerHTML = '<option value="">Weight</option>' + 
            availableWeights.map(w => `<option value="${w}" ${w === currentWeight ? 'selected' : ''}>${w}</option>`).join('');
    }

    // Find exact match
    const match = product.variants.find(v => 
        (!selectedWeight || v.weight === selectedWeight) && 
        (!selectedFlavor || v.flavor === selectedFlavor)
    );

    if (match && selectedWeight && (selectedFlavor || !flavorSelect)) {
        priceLabel.textContent = `₹${match.price}`;
        mrpLabel.textContent = `₹${match.mrp}`;
        const discount = Math.round(((match.mrp - match.price) / match.mrp) * 100);
        discountLabel.textContent = `${discount}% OFF`;
        selectedLabel.textContent = `${match.weight} ${match.flavor ? '- ' + match.flavor : ''}`;
    } else {
        // Show starting/default price
        priceLabel.textContent = `₹${product.price}`;
        mrpLabel.textContent = `₹${product.mrp}`;
        const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
        discountLabel.textContent = `${discount}% OFF`;
        selectedLabel.textContent = 'None selected';
    }
}

let activeFilters = [];

function filterProducts(category) {
    const btnAll = document.getElementById('btn-all');
    
    if (category === 'all') {
        activeFilters = [];
    } else {
        const index = activeFilters.indexOf(category);
        if (index > -1) {
            activeFilters.splice(index, 1);
        } else {
            activeFilters.push(category);
        }
    }

    // Update Button UI
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        const btnText = btn.textContent.trim().toLowerCase();
        if (category === 'all' && btn.id === 'btn-all') {
            btn.classList.add('active');
        } else if (btn.id === 'btn-all') {
            btn.classList.toggle('active', activeFilters.length === 0);
        } else if (activeFilters.includes(btnText)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filtering Logic
    if (activeFilters.length === 0) {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => {
            if (!p.category) return false;
            // AND logic: Product must have ALL active filters
            return activeFilters.every(filter => p.category.includes(filter));
        });
        displayProducts(filtered);
    }
}

