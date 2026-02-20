// === Data ===
const defaultProducts = [
{ id: 1, name: "بيبروني", price: 100, category: "بيتزا", icon: "fa-pizza-slice" },
{ id: 2, name: "ميكس لحم", price: 115, category: "بيتزا", icon: "fa-pizza-slice" },
{ id: 3, name: "دجاج", price: 100, category: "بيتزا", icon: "fa-pizza-slice" },
{ id: 4, name: "شاورما فراخ", price: 120, category: "بيتزا", icon: "fa-pizza-slice" },
{ id: 5, name: "فاهيتا", price: 130, category: "بيتزا", icon: "fa-pizza-slice" },
{ id: 17, name: "دجاج", price: 75, category: "كريب", icon: "fa-burrito" },
{ id: 18, name: "شاورما فراخ", price: 75, category: "كريب", icon: "fa-burrito" },
{ id: 35, name: "ميكس جن", price: 90, category: "فطائر", icon: "fa-bread-slice" },
{ id: 58, name: "برجر كلاسك لحم", price: 135, category: "برجر", icon: "fa-burger" },
{ id: 63, name: "سوري بفتاكس", price: 20, category: "سوري", icon: "fa-bread-slice" },
{ id: 78, name: "حواوشي", price: 45, category: "حوادشي", icon: "fa-fire" },
{ id: 84, name: "وافل لوتس", price: 60, category: "وافل", icon: "fa-cookie" },
{ id: 90, name: "إضافة برجر", price: 25, category: "اضافات", icon: "fa-plus" },
{ id: 112, name: "مياه معدنية", price: 5, category: "مشروبات", icon: "fa-bottle-water" }
];

let DB = {
products: JSON.parse(localStorage.getItem('qasr_products')) || defaultProducts,
sales: JSON.parse(localStorage.getItem('qasr_sales')) || []
};
let cart = [];
let orderData = { type: 'dine-in', table: 1, payment: 'cash' };
let pendingSaleData = null;

function saveDB() {
localStorage.setItem('qasr_products', JSON.stringify(DB.products));
localStorage.setItem('qasr_sales', JSON.stringify(DB.sales));
}

function getIconByCategory(category) {
const icons = {
'بيتزا': 'fa-pizza-slice', 'كريب': 'fa-burrito', 'فطائر': 'fa-bread-slice',
'برجر': 'fa-burger', 'سوري': 'fa-bread-slice', 'حوادشي': 'fa-fire',
'وافل': 'fa-cookie', 'مشروبات': 'fa-bottle-water', 'اضافات': 'fa-plus'
};
return icons[category] || 'fa-utensils';
}

function showSection(id, nav) {
document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
document.getElementById(id).classList.add('active');
document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
if(nav) nav.classList.add('active');
if(id === 'products') renderAdminGrid();
if(id === 'sales') renderSalesHistory();
if(id === 'reports') renderReports();
}

// === Order Type Logic ===
function setOrderType(type, btn) {
document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
orderData.type = type;

const tableGroup = document.getElementById('tableGroup');
const customerDetails = document.getElementById('customerDetails');

if(type === 'dine-in') {
tableGroup.style.display = 'flex';
customerDetails.classList.remove('show');
} else if(type === 'takeaway') {
tableGroup.style.display = 'none';
customerDetails.classList.remove('show');
} else if(type === 'delivery') {
tableGroup.style.display = 'none';
customerDetails.classList.add('show');
}
}

// === Render Functions ===
function renderPOS(filterList = DB.products) {
const grid = document.getElementById('posGrid');
grid.innerHTML = filterList.map(p => `
<div class="pos-card" onclick="addToCart(${p.id})">
<div class="item-icon"><i class="fas ${p.icon || 'fa-utensils'}"></i></div>
<div class="item-name">${p.name}</div>
<div class="item-price">${p.price} ج.م</div>
</div>
`).join('');
}

