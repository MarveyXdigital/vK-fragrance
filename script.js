/* ============================================================
   VK SCENTS — Upgraded Sales-Driven Script
   ============================================================ */

// ============================================================
// PARTICLE CANVAS (Hero Background)
// ============================================================
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -Math.random() * 0.5 - 0.1;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.gold = Math.random() > 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -5) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.gold
        ? `rgba(201,162,39,${this.alpha})`
        : `rgba(255,255,255,${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ==================
// ANIMATED COUNTER (Hero stats)
// ======================
function animateCounters() {
  document.querySelectorAll(".trust-num").forEach((el) => {
    const target = +el.dataset.count;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString();
    }, 25);
  });
}

const heroObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCounters();
        heroObserver.disconnect();
      }
    });
  },
  { threshold: 0.4 },
);

const heroEl = document.querySelector(".hero-trust");
if (heroEl) heroObserver.observe(heroEl);

// ============================================================
// NAVBAR SCROLL EFFECT
// ============================================================
const navbar = document.getElementById("navbar");
let announcementVisible = true;

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
    if (announcementVisible) navbar.style.top = "";
  }
});

document.getElementById("announcementBar")?.addEventListener("click", (e) => {
  if (e.target.classList.contains("announcement-close")) {
    announcementVisible = false;
    navbar.style.top = "0";
  }
});

// ============================================================
// FADE-IN OBSERVER
// ============================================================
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.08 },
);

document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

// ===========================
// COUNTDOWN TIMER (Flash Sale)
// =============================
(function initTimer() {
  // Set end time: 6hrs 24min from now or load from session
  let endTime = sessionStorage.getItem("saleEnd");
  if (!endTime) {
    endTime = Date.now() + (6 * 3600 + 24 * 60) * 1000;
    sessionStorage.setItem("saleEnd", endTime);
  }
  endTime = +endTime;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const diff = Math.max(0, endTime - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const hEl = document.getElementById("timerH");
    const mEl = document.getElementById("timerM");
    const sEl = document.getElementById("timerS");
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

// =====================
// CART SYSTEM
// =====================
let cart = [];
let cartTotal = 0;

function toggleCart() {
  document.getElementById("cartDropdown").classList.toggle("open");
}

document.addEventListener("click", (e) => {
  const fc = document.getElementById("floatingCart");
  if (fc && !fc.contains(e.target)) {
    document.getElementById("cartDropdown").classList.remove("open");
  }
});

function addToCart(name, price) {
  cart.push({ name, price, id: Date.now() });
  cartTotal += price;
  renderCart();
  showToast(`✓ "${name}" added to cart`);
}

function removeFromCart(id) {
  const idx = cart.findIndex((i) => i.id === id);
  if (idx !== -1) {
    cartTotal -= cart[idx].price;
    cart.splice(idx, 1);
    renderCart();
  }
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  const amountEl = document.getElementById("totalAmount");

  countEl.textContent = cart.length;
  if (cart.length > 0) {
    countEl.classList.add("visible");
  } else {
    countEl.classList.remove("visible");
  }

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    totalEl.style.display = "none";
    return;
  }

  itemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-price">₦${item.price.toLocaleString()}</span>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
    </div>
  `,
    )
    .join("");

  amountEl.textContent = "₦" + cartTotal.toLocaleString();
  totalEl.style.display = "block";
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ============================================================
// CANVAS CUSTOMIZER
// ============================================================
let currentCanvasPrice = 400000;

function selectSize(el) {
  document
    .querySelectorAll(".size-option")
    .forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  const w = +el.dataset.width;
  const h = +el.dataset.height;
  const label = el.dataset.label || el.querySelector("span").textContent;
  const price = +el.dataset.price;
  const frame = document.getElementById("canvasFrame");
  if (frame) {
    frame.style.width = w + "px";
    frame.style.height = h + "px";
  }
  const dimLabel = document.getElementById("canvasDimLabel");
  if (dimLabel) dimLabel.textContent = label;
  currentCanvasPrice = price;
  updateCanvasPrice();
}

