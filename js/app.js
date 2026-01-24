// 1. SERVICE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. CONFIGURATIONS
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
};

const EMAILJS_PUB_KEY = "lxY_3luPFEJNp2_dO";
const EMAILJS_SERVICE = "service_cs926jb";
const EMAILJS_TEMPLATE = "template_ojt95o7";
const PHONE_NUMBER = "919096999662"; // Ensure country code is included (e.g., 91 for India)

// 3. INITIALIZE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

// 4. PRODUCT CATALOG
const products = [
    { id: 1, name: "Onion powder", price: 299, img: "assets/images/onion.jpg", desc: "Hand-milled sun-dried shallots." },
    { id: 2, name: "Garlic powder", price: 179, img: "assets/images/garlic.jpg", desc: "Slow-aged for deep umami essence." },
    { id: 3, name: "Ginger powder", price: 179, img: "assets/images/ginger.jpg", desc: "Sharply refined organic root." }
];

let cart = [];

// 5. AUTHENTICATION LOGIC
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userImg = document.getElementById('user-img');

    if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userImg.src = user.photoURL;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

window.handleLogout = () => {
    signOut(auth).then(() => {
        alert("Logged out successfully.");
        location.reload();
    });
};

// 6. CART & UI LOGIC
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const product = products.find(x => x.id === id);
    cart.push(product);
    renderCart();
    if(!document.getElementById('cart-drawer').classList.contains('active')) window.toggleCart();
};

window.removeItem = (index) => {
    cart.splice(index, 1);
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const countDisp = document.getElementById('cart-count');
    const qrSection = document.getElementById('qr-payment-section');
    
    list.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div>
                    <div style="font-size:0.9rem; font-weight:600; color:#fff;">${item.name}</div>
                    <div style="color:#ff4d4d; font-size:0.7rem; cursor:pointer; margin-top:4px;" onclick="removeItem(${idx})">REMOVE</div>
                </div>
                <span style="color:#D4AF37; font-weight:600;">₹${item.price}</span>
            </div>`;
    });

    totalDisp.innerText = `₹${total.toFixed(2)}`;
    countDisp.innerText = cart.length;

    // Show/Hide QR Code based on cart content
    if (qrSection) {
        qrSection.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

// 7. MANDATORY LOGIN & CHECKOUT
window.checkoutViaWhatsApp = async () => {
    // Force user check
    const activeUser = auth.currentUser;

    if (!activeUser) {
        alert("Authentication Required: Please login with Google to continue.");
        try {
            await signInWithPopup(auth, provider);
            return; // Exit so they can click checkout again after login
        } catch (err) {
            console.error("Login aborted", err);
            return;
        }
    }

    if (cart.length === 0) return alert("Your bag is empty.");

    const addr = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const zip = document.getElementById('cust-zip').value;

    if (!addr || !city || !zip) return alert("Please fill in shipping details.");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const fullAddress = `${addr}, ${city} - ${zip}`;

    // Prepare EmailJS Data
    const templateParams = {
        to_name: activeUser.displayName,
        user_email: activeUser.email, 
        order_details: cart.map(i => i.name).join(", "),
        total_price: `₹${total}`,
        shipping_address: fullAddress
    };

    // Send Email Receipt
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams)
        .then(() => console.log("Confirmation sent to " + activeUser.email))
        .catch(err => console.error("Email error:", err));

    // Formulate WhatsApp Message
    let waText = `✨ *NEW ORDER: POWDER ROOT* ✨\n`;
    waText += `──────────────────\n\n`;
    waText += `👤 *CUSTOMER:* ${activeUser.displayName}\n`;
    waText += `🛍️ *ITEMS:* ${cart.map(i => i.name).join(", ")}\n`;
    waText += `💰 *TOTAL PAYABLE:* ₹${total}.00\n`;
    waText += `📍 *DELIVER TO:* ${fullAddress}\n\n`;
    waText += `💳 *PAYMENT:* UPI QR Scanned\n`;
    waText += `──────────────────\n`;
    waText += `_I will send the payment screenshot next._`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
};

// 8. PAGE INITIALIZATION
const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card reveal">
            <img src="${p.img}" alt="${p.name}">
            <h3 style="font-family:'Cinzel'; margin-top:20px;">${p.name}</h3>
            <p style="font-size:0.75rem; color:#888; margin:10px 0;">${p.desc}</p>
            <p style="color:#D4AF37; font-weight:bold; font-size:1.1rem;">₹${p.price}</p>
            <button class="btn-gold-outline" style="margin-top:15px;" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>
    `;
});

// Scroll Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