function renderAdminGrid() {
const grid = document.getElementById('adminGrid');
if(!grid) return;
grid.innerHTML = DB.products.map((p, i) => `
<div class="pos-card" style="cursor:default; min-height:auto; padding:15px;">
<div class="item-icon" style="font-size:2rem; margin-bottom:10px;"><i class="fas ${p.icon}"></i></div>
<div class="item-name" style="height:auto; margin-bottom:5px;">${p.name}</div>
<div class="item-price">${p.price} ج.م</div>
<div style="display:flex; gap:10px; margin-top:15px;">
<button class="btn btn-secondary" style="flex:1; padding:8px; font-size:0.9rem;" onclick="editProduct(${i})">
<i class="fas fa-edit"></i> تعديل
</button>
<button class="btn btn-secondary" style="flex:1; padding:8px; font-size:0.9rem; background:rgba(239,68,68,0.2); color:#ef4444;" onclick="deleteProduct(${i})">
<i class="fas fa-trash"></i> حذف
</button>
</div>
</div>
`).join('');
}

function filterCategory(cat) {
document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
event.target.classList.add('active');
if(cat === 'all') renderPOS();
else renderPOS(DB.products.filter(p => p.category === cat));
}

function searchProducts(q) {
const term = q.toLowerCase();
const filtered = DB.products.filter(p => 
p.name.toLowerCase().includes(term) || 
p.category.toLowerCase().includes(term)
);
renderPOS(filtered);
}

// === Cart Functions ===
function addToCart(id) {
const product = DB.products.find(p => p.id === id);
if(!product) return;
const existing = cart.find(i => i.id === id);
if(existing) existing.qty++;
else cart.push({ ...product, qty: 1 });
updateCartUI();
}

function updateCartUI() {
const list = document.getElementById('cartList');
if(cart.length === 0) {
list.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-gray);">السلة فارغة</div>';
} else {
list.innerHTML = cart.map((item, idx) => `
<div class="cart-item">
<div>
<div style="font-weight:700; color:#fff;">${item.name}</div>
<div style="font-size:0.8rem; color:var(--text-gray);">${item.price} ج.م × ${item.qty}</div>
</div>
<div style="display:flex; align-items:center; gap:10px;">
<div class="cart-controls">
<button onclick="changeQty(${idx}, -1)">-</button>
<span>${item.qty}</span>
<button onclick="changeQty(${idx}, 1)">+</button>
</div>
<i class="fas fa-trash-alt" style="color:#ef4444; cursor:pointer;" onclick="removeFromCart(${idx})"></i>
</div>
</div>
`).join('');
}
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
const discount = parseFloat(document.getElementById('discountInput').value) || 0;
const total = subtotal - (subtotal * (discount / 100));
document.getElementById('cartTotal').innerText = total.toFixed(2) + ' ج.م';
document.getElementById('cartCount').innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

function changeQty(idx, delta) {
const item = cart[idx];
const newQty = item.qty + delta;
if(newQty <= 0) removeFromCart(idx);
else { item.qty = newQty; updateCartUI(); }
}

function removeFromCart(idx) {
cart.splice(idx, 1);
updateCartUI();
}

function clearCart() {
if(cart.length === 0) return;
if(confirm('هل أنت متأكد من مسح السلة؟')) {
cart = [];
document.getElementById('discountInput').value = 0;
updateCartUI();
}
}

// === Checkout & Print ===
function openCheckoutModal() {
if(cart.length === 0) return alert('السلة فارغة!');
const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
const discount = parseFloat(document.getElementById('discountInput').value) || 0;
const total = subtotal - (subtotal * (discount / 100));
document.getElementById('modalTotal').innerText = total.toFixed(2) + ' ج.م';
document.getElementById('checkoutModal').classList.add('active');
}

function selectPayment(method, btn) {
document.querySelectorAll('.payment-opt').forEach(b => b.classList.remove('selected'));
btn.classList.add('selected');
orderData.payment = method;
}

