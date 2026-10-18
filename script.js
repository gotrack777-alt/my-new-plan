// قاعدة بيانات منتجات "وقار" الأولية// قراءة وتطبيق الهوية والمظهر ديناميكياً
const savedTheme = JSON.parse(localStorage.getItem('waqar_theme'));
if (savedTheme) {
    document.documentElement.style.setProperty('--primary', savedTheme.primaryColor);
    document.documentElement.style.setProperty('--accent', savedTheme.accentColor);
    document.documentElement.style.setProperty('--bg-page', savedTheme.bgColor);
    document.body.style.fontFamily = savedTheme.fontFamily;

    const brandEl = document.querySelector('.brand-logo');
    if (brandEl) brandEl.innerHTML = `${savedTheme.brandName} <span>${savedTheme.brandSub}</span>`;

    const announceEl = document.querySelector('.top-announcement');
    if (announceEl) announceEl.innerText = savedTheme.announcement;

    const heroTitleEl = document.querySelector('.hero h1');
    if (heroTitleEl) heroTitleEl.innerText = savedTheme.heroTitle;

    const heroDescEl = document.querySelector('.hero p');
    if (heroDescEl) heroDescEl.innerText = savedTheme.heroDesc;

    const heroSection = document.querySelector('.hero');
    if (heroSection && savedTheme.heroImage) {
        heroSection.style.background = `linear-gradient(rgba(43, 37, 32, 0.85), rgba(43, 37, 32, 0.9)), url('${savedTheme.heroImage}') center/cover no-repeat`;
    }
}

// قراءة الأقسام ديناميكياً
const savedCategories = JSON.parse(localStorage.getItem('waqar_categories'));
if (savedCategories) {
    const chipsContainer = document.querySelector('.filter-chips');
    if (chipsContainer) {
        chipsContainer.innerHTML = `<button class="chip active" onclick="filterCategory('الكل')">جميع القطع</button>` +
            savedCategories.map(cat => `<button class="chip" onclick="filterCategory('${cat}')">${cat}</button>`).join('');
    }
}

// قراءة المنتجات ديناميكياً
const savedProducts = JSON.parse(localStorage.getItem('waqar_products'));
let products = savedProducts && savedProducts.length > 0 ? savedProducts : [
    {
        id: 1,
        title: "دريس كشمير قطن سمر ميلتون واسع",
        category: "فساتين",
        price: 750,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
    }
];
const products = [
    {
        id: 1,
        title: "دريس كشمير قطن سمر ميلتون واسع",
        category: "فساتين",
        price: 750,
        sizes: ["M (طول 145)", "L (طول 150)", "XL (طول 155)"],
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "سوت كتان محتشمة قطعتين - بيج هادئ",
        category: "سوتس",
        price: 890,
        sizes: ["M", "L", "XL", "Free Size"],
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "عباية خليجي كريب كلاسيك بياقة ساتان",
        category: "عبايات",
        price: 950,
        sizes: ["مقاس 54", "مقاس 56", "مقاس 58"],
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        title: "خمار فرنسي كريب سعودي فاخر - أسود ملكي",
        category: "طرح وخمار",
        price: 320,
        sizes: ["قطعة واحدة (طول 120سم)", "قطعتين مع تنورة"],
        image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        title: "دريس بيسك كريب أوف وايت للطبقات",
        category: "فساتين",
        price: 580,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        title: "بكج 3 طرح كريب سادة بألوان ترابية ناعمة",
        category: "طرح وخمار",
        price: 260,
        sizes: ["مقاس موحد 200×75 سم"],
        image: "https://images.unsplash.com/photo-1601055283742-8b27e81b5553?auto=format&fit=crop&w=600&q=80"
    }
];

// رقم هاتف واتساب لاستقبال الطلبات (قم بتعديله لاحقاً برقمك الحقيقي)
const STORE_PHONE = "201000000000";

