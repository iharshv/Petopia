// Product Data
const products = [
    {
        id: 1,
        name: "Royal Canin Puppy Food",
        category: ["dog", "food"],
        weight: "1kg",
        price: 850,
        mrp: 945,
        image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=500&q=60",
        description: "Premium dry food for growing puppies."
    },
    {
        id: 2,
        name: "Whiskas Cat Food (Tuna)",
        category: ["cat", "food"],
        weight: "1.2kg",
        price: 450,
        mrp: 500,
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=60",
        description: "Delicious tuna flavor wet food for adult cats."
    },
    {
        id: 3,
        name: "Dog Leash",
        category: ["dog", "accessories"],
        weight: "200g",
        price: 350,
        mrp: 399,
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=60",
        description: "Strong nylon leash with padded handle."
    },
    {
        id: 4,
        name: "Cat Scratching Post",
        category: ["cat", "accessories"],
        weight: "1.5kg",
        price: 1200,
        mrp: 1350,
        image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=500&q=60",
        description: "Sisal rope scratching post with hanging toy."
    },
    {
        id: 5,
        name: "Pedigree Adult Dog Food",
        category: ["dog", "food"],
        weight: "3kg",
        price: 1500,
        mrp: 1699,
        image: "https://images.unsplash.com/photo-1589924691195-41432c84c1e7?auto=format&fit=crop&w=500&q=60",
        description: "Complete nutrition for adult dogs (Chicken & Veg)."
    },
    {
        id: 6,
        name: "Plush Pet Bed",
        category: ["dog", "cat", "accessories"],
        weight: "1kg",
        price: 2200,
        mrp: 2499,
        image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=500&q=60",
        description: "Super soft, washable bed for small to medium pets."
    },
    {
        id: 7,
        name: "Squeaky Toy",
        category: ["dog", "accessories"],
        weight: "100g",
        price: 250,
        mrp: 299,
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=60",
        description: "Durable rubber toy for dental health."
    },
    {
        id: 8,
        name: "Cat Grooming Brush",
        category: ["cat", "accessories"],
        weight: "150g",
        price: 199,
        mrp: 249,
        image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=500&q=60",
        description: "Gentle brush to remove loose fur and tangles."
    },
    {
        id: 9,
        name: "Dog Harness",
        category: ["dog", "accessories"],
        weight: "300g",
        price: 650,
        mrp: 799,
        image: "https://images.unsplash.com/photo-1601758124096-1fd661873b95?auto=format&fit=crop&w=500&q=60",
        description: "Comfortable harness with reflective strips."
    },
    {
        id: 10,
        name: "Water Dispenser",
        category: ["dog", "cat", "accessories"],
        weight: "800g",
        price: 1800,
        mrp: 2100,
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=60",
        description: "Keep your pet hydrated with fresh flowing water."
    },
    {
        id: 11,
        name: "Cat Litter (Lavender)",
        category: ["cat", "accessories"],
        weight: "5kg",
        price: 399,
        mrp: 450,
        image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=500&q=60",
        description: "Odour control clumping litter."
    },
    {
        id: 12,
        name: "Chicken Jerky Treats",
        category: ["dog", "food"],
        weight: "200g",
        price: 299,
        mrp: 349,
        image: "https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=500&q=60",
        description: "100% natural dried chicken treats."
    },
    {
        id: 13,
        name: "Pet Carrier Bag",
        category: ["dog", "cat", "accessories"],
        weight: "1.2kg",
        price: 1299,
        mrp: 1599,
        image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=500&q=60",
        description: "Travel safe carrier with ventilation."
    },
    {
        id: 14,
        name: "Anti-Tick Shampoo",
        category: ["dog", "accessories"],
        weight: "250ml",
        price: 349,
        mrp: 399,
        description: "Effective protection against ticks and fleas."
    }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check for login
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    displayProducts(products);
});

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
    event.target.classList.add('active');

    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category.includes(category));
        displayProducts(filtered);
    }
}

