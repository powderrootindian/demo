import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your Credentials
const firebaseConfig = { 
    apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
    authDomain: "powderroot26.firebaseapp.com",
    projectId: "powderroot26",
};
const EMAILJS_SERVICE = "service_cs926jb", EMAILJS_TEMPLATE = "template_ojt95o7", EMAILJS_KEY = "lxY_3luPFEJNp2_dO";
const UPI_ID = "8788855688-2@ybl", PHONE = "919096999662";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_KEY);

const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "GARLIC POWDER", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];
let cart = [];

window.addEventListener('load', () => {
    document.querySelector('.loader-bar').style.width = '100%';
    setTimeout(() => { document.getElementById('preloader').style.display = 'none'; }, 800);
});

onAuthStateChanged(auth, (user) => {
    document.getElementById('login-btn').classList.toggle('hidden', !!user);
    document.getElementById('user-profile').classList.toggle('hidden', !user);
    if(user) document.getElementById('user-img').src = user.photoURL;
});

window.handleLogin = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    if(item) { cart.push(item); renderCart(); document.getElementById('cart-drawer').classList.add('active'); }
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    let total = 0; list.innerHTML = '';
    cart.forEach(item => {
        total += item.price;
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #111;"><span>${item.name}</span><span style="color:var(--gold)">₹${item.price}</span></div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;
    const upi = document.getElementById('upi-section');
    if(total > 0) {
        upi.classList.remove('hidden');
        const url = `upi://pay?pa=${UPI_ID}&pn=PowderRoot&am=${total}&cu=INR`;
        document.getElementById('upi-mobile-link').href = url;
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(url)}">`;
    }
}

window.checkoutViaWhatsApp = () => {
    const user = auth.currentUser, addr = document.getElementById('cust-address').value;
    if(!user || !addr) return alert("Login & Address required");

    const total = cart.reduce((a, b) => a + b.price, 0), items = cart.map(i => i.name).join(", ");

    // EMAILJS
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { customer_name: user.displayName, order_details: items, total_price: `₹${total}`, shipping_address: addr });

    // SUCCESS UI
    const overlay = document.getElementById('success-overlay');
    overlay.classList.remove('hidden'); setTimeout(() => overlay.classList.add('active'), 10);

    const msg = `✨ *ORDER: POWDER ROOT* ✨\n👤 *Client:* ${user.displayName}\n💰 *Total:* ₹${total}\n📍 *Address:* ${addr}`;
    setTimeout(() => { window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank'); }, 2500);
    cart = []; renderCart(); toggleCart();
};

window.closeSuccess = () => { document.getElementById('success-overlay').classList.add('hidden'); };

products.forEach(p => {
    document.getElementById('product-container').innerHTML += `
        <div class="product-card">
            <img src="${p.img}" style="width:100%; margin-bottom:15px;" onerror="this.src='https://via.placeholder.com/300'">
            <h3>${p.name}</h3><p style="color:var(--gold); margin:10px 0;">₹${p.price}</p>
            <button class="btn-gold-outline" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