function prepareSaleData() {
const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
const discount = parseFloat(document.getElementById('discountInput').value) || 0;
const total = subtotal - (subtotal * (discount / 100));
return {
id: Date.now().toString().slice(-6),
date: new Date().toLocaleString('ar-EG'),
type: orderData.type,
table: orderData.type === 'dine-in' ? document.getElementById('tableNum').value : null,
customer: orderData.type === 'delivery' ? {
name: document.getElementById('custName').value || 'زائر',
phone: document.getElementById('custPhone').value || '',
address: document.getElementById('custAddress').value || ''
} : null,
payment: orderData.payment,
items: [...cart],
subtotal: subtotal,
discount: discount,
total: total
};
}

function getOrderTypeLabel(type) {
return type === 'dine-in' ? '🍽️ صالة' : type === 'delivery' ? '🚚 ديليفري' : '🛍️ تكاوي';
}

function getReceiptHTML(sale) {
const typeLabel = getOrderTypeLabel(sale.type);
const paymentLabel = sale.payment === 'cash' ? 'كاش' : sale.payment === 'card' ? 'فيزا' : 'محفظة';
const tableInfo = sale.table ? `<div class="r-info">طاولة رقم: ${sale.table}</div>` : '';
const customerInfo = sale.customer ? `
<div class="r-info">العميل: ${sale.customer.name}</div>
<div class="r-info">هاتف: ${sale.customer.phone}</div>
<div class="r-info">عنوان: ${sale.customer.address}</div>
` : '';
return `
<div class="r-header">
<div class="r-logo">🏰 قصر الشام</div>
<div class="r-info">سقارة - كوبري البلد</div>
<div class="r-info">${sale.date}</div>
<div class="r-info">فاتورة #: ${sale.id}</div>
<div class="r-info"><strong>${typeLabel}</strong></div>
${tableInfo}${customerInfo}
</div>
<div class="r-divider"></div>
${sale.items.map(i => `<div class="r-item"><span>${i.name} ×${i.qty}</span><span>${(i.price*i.qty).toFixed(0)}</span></div>`).join('')}
<div class="r-divider"></div>
<div class="r-item"><span>المجموع:</span><span>${sale.subtotal.toFixed(2)}</span></div>
<div class="r-item"><span>خصم ${sale.discount}%:</span><span>-${(sale.subtotal*sale.discount/100).toFixed(2)}</span></div>
<div class="r-total"><span>الصافي:</span><span>${sale.total.toFixed(2)} ج.م</span></div>
<div class="r-info" style="margin-top:10px;">الدفع: ${paymentLabel}</div>
<div class="r-footer">شكراً لزيارتكم 🙏</div>
<div class="r-barcode"></div>
`;
}

function confirmCheckout() {
pendingSaleData = prepareSaleData();
document.getElementById('checkoutModal').classList.remove('active');
document.getElementById('printPreviewContent').innerHTML = getReceiptHTML(pendingSaleData);
document.getElementById('printPreviewModal').classList.add('active');
}

function directCheckout() {
if(cart.length === 0) return alert('السلة فارغة!');
pendingSaleData = prepareSaleData();
document.getElementById('printPreviewContent').innerHTML = getReceiptHTML(pendingSaleData);
document.getElementById('printPreviewModal').classList.add('active');
}

function confirmPrint() {
if(!pendingSaleData) return;
const printArea = document.getElementById('printArea');
printArea.innerHTML = `<div class="receipt-thermal">${getReceiptHTML(pendingSaleData)}</div>`;
window.print();
finalizeSale();
}

function finalizeSale() {
const sale = { ...pendingSaleData };
DB.sales.unshift(sale);
saveDB();
cart = [];
document.getElementById('discountInput').value = 0;
document.getElementById('custName').value = '';
document.getElementById('custPhone').value = '';
document.getElementById('custAddress').value = '';
updateCartUI();
renderPOS();
closeModal('printPreviewModal');
}

