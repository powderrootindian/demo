import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = { 
    apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds", 
    authDomain: "powderroot26.firebaseapp.com", 
    projectId: "powderroot26" 
};

// EmailJS Config
const EMAILJS_PUB_KEY = "lxY_3luPFEJNp2_dO";
const EMAILJS_SERVICE = "service_cs926jb";
const EMAILJS_TEMPLATE = "template_ojt95o7";

// Payment Config
const UPI_ID = " 8788855688-2@ybl"; 
const BUSINESS_NAME = "Powder Root Boutique";
const PHONE_NUMBER = "919096999662"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

const products = [
    { id: 1, name: "Onion powder", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "Garlic powder ", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "Ginger powder", price: 179, img: "assets/images/ginger.jpg" }
];

let cart = [];

// Auth Monitoring
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    if (user) {
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        document.getElementById('user-img').src = user.photoURL;
    } else {
        loginBtn.style.display = 'block';
        userProfile.style.display = 'none';
    }
});

window.handleLogout = () => signOut(auth).then(() => location.reload());
document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

// Cart UI Logic
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    cart.push(products.find(x => x.id === id));
    renderCart();
    document.getElementById('cart-drawer').classList.add('active');
};

window.removeItem = (index) => {
    cart.splice(index, 1);
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const qrSection = document.getElementById('qr-payment-section');
    
    list.innerHTML = cart.length === 0 ? '<p style="text-align:center; color:#444; margin-top:50px;">Your bag is empty.</p>' : '';
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #1a1a1a; padding-bottom:10px;">
                <div>
                    <p style="margin:0; font-size:0.85rem; font-weight:600;">${item.name}</p>
                    <p style="margin:0; font-size:0.75rem; color:#D4AF37;">₹${item.price}</p>
                </div>
                <i class="fa-solid fa-trash" style="color:#ff4d4d; cursor:pointer; font-size:0.8rem;" onclick="removeItem(${idx})"></i>
            </div>`;
    });

    totalDisp.innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;

    if (cart.length > 0) {
        qrSection.style.display = 'block';
        const upi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total}&cu=INR`;
        document.getElementById('upi-pay-link').href = upi;
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(upi)}" style="border:8px solid white; box-shadow:0 5px 15px rgba(0,0,0,0.5);">`;
    } else {
        qrSection.style.display = 'none';
    }
}

window.checkoutViaWhatsApp = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please login with Google to continue.");
    if (cart.length === 0) return alert("Bag is empty.");
    
    const addr = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    if (!addr || !city) return alert("Please enter shipping details.");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const itemNames = cart.map(i => i.name).join(", ");
    const fullAddr = `${addr}, ${city}`;

    // Email Backup
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { 
        to_name: "Admin", from_name: user.displayName, user_email: user.email, 
        order_details: itemNames, total_price: `₹${total}`, shipping_address: fullAddr 
    });

    // WhatsApp Direct
    let text = `✨ *BOUTIQUE ORDER* ✨\n👤 *CLIENT:* ${user.displayName}\n🛍️ *ITEMS:* ${itemNames}\n💰 *TOTAL:* ₹${total}\n📍 *DELIVERY:* ${fullAddr}`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
};

// Render Shop
const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}">
            <h3 style="font-family:'Cinzel';">${p.name}</h3>
            <p style="color:var(--gold); font-weight:bold;">₹${p.price}</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
