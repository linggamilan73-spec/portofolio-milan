// Animated network globe background
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

let W, H, particles = [];
const COUNT = 80;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

class Particle {
    constructor() { this.reset(); }
    reset() {
        // Distribute along a globe arc (bottom half of screen)
        const angle = Math.random() * Math.PI; // 0..PI = left to right arc
        const radiusX = W * 0.55;
        const radiusY = H * 0.45;
        const cx = W / 2;
        const cy = H * 0.72;
        this.x = cx + Math.cos(angle) * radiusX * (0.4 + Math.random() * 0.6);
        this.y = cy - Math.sin(angle) * radiusY * (0.3 + Math.random() * 0.7);
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.r = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.6 + 0.3;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,180,255,${this.alpha})`;
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
}

function drawGlobe() {
    const cx = W / 2;
    const cy = H * 0.72;
    const rx = W * 0.55;
    const ry = H * 0.45;

    // Glow base
    const grd = ctx.createRadialGradient(cx, cy - ry * 0.3, ry * 0.1, cx, cy, ry * 1.1);
    grd.addColorStop(0,   "rgba(0,80,180,0.25)");
    grd.addColorStop(0.5, "rgba(0,40,100,0.12)");
    grd.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Globe arc edge glow
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#1a8fff";
    ctx.strokeStyle = "rgba(50,150,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2); // top arc only
    ctx.stroke();
    ctx.restore();
}

function drawConnections() {
    const dist = 160;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < dist) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(80,160,255,${0.18 * (1 - d / dist)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H);
    bg.addColorStop(0,   "#051a3a");
    bg.addColorStop(0.5, "#020d1f");
    bg.addColorStop(1,   "#000000");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawGlobe();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });

    requestAnimationFrame(animate);
}

resize();
init();
animate();
window.addEventListener("resize", () => { resize(); init(); });

// Jam Jakarta (WIB = UTC+7)
function updateJam() {
    const now = new Date();
    const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const h = String(wib.getHours()).padStart(2, "0");
    const m = String(wib.getMinutes()).padStart(2, "0");
    const s = String(wib.getSeconds()).padStart(2, "0");
    document.getElementById("jamJkt").textContent = `\u{1F550} ${h}:${m}:${s} WIB`;
}
updateJam();
setInterval(updateJam, 1000);

// Animate skill bars on scroll into view
const skillFills = document.querySelectorAll(".skill-fill");
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            el.style.width = el.getAttribute("data-width");
            observer.unobserve(el);
        }
    });
}, { threshold: 0.3 });

skillFills.forEach(el => {
    const w = el.style.width;
    el.setAttribute("data-width", w);
    el.style.width = "0";
    observer.observe(el);
});

// Copy email to clipboard
function copyEmail() {
    navigator.clipboard.writeText("linggamilan73@gmail.com").then(() => {
        const btn = document.querySelector(".social-copy");
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        btn.classList.add("copied");
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove("copied");
        }, 2000);
    });
}

// Drag to scroll cert slider
const slider = document.querySelector(".cert-slider");
const track = document.querySelector(".cert-track");
let isDown = false, startX, scrollLeft;

slider.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});
slider.addEventListener("mouseleave", () => isDown = false);
slider.addEventListener("mouseup", () => isDown = false);
slider.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
});

// Touch support
slider.addEventListener("touchstart", e => {
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});
slider.addEventListener("touchmove", e => {
    const x = e.touches[0].pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
});
