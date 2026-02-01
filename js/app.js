import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
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

onAuthStateChanged(auth, (user) => {
    document.getElementById('login-btn').classList.toggle('hidden', !!user);
    document.getElementById('user-profile').classList.toggle('hidden', !user);
    if(user) document.getElementById('user-img').src = user.photoURL;
});

window.handleLogin = () => signInWithPopup(auth, provider);
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
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #222; font-size:0.9rem;"><span>${item.name}</span><span>₹${item.price}</span></div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;

    if(total > 0) {
        document.getElementById('payment-area').classList.remove('hidden');
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=PowderRoot&am=${total}&cu=INR`;
        // Desktop QR
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(upiUrl)}">`;
        // Mobile Intent
        document.getElementById('upi-intent-link').href = upiUrl;
    }
}

window.processOrder = () => {
    const user = auth.currentUser, addr = document.getElementById('cust-address').value;
    if(!user || !addr) return alert("Please Login & Enter Address first");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const items = cart.map(i => i.name).join(", ");

    // 1. Send Email Log
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { 
        customer_name: user.displayName, 
        order_details: items, 
        total_price: `₹${total}`, 
        shipping_address: addr 
    });

    // 2. Open WhatsApp Confirmation
    const msg = `✨ *ORDER INITIATED* ✨\n👤 *Client:* ${user.displayName}\n💰 *Total:* ₹${total}\n📍 *Address:* ${addr}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');

    // 3. Show Success Overlay
    document.getElementById('success-overlay').classList.remove('hidden');
};

products.forEach(p => {
    document.getElementById('product-container').innerHTML += `
        <div class="product-card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/300'">
            <h3 style="font-family:'Cinzel'; font-size:1rem;">${p.name}</h3>
            <p style="color:var(--gold); margin:10px 0; font-weight:bold;">₹${p.price}</p>
            <button onclick="addToCart(${p.id})" style="width:100%; padding:10px; background:none; border:1px solid var(--gold); color:var(--gold); cursor:pointer;">ADD TO BAG</button>
        </div>`;
});
