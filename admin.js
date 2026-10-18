// بيانات الدخول الأساسية (محفوظة محلياً ويمكن تعديلها)
const AUTH_KEY = 'waqar_admin_logged';
const DEFAULT_CREDS = { user: 'admin', pass: '123456' };

// التحقق من حالة تسجيل الدخول
function checkAuth() {
    const isLogged = sessionStorage.getItem(AUTH_KEY);
    if (isLogged === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminApp').style.display = 'flex';
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminApp').style.display = 'none';
    }
}

// تنفيذ تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();

    const storedCreds = JSON.parse(localStorage.getItem('waqar_creds')) || DEFAULT_CREDS;
    if (u === storedCreds.user && p === storedCreds.pass) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        checkAuth();
    } else {
        alert('بيانات الدخول غير صحيحة!');
    }
});

function logoutAdmin() {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
}

// التنقل بين الأقسام
function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// أداة قراءة ملفات الصور من الجهاز وتحويلها إلى Base64 DataURL
function fileToDataUrl(fileInput) {
    return new Promise((resolve) => {
        const file = fileInput.files[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 1. إدارة الهوية والمظهر
const defaultTheme = {
    brandName: "وقار",
    brandSub: "WAQAR",
    fontFamily: "'Tajawal', sans-serif",
    primaryColor: "#2b2520",
    accentColor: "#b88e5d",
    bgColor: "#faf8f5",
    announcement: "شحن وتوصيل لجميع المحافظات | الدفع عند الاستلام والمعاينة قبل الاستلام",
    heroImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=80",
    heroTitle: "جمال الحشمة، وأناقة التفاصيل",
    heroDesc: "أزياء راقية وقصات ساترة بخامات معتمدة غير شفافة صُممت بعناية لتمنحك الوقار والراحة."
};
let currentTheme = JSON.parse(localStorage.getItem('waqar_theme')) || defaultTheme;

function loadThemeInputs() {
    document.getElementById('brandNameInput').value = currentTheme.brandName;
    document.getElementById('brandSubInput').value = currentTheme.brandSub;
    document.getElementById('fontFamilyInput').value = currentTheme.fontFamily;
    document.getElementById('primaryColorInput').value = currentTheme.primaryColor;
    document.getElementById('accentColorInput').value = currentTheme.accentColor;
    document.getElementById('bgColorInput').value = currentTheme.bgColor;
    document.getElementById('announcementInput').value = currentTheme.announcement;
    document.getElementById('heroImageInput').value = currentTheme.heroImage;
    document.getElementById('heroTitleInput').value = currentTheme.heroTitle;
    document.getElementById('heroDescInput').value = currentTheme.heroDesc;
}

document.getElementById('themeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const heroUploaded = await fileToDataUrl(document.getElementById('heroFileInput'));
    currentTheme = {
        brandName: document.getElementById('brandNameInput').value,
        brandSub: document.getElementById('brandSubInput').value,
        fontFamily: document.getElementById('fontFamilyInput').value,
        primaryColor: document.getElementById('primaryColorInput').value,
        accentColor: document.getElementById('accentColorInput').value,
        bgColor: document.getElementById('bgColorInput').value,
        announcement: document.getElementById('announcementInput').value,
        heroImage: heroUploaded || document.getElementById('heroImageInput').value || currentTheme.heroImage,
        heroTitle: document.getElementById('heroTitleInput').value,
        heroDesc: document.getElementById('heroDescInput').value
    };
    localStorage.setItem('waqar_theme', JSON.stringify(currentTheme));
    alert('تم حفظ إعدادات الهوية بنجاح! سيتم تطبيقها فوراً في المتجر.');
});

// 2. الكتالوج
let categories = JSON.parse(localStorage.getItem('waqar_categories')) || ["فساتين", "سوتس", "عبايات", "طرح وخمار"];
function renderCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    const select = document.getElementById('prodCategorySelect');
    tbody.innerHTML = categories.map((cat, idx) => `
        <tr>
            <td><strong>${cat}</strong></td>
            <td><button class="btn-danger" onclick="deleteCategory(${idx})">حذف</button></td>
        </tr>
    `).join('');
    select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}
document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newCategoryInput');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        localStorage.setItem('waqar_categories', JSON.stringify(categories));
        input.value = '';
        renderCategories();
    }
});
function deleteCategory(idx) {
    if (confirm('حذف هذا القسم؟')) {
        categories.splice(idx, 1);
        localStorage.setItem('waqar_categories', JSON.stringify(categories));
        renderCategories();
    }
}

// 3. المنتجات ورفع الصور
let products = JSON.parse(localStorage.getItem('waqar_products')) || [
    {
        id: 1,
        title: "دريس كشمير قطن سمر ميلتون واسع",
        category: "فساتين",
        price: 750,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
    }
];

function renderAdminProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = products.map((prod, idx) => `
        <tr>
            <td><img src="${prod.image}" class="img-preview" alt=""></td>
            <td>${prod.title}</td>
            <td>${prod.category}</td>
            <td><strong>${prod.price} ج.م</strong></td>
            <td><button class="btn-danger" onclick="deleteProduct(${idx})">حذف</button></td>
        </tr>
    `).join('');
}

// معاينة الصورة عند اختيار ملف من الكمبيوتر
document.getElementById('prodFileInput').addEventListener('change', async (e) => {
    const imgUrl = await fileToDataUrl(e.target);
    const prev = document.getElementById('prodPreview');
    if (imgUrl) {
        prev.src = imgUrl;
        prev.style.display = 'block';
    }
});

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const uploadedImage = await fileToDataUrl(document.getElementById('prodFileInput'));
    const linkImage = document.getElementById('prodImageLinkInput').value.trim();
    const finalImage = uploadedImage || linkImage || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80";

    const newProd = {
        id: Date.now(),
        title: document.getElementById('prodTitleInput').value.trim(),
        category: document.getElementById('prodCategorySelect').value,
        price: Number(document.getElementById('prodPriceInput').value),
        sizes: document.getElementById('prodSizesInput').value.split(',').map(s => s.trim()),
        image: finalImage
    };

    products.unshift(newProd);
    localStorage.setItem('waqar_products', JSON.stringify(products));
    renderAdminProducts();
    document.getElementById('addProductForm').reset();
    document.getElementById('prodPreview').style.display = 'none';
    alert('تم حفظ ونشر القطعة في المتجر بنجاح!');
});

function deleteProduct(idx) {
    if (confirm('تأكيد حذف هذا المنتج من المتجر؟')) {
        products.splice(idx, 1);
        localStorage.setItem('waqar_products', JSON.stringify(products));
        renderAdminProducts();
    }
}

// 4. إدارة الموظفين ومصفوفة الصلاحيات
let staffMembers = JSON.parse(localStorage.getItem('waqar_staff')) || [
    {
        name: "المدير الأساسي (أنت)",
        roleTitle: "مالك المتجر - Super Admin",
        perms: ["مشاهدة الطلبات", "بيانات العملاء", "الرد على الشات", "إضافة منتجات", "حذف منتجات", "تعديل الأسعار", "تعديل المظهر", "إدارة الموظفين"]
    }
];

function renderStaff() {
    const tbody = document.getElementById('staffTableBody');
    tbody.innerHTML = staffMembers.map((staff, idx) => `
        <tr>
            <td><strong>${staff.name}</strong></td>
            <td>${staff.roleTitle}</td>
            <td>
                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    ${staff.perms.map(p => `<span class="badge">${p}</span>`).join('')}
                </div>
            </td>
            <td>${idx === 0 ? 'المالك' : `<button class="btn-danger" onclick="removeStaff(${idx})">إلغاء</button>`}</td>
        </tr>
    `).join('');
}

document.getElementById('addStaffForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('staffNameInput').value.trim();
    const roleTitle = document.getElementById('staffRoleTitle').value.trim();

    // فحص مربعات الصلاحيات المفعلة
    const perms = [];
    if (document.getElementById('p_view_orders').checked) perms.push("مشاهدة الطلبات");
    if (document.getElementById('p_customer_data').checked) perms.push("بيانات العملاء");
    if (document.getElementById('p_reply_chat').checked) perms.push("الرد على الشات");
    if (document.getElementById('p_add_products').checked) perms.push("إضافة منتجات");
    if (document.getElementById('p_delete_products').checked) perms.push("حذف منتجات");
    if (document.getElementById('p_edit_prices').checked) perms.push("تعديل الأسعار");
    if (document.getElementById('p_change_theme').checked) perms.push("تعديل المظهر");
    if (document.getElementById('p_manage_team').checked) perms.push("إدارة الموظفين");

    staffMembers.push({ name, roleTitle, perms });
    localStorage.setItem('waqar_staff', JSON.stringify(staffMembers));
    document.getElementById('addStaffForm').reset();
    renderStaff();
    alert(`تم تسجيل الموظف (${name}) بالصلاحيات المحددة بنجاح.`);
});

function removeStaff(idx) {
    if (confirm('إلغاء صلاحيات هذا الموظف؟')) {
        staffMembers.splice(idx, 1);
        localStorage.setItem('waqar_staff', JSON.stringify(staffMembers));
        renderStaff();
    }
}

// بدء التشغيل
checkAuth();
loadThemeInputs();
renderCategories();
renderAdminProducts();
renderStaff();