function selectFrame(el) {
  document
    .querySelectorAll(".frame-option")
    .forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  const frameColors = {
    gold: "linear-gradient(135deg, #C9A227, #E8D5A3, #C9A227)",
    black: "#2C2C2C",
    white: "#F5F0E6",
    walnut: "#5D4037",
    oak: "#8D6E63",
  };
  const frame = document.getElementById("canvasFrame");
  if (frame) {
    const type = el.dataset.frame;
    if (type === "gold") {
      frame.style.borderImage =
        "linear-gradient(135deg, #C9A227, #E8D5A3, #C9A227) 1";
      frame.style.borderColor = "";
    } else {
      frame.style.borderImage = "none";
      frame.style.borderColor = frameColors[type];
    }
  }
}

function updateCanvasPrice() {
  const el = document.getElementById("canvasPriceDisplay");
  if (el) {
    el.style.transform = "scale(1.08)";
    el.textContent = "₦" + currentCanvasPrice.toLocaleString();
    setTimeout(() => (el.style.transform = ""), 300);
  }
}

// ============================================================
// VIRTUAL ROOM VISUALIZER
// ============================================================
function setWallColor(btn) {
  document
    .querySelectorAll(".wall-color-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const wallEl = document.getElementById("wallColor");
  if (wallEl) wallEl.style.backgroundColor = btn.dataset.color;
}

function setFrameSize(btn) {
  document
    .querySelectorAll(".frame-size-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const frame = document.getElementById("framePreview");
  if (frame) {
    frame.style.width = btn.dataset.width + "px";
    frame.style.height = btn.dataset.height + "px";
  }
}

// ============================================================
// SCENT QUIZ
// ============================================================
let currentQuestion = 0;
const quizData = [
  {
    question: "What atmosphere do you prefer in your space?",
    options: [
      { value: "fresh", label: " Fresh & Airy" },
      { value: "warm", label: " Warm & Cozy" },
      { value: "luxurious", label: "Luxurious & Rich" },
      { value: "earthy", label: " Earthy & Natural" },
    ],
  },
  {
    question: "Which colors appeal to you most?",
    options: [
      { value: "fresh", label: " Cool Blues & Greens" },
      { value: "warm", label: " Warm Golds & Creams" },
      { value: "luxurious", label: " Deep Reds & Burgundy" },
      { value: "earthy", label: " Browns & Earth Tones" },
    ],
  },
  {
    question: "What scents make you feel at home?",
    options: [
      { value: "fresh", label: "Citrus & Light Florals" },
      { value: "warm", label: "Spices & Amber" },
      { value: "luxurious", label: "🪵 Oud & Rich Woods" },
      { value: "earthy", label: "Pine & Earthy Notes" },
    ],
  },
  {
    question: "How would you describe your personal style?",
    options: [
      { value: "fresh", label: " Minimalist & Modern" },
      { value: "warm", label: "Classic & Timeless" },
      { value: "luxurious", label: "Bold & Dramatic" },
      { value: "earthy", label: "Organic & Natural" },
    ],
  },
];

const recommendations = {
  fresh: {
    title: "Ocean Dreams + Sea Salt Mist",
    desc: "Cool blues and marine notes create a refreshing, spa-like atmosphere. Perfect for modern spaces.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    price: 92000,
    productName: "Ocean Dreams Collection",
  },
  warm: {
    title: "Golden Hour + Amber Honey",
    desc: "Warm sunset hues with amber and honey create cozy, welcoming sophistication. A perennial favourite.",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500",
    price: 110000,
    productName: "Golden Hour Collection",
  },
  luxurious: {
    title: "Midnight Bloom + Oud Royale",
    desc: "Dramatic florals with the richest oud create an opulent, unforgettable presence in any room.",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500",
    price: 158000,
    productName: "Midnight Orchid Collection",
  },
  earthy: {
    title: "Forest Whispers + Cedar Pine",
    desc: "Natural greens with earthy cedar notes bring the calm of ancient forests into your living space.",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=500",
    price: 99000,
    productName: "Forest Whispers Collection",
  },
};

let selectedValues = [];
let lastRecommendation = null;

function loadQuestion() {
  const data = quizData[currentQuestion];
  const questionEl = document.getElementById("questionText");
  if (questionEl) questionEl.textContent = data.question;

  const fill = document.getElementById("progressFill");
  if (fill)
    fill.style.width = ((currentQuestion + 1) / quizData.length) * 100 + "%";

  const label = document.getElementById("progressLabel");
  if (label) label.textContent = `${currentQuestion + 1} of ${quizData.length}`;

  const optionsEl = document.getElementById("quizOptions");
  if (!optionsEl) return;
  optionsEl.innerHTML = "";

  data.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt.label;
    btn.dataset.value = opt.value;
    btn.addEventListener("click", () => selectOption(opt.value));
    optionsEl.appendChild(btn);
  });
}

