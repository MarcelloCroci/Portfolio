// Seleziono il canvas e imposto dimensioni
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
resize();
window.addEventListener('resize', resize);

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

// --- PARTICLES BACKGROUND --- 
const particles = [];
const count = 100;
for (let i = 0; i < count; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 1
  });
}

// Loop di animazione
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // disegno particelle
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();