// === Admin Functions ===
function openProductModal(idx = null) {
const modal = document.getElementById('productModal');
modal.classList.add('active');
if(idx !== null && idx >= 0) {
document.getElementById('modalTitle').innerText = 'تعديل منتج';
document.getElementById('pIndex').value = idx;
const p = DB.products[idx];
if(p) {
document.getElementById('pName').value = p.name || '';
document.getElementById('pPrice').value = p.price || '';
document.getElementById('pCategory').value = p.category || 'بيتزا';
}
} else {
document.getElementById('modalTitle').innerText = 'منتج جديد';
document.getElementById('pIndex').value = '-1';
document.getElementById('pName').value = '';
document.getElementById('pPrice').value = '';
}
}

function closeModal(id) {
const modal = document.getElementById(id);
if(modal) modal.classList.remove('active');
}

function saveProduct() {
const idx = document.getElementById('pIndex').value;
const name = document.getElementById('pName').value.trim();
const price = parseFloat(document.getElementById('pPrice').value);
const cat = document.getElementById('pCategory').value;
if(!name || isNaN(price)) { alert('يرجى إدخال اسم المنتج وسعر صحيح'); return; }
const icon = getIconByCategory(cat);
if(idx == '-1') {
DB.products.push({ id: Date.now(), name, price, category: cat, icon });
} else {
const index = parseInt(idx);
if(DB.products[index]) {
DB.products[index] = { ...DB.products[index], name, price, category: cat, icon };
}
}
saveDB(); closeModal('productModal'); renderAdminGrid(); renderPOS();
alert('✅ تم الحفظ بنجاح!');
}

function editProduct(i) { openProductModal(i); }
function deleteProduct(i) {
if(confirm('هل أنت متأكد من حذف هذا المنتج؟\n\n' + DB.products[i].name)) {
DB.products.splice(i, 1); saveDB(); renderAdminGrid(); renderPOS();
alert('✅ تم الحذف بنجاح!');
}
}

function renderSalesHistory() {
const tbody = document.getElementById('salesTableBody');
if(!tbody) return;
tbody.innerHTML = DB.sales.map(s => `
<tr>
<td>#${s.id}</td>
<td>${s.date ? s.date.split(',')[0] : new Date().toLocaleDateString('ar-EG')}</td>
<td>${getOrderTypeLabel(s.type)}</td>
<td style="font-weight:bold; color:var(--secondary-glow);">${s.total.toFixed(2)}</td>
<td><button class="btn btn-secondary" style="padding:4px 8px;" onclick='reprint(${JSON.stringify(s).replace(/'/g, "\\'")})'><i class="fas fa-print"></i></button></td>
</tr>
`).join('');
}

function reprint(sale) {
pendingSaleData = sale;
document.getElementById('printPreviewContent').innerHTML = getReceiptHTML(pendingSaleData);
document.getElementById('printPreviewModal').classList.add('active');
}

function renderReports() {
const total = DB.sales.reduce((sum, s) => sum + s.total, 0);
document.getElementById('reportTotalSales').innerText = total.toFixed(2) + ' ج.م';
document.getElementById('reportTotalCount').innerText = DB.sales.length;
}

function exportData() {
const a = document.createElement('a');
a.href = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DB));
a.download = "backup_qasr_" + Date.now() + ".json";
a.click();
}

function handleImport(input) {
const reader = new FileReader();
reader.onload = (e) => {
try {
DB = JSON.parse(e.target.result);
saveDB(); renderPOS(); renderAdminGrid();
alert('✅ تم الاستيراد بنجاح');
} catch(err) { alert('❌ ملف غير صالح'); }
};
if(input.files[0]) reader.readAsText(input.files[0]);
}

function clearAllData() {
if(prompt('⚠️ اكتب "نعم" للتأكيد على مسح جميع البيانات') === 'نعم') {
localStorage.clear(); location.reload();
}
}

// === Keyboard Shortcuts ===
document.addEventListener('keydown', (e) => {
if(e.key === 'F2') { e.preventDefault(); document.getElementById('posSearch').focus(); }
if(e.key === 'F4') { e.preventDefault(); openCheckoutModal(); }
if(e.key === 'Escape') {
document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
});

// === Init ===
window.onload = () => {
renderPOS();
renderAdminGrid();
window.onclick = (e) => {
if(e.target.classList.contains('modal')) {
e.target.classList.remove('active');
}
};
};
