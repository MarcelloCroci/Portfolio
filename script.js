////////////////////////////////////////////////////////////////// PARALLAX IMAGE
const parallaxImage = document.getElementById("parallax-image");
const container = parallaxImage.parentElement;

// Fattori di intensità dell'effetto
const ROTATION_FACTOR = 0.03;
const TRANSLATION_FACTOR = 0.015;
const SCALE_FACTOR = 1.05;
const MAX_ROTATION = 12;
const LERP_FACTOR = 0.1; // Fattore di interpolazione per smoothing

let isHovering = false;
let animationFrame = null;
let currentTransform = {
  rotateX: 0,
  rotateY: 0,
  translateX: 0,
  translateY: 0,
  scale: 1,
};
let targetTransform = {
  rotateX: 0,
  rotateY: 0,
  translateX: 0,
  translateY: 0,
  scale: 1,
};

// Funzione di interpolazione lineare
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Funzione per applicare le trasformazioni
function applyTransform(
  rotateX = 0,
  rotateY = 0,
  translateX = 0,
  translateY = 0,
  scale = 1
) {
  const transform = `perspective(1000px) rotateX(${rotateX.toFixed(
    2
  )}deg) rotateY(${rotateY.toFixed(2)}deg) translateX(${translateX.toFixed(
    2
  )}px) translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
  parallaxImage.style.transform = transform;
}

// Funzione di animazione continua per smoothing
function animate() {
  if (isHovering) {
    // Interpola verso i valori target
    currentTransform.rotateX = lerp(
      currentTransform.rotateX,
      targetTransform.rotateX,
      LERP_FACTOR
    );
    currentTransform.rotateY = lerp(
      currentTransform.rotateY,
      targetTransform.rotateY,
      LERP_FACTOR
    );
    currentTransform.translateX = lerp(
      currentTransform.translateX,
      targetTransform.translateX,
      LERP_FACTOR
    );
    currentTransform.translateY = lerp(
      currentTransform.translateY,
      targetTransform.translateY,
      LERP_FACTOR
    );
    currentTransform.scale = lerp(
      currentTransform.scale,
      targetTransform.scale,
      LERP_FACTOR
    );

    applyTransform(
      currentTransform.rotateX,
      currentTransform.rotateY,
      currentTransform.translateX,
      currentTransform.translateY,
      currentTransform.scale
    );
  }

  animationFrame = requestAnimationFrame(animate);
}

// Avvia il loop di animazione
animate();

// Event listener per il movimento del mouse (con throttling)
let lastMouseUpdate = 0;
container.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastMouseUpdate < 16) return; // ~60fps max
  lastMouseUpdate = now;

  const rect = parallaxImage.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Calcola la distanza del mouse dal centro
  const deltaX = e.clientX - centerX;
  const deltaY = e.clientY - centerY;

  // Normalizza i valori rispetto alle dimensioni dell'immagine
  const normalizedX = deltaX / (rect.width / 2);
  const normalizedY = deltaY / (rect.height / 2);

  // Calcola le rotazioni (invertite per effetto naturale)
  const rotateY = Math.max(
    -MAX_ROTATION,
    Math.min(MAX_ROTATION, normalizedX * MAX_ROTATION)
  );
  const rotateX = Math.max(
    -MAX_ROTATION,
    Math.min(MAX_ROTATION, -normalizedY * MAX_ROTATION)
  );

  // Calcola le traslazioni
  const translateX = deltaX * TRANSLATION_FACTOR;
  const translateY = deltaY * TRANSLATION_FACTOR;

  // Aggiorna i valori target invece di applicare direttamente
  targetTransform.rotateX = rotateX;
  targetTransform.rotateY = rotateY;
  targetTransform.translateX = translateX;
  targetTransform.translateY = translateY;
  targetTransform.scale = SCALE_FACTOR;
});

// Event listener per mouse enter
container.addEventListener("mouseenter", () => {
  isHovering = true;
  parallaxImage.classList.remove("animate-float");
  parallaxImage.classList.add("shadow-2xl");
});

// Event listener per mouse leave
container.addEventListener("mouseleave", () => {
  isHovering = false;

  // Resetta i valori target
  targetTransform = {
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    translateY: 0,
    scale: 1,
  };

  // Animazione di ritorno più fluida
  const resetAnimation = () => {
    currentTransform.rotateX = lerp(currentTransform.rotateX, 0, 0.15);
    currentTransform.rotateY = lerp(currentTransform.rotateY, 0, 0.15);
    currentTransform.translateX = lerp(currentTransform.translateX, 0, 0.15);
    currentTransform.translateY = lerp(currentTransform.translateY, 0, 0.15);
    currentTransform.scale = lerp(currentTransform.scale, 1, 0.15);

    applyTransform(
      currentTransform.rotateX,
      currentTransform.rotateY,
      currentTransform.translateX,
      currentTransform.translateY,
      currentTransform.scale
    );

    // Continua fino a quando non è abbastanza vicino a zero
    if (
      Math.abs(currentTransform.rotateX) > 0.1 ||
      Math.abs(currentTransform.rotateY) > 0.1 ||
      Math.abs(currentTransform.translateX) > 0.1 ||
      Math.abs(currentTransform.translateY) > 0.1 ||
      Math.abs(currentTransform.scale - 1) > 0.01
    ) {
      requestAnimationFrame(resetAnimation);
    } else {
      // Reset finale preciso
      currentTransform = {
        rotateX: 0,
        rotateY: 0,
        translateX: 0,
        translateY: 0,
        scale: 1,
      };
      applyTransform(0, 0, 0, 0, 1);

      // Riattiva l'animazione idle
      setTimeout(() => {
        if (!isHovering) {
          parallaxImage.classList.add("animate-float");
        }
      }, 100);
    }
  };

  resetAnimation();
});

// Animazione di entrata
window.addEventListener("load", () => {
  // Nasconde l'immagine inizialmente
  parallaxImage.style.opacity = "0";
  parallaxImage.style.transform = "translateY(30px) scale(0.95)";

  // Anima l'entrata
  setTimeout(() => {
    parallaxImage.style.transition =
      "opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    parallaxImage.style.opacity = "1";
    parallaxImage.style.transform = "translateY(0px) scale(1)";

    // Aggiunge l'animazione idle dopo l'entrata
    setTimeout(() => {
      parallaxImage.style.transition = "all 0.1s ease-out";
      parallaxImage.classList.add("animate-float");
    }, 800);
  }, 100);
});

// Gestione del ridimensionamento della finestra
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (!isHovering) {
      applyTransform(0, 0, 0, 0, 1);
    }
  }, 100);
});

// Ottimizzazione per dispositivi touch
if ("ontouchstart" in window) {
  container.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    container.dispatchEvent(mouseEvent);
  });

  container.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    container.dispatchEvent(mouseEvent);
  });

  container.addEventListener("touchend", () => {
    container.dispatchEvent(new MouseEvent("mouseleave"));
  });
}

//////////////////////////////////////////////////////////////////// EMAILJS

// 1) Inizializza EmailJS con il tuo public key (user ID)
emailjs.init("9cPYeOjOwADUAgONr");

// 2) Seleziona il form e metti il listener sul vero evento "submit"
const form = document.getElementById("contact-form");
form.addEventListener("submit", function (e) {
  e.preventDefault(); // blocca il reload
  // 3) Manda il form con service e template corretti
  emailjs
    .sendForm("service_eldai5h", "template_w6s8tqs", this)
    .then(() => {
      alert("✅ Messaggio inviato con successo!");
      form.reset();
    })
    .catch((err) => {
      console.error("EmailJS error:", err);
      alert("❌ Errore nell'invio. Riprova più tardi.");
    });
});

/////////////////////////////////////////////////////////////////// FORM HANDLER, MODAL & PROJECTS
const projects = {
  phelsuma: {
    title: "Phelsuma Vibes",
    img: "https://i.ibb.co/8DTfsycB/phelsuma-vibes.png",
    desc: "Phelsuma Vibes è un sito web che cerca di diffondere la conoscenza di una specie di rettile esotica. Infatti fornisce dettagli utili su i gechi Phelsuma del Madagascar, con la possibilità di contattare un allevatore certificato per entrarne in possesso o chiedere informazioni.",
    tags: ["HTML", "JavaScript", "CSS", "Progetto Personale"],
    view: "https://phelsuma-vibes.netlify.app",
    code: "#",
  },
  pack2go: {
    title: "Pack2Go",
    img: "https://i.ibb.co/5WJ8sqkR/pack2go.png",
    desc: "Pack2Go è una piattaforma web che connette il pubblico a una rete nazionale di centri multimediali. Grazie a un catalogo completo di risorse hardware e software, gli utenti possono ricercare, prenotare e prendere in prestito ciò di cui hanno bisogno in pochi clic.",
    tags: [
      "HTML",
      "JavaScript",
      "TailwindCSS",
      "NodeJS",
      "Progetto Scolastico",
    ],
    view: "https://pack2go.onrender.com",
    code: "https://github.com/MarcelloCroci/Progettone-Multimediale",
  },
  bibliosauro: {
    title: "Bibliosauro",
    img: "https://i.ibb.co/BHh7WJKv/bibliosauro.png",
    desc: "Bibliosauro è una web app progettata per gestire le attività di una biblioteca. Il suo obbiettivo è semplificare il più possibile il lavoro di un librario, rendendo tracciabili i prestiti dei libri.",
    tags: ["HTML", "JavaScript", "CSS", "NodeJS", "Progetto Scolastico"],
    view: "https://bibliosauro.onrender.com",
    code: "https://github.com/MarcelloCroci/Bibliosauro",
  },
  pixel: {
    title: "PixelCraft",
    img: "https://i.ibb.co/DPdFzhYq/Progetto-senza-titolo.png",
    desc: "PixelCraft è un sito che mostra lo sviluppo della pixel art, dalla sua nascita per necessità all'utilizzo odierno per avere uno stile retro.",
    tags: ["HTML", "JavaScript", "CSS", "Progetto Personale"],
    view: "https://marcellocroci.github.io/PixelCraft/",
    code: "https://github.com/MarcelloCroci/PixelCraft",
  },
};

document.querySelectorAll("[data-project]").forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.project;
    const p = projects[key];
    document.getElementById("modalImg").src = p.img;
    document.getElementById("modalTitle").textContent = p.title;
    document.getElementById("modalDesc").textContent = p.desc;
    const tagContainer = document.getElementById("modalTags");
    tagContainer.innerHTML = "";
    p.tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "text-xs border border-neutral-600 rounded px-2 py-1";
      span.textContent = t;
      tagContainer.append(span);
    });

    document.getElementById("modalView").href = p.view;
    document.getElementById("modalCode").href = p.code;

    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("modal").classList.add("flex");
  });
});

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("modal").classList.remove("flex");
}

document.getElementById("modalClose").addEventListener("click", () => {
  closeModal();
});

window.onclick = function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
};