function selectOption(value) {
  selectedValues.push(value);
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    const content = document.getElementById("quizContent");
    content.style.opacity = "0";
    content.style.transform = "translateX(20px)";
    setTimeout(() => {
      loadQuestion();
      content.style.transition = "all 0.35s ease";
      content.style.opacity = "1";
      content.style.transform = "translateX(0)";
    }, 200);
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quizContent").style.display = "none";
  const resultEl = document.getElementById("quizResult");
  resultEl.classList.add("show");

  // Tally scores
  const tally = { fresh: 0, warm: 0, luxurious: 0, earthy: 0 };
  selectedValues.forEach((v) => {
    if (tally[v] !== undefined) tally[v]++;
  });
  const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];

  const result = recommendations[winner] || recommendations.warm;
  lastRecommendation = result;

  const imgEl = document.getElementById("resultImage");
  const titleEl = document.getElementById("resultTitle");
  const descEl = document.getElementById("resultDesc");

  if (imgEl) imgEl.src = result.image;
  if (titleEl) titleEl.textContent = result.title;
  if (descEl) descEl.textContent = result.desc;
}

function addQuizResultToCart() {
  if (lastRecommendation) {
    addToCart(lastRecommendation.productName, lastRecommendation.price);
  }
}

function restartQuiz() {
  currentQuestion = 0;
  selectedValues = [];
  lastRecommendation = null;
  const content = document.getElementById("quizContent");
  const resultEl = document.getElementById("quizResult");
  if (content) {
    content.style.display = "block";
    content.style.opacity = "1";
    content.style.transform = "";
  }
  if (resultEl) resultEl.classList.remove("show");
  loadQuestion();
}

loadQuestion();

// ============================================================
// AUTH MODAL
// ============================================================
function openModal(type) {
  document.getElementById("authModal").classList.add("show");
  switchAuthTab(type);
}

function closeModal() {
  document.getElementById("authModal").classList.remove("show");
}

function switchAuthTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-form")
    .forEach((f) => f.classList.remove("active"));
  if (tab === "login") {
    document.querySelector(".auth-tab:first-child").classList.add("active");
    document.getElementById("loginForm").classList.add("active");
  } else {
    document.querySelector(".auth-tab:last-child").classList.add("active");
    document.getElementById("signupForm").classList.add("active");
  }
}

function handleLogin(e) {
  e.preventDefault();
  closeModal();
  showToast("✓ Welcome back! You are now signed in.");
}

function handleSignup(e) {
  e.preventDefault();
  closeModal();
  showToast("✓ Welcome to Essence & Easel! Account created.");
}

function handleNewsletter(e) {
  e.preventDefault();
  showToast("✓ You're on the list! Check your inbox for a gift.");
  e.target.reset();
}

document.getElementById("authModal")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("authModal")) closeModal();
});

// ============================================================
// MOBILE MENU
// ============================================================
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const authButtons = document.querySelector(".auth-buttons");
  const btn = document.querySelector(".mobile-menu-btn");
  navLinks.classList.toggle("mobile-open");
  authButtons.classList.toggle("mobile-open");
  btn.classList.toggle("active");
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.remove("mobile-open");
    document.querySelector(".auth-buttons").classList.remove("mobile-open");
    document.querySelector(".mobile-menu-btn").classList.remove("active");
  });
});

document.addEventListener("click", (e) => {
  const nb = document.querySelector(".navbar");
  if (!nb?.contains(e.target)) {
    document.querySelector(".nav-links")?.classList.remove("mobile-open");
    document.querySelector(".auth-buttons")?.classList.remove("mobile-open");
    document.querySelector(".mobile-menu-btn")?.classList.remove("active");
  }
});

// ============================================================
// SHIMMER EFFECT ON GOLD LINE (decorative)
// ============================================================
document.querySelectorAll(".gold-line").forEach((el) => {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.style.width = "0";
          el.style.transition = "none";
          setTimeout(() => {
            el.style.transition = "width 0.8s ease";
            el.style.width = "60px";
          }, 50);
          obs.disconnect();
        }
      });
    },
    { threshold: 0.5 },
  );
  obs.observe(el);
});

// ============================================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});
