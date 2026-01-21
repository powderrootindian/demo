import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const PHONE_NUMBER = "919096999662"; // YOUR WHATSAPP NUMBER

const products = [
    { id: 1, name: "Artisanal Onion", price: 45, img: "assets/images/onion.jpg", desc: "Hand-milled sun-dried shallots." },
    { id: 2, name: "Roasted Garlic", price: 55, img: "assets/images/garlic.jpg", desc: "Slow-aged for deep umami essence." },
    { id: 3, name: "Infused Ginger", price: 50, img: "assets/images/ginger.jpg", desc: "Sharply refined organic root." }
];

let cart = [];
let currentUser = null;

// --- AUTH ---
const loginBtn = document.getElementById('login-btn');
const userProfile = document.getElementById('user-profile');
const userImg = document.getElementById('user-img');

loginBtn.onclick = () => signInWithPopup(auth, provider);

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userImg.src = user.photoURL;
    }
});

// --- UI LOGIC ---
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    cart.push(p);
    renderCart();
    if(!document.getElementById('cart-drawer').classList.contains('active')) toggleCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const countDisp = document.getElementById('cart-count');
    list.innerHTML = "";
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:0.9rem;">
            <span>${item.name}</span>
            <span style="color:#D4AF37">$${item.price}</span>
        </div>`;
    });
    totalDisp.innerText = `$${total.toFixed(2)}`;
    countDisp.innerText = cart.length;
}

// --- WHATSAPP CHECKOUT ---
window.checkoutViaWhatsApp = () => {
    if(cart.length === 0) return alert("Select a product first.");
    let text = `*ORDER - POWDER ROOT*%0A`;
    cart.forEach(item => text += `• ${item.name} - $${item.price}%0A`);
    text += `%0A*Total: $${cart.reduce((a,b) => a + b.price, 0)}*`;
    if(currentUser) text += `%0A%0A*Customer:* ${currentUser.displayName}`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
};

// --- RENDER PRODUCTS ---
const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3 style="font-family:'Cinzel'; margin-top:20px; letter-spacing:2px;">${p.name}</h3>
            <p style="font-size:0.75rem; color:#888; margin:10px 0; text-transform:uppercase;">${p.desc}</p>
            <p style="color:#D4AF37; font-weight:bold; margin-bottom:20px;">$${p.price}.00</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>
    `;
});