let currentCategory = "الكل";
let cart = JSON.parse(localStorage.getItem('waqar_cart')) || [];
const selectedSizes = {};

// عناصر الواجهة
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutModal = document.getElementById('checkoutModal');
const openCheckoutModalBtn = document.getElementById('openCheckoutModalBtn');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const orderForm = document.getElementById('orderForm');

// فلترة المنتجات
window.filterCategory = function(cat) {
    currentCategory = cat;
    document.querySelectorAll('.chip').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat || (cat === 'الكل' && btn.innerText.includes('الكل')));
    });
    renderProducts();
};

// عرض المنتجات
function renderProducts() {
    const filtered = currentCategory === "الكل" 
        ? products 
        : products.filter(p => p.category === currentCategory);

    productsGrid.innerHTML = filtered.map(product => {
        if (!selectedSizes[product.id]) {
            selectedSizes[product.id] = product.sizes[0];
        }
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-details">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">${product.price} ج.م</div>
                    
                    <label style="font-size: 13px; font-weight:700; margin-bottom:6px; color:#443c35;">المقاس / الطول:</label>
                    <div class="size-selector">
                        ${product.sizes.map(size => `
                            <button type="button" class="size-btn ${selectedSizes[product.id] === size ? 'active' : ''}" 
                                onclick="selectSize(${product.id}, '${size}')">
                                ${size}
                            </button>
                        `).join('')}
                    </div>

                    <button class="btn add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> إضافة إلى السلة
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.selectSize = function(productId, size) {
    selectedSizes[productId] = size;
    renderProducts();
};

window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    const size = selectedSizes[productId];
    
    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            size: size,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    openCart();
};

window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
};

window.removeItem = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('waqar_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalSum = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    cartCount.innerText = totalQty;
    cartTotalPrice.innerText = `${totalSum} ج.م`;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p style="text-align:center; color:#736b63; margin-top:40px;">سلة التسوق فارغة حالياً</p>`;
        openCheckoutModalBtn.disabled = true;
        openCheckoutModalBtn.style.opacity = '0.5';
    } else {
        openCheckoutModalBtn.disabled = false;
        openCheckoutModalBtn.style.opacity = '1';
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-img" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-meta">${item.size} | ${item.price} ج.م</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span style="font-weight:700;">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        <button class="remove-item-btn" onclick="removeItem(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function openCart() { document.body.classList.add('cart-open'); }
function closeCart() { document.body.classList.remove('cart-open'); }

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

openCheckoutModalBtn.addEventListener('click', () => {
    closeCart();
    checkoutModal.classList.add('active');
});

closeCheckoutBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

// إرسال الفاتورة عبر واتساب
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const notes = document.getElementById('custNotes').value.trim();
    const totalSum = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let itemsText = cart.map(item => `▪️ ${item.title}\n   (المقاس/الطول: ${item.size}) × ${item.qty} = ${item.price * item.qty} ج.م`).join('\n\n');

    let invoiceMessage = `*طلب شراء جديد من متجر وقار (WAQAR)* 🌿\n\n` +
        `*بيانات العميلة:*\n` +
        `👤 الاسم: ${name}\n` +
        `📱 الهاتف: ${phone}\n` +
        `📍 المحافظة والمدينة: ${city}\n` +
        `🏠 العنوان بالتفصيل: ${address}\n` +
        (notes ? `📝 ملاحظات: ${notes}\n` : '') +
        `\n*تفاصيل المنتجات:*\n` +
        `${itemsText}\n\n` +
        `💰 *إجمالي الفاتورة:* ${totalSum} ج.م\n` +
        `🚚 *طريقة الدفع:* الدفع عند الاستلام بعد المعاينة`;

    const whatsappURL = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(invoiceMessage)}`;

    cart = [];
    saveCart();
    updateCartUI();
    checkoutModal.classList.remove('active');

    window.open(whatsappURL, '_blank');
});

renderProducts();
updateCartUI();