// === MENÚ HAMBURGUESA ===
const menuIcon = document.getElementById("menuIcon");
const sideMenu = document.getElementById("sideMenu");
const closeIcons = document.querySelectorAll(".close-icon"); // incluye la del header y la del overlay

function openMenu() {
  menuIcon.classList.add("active");
  sideMenu.classList.add("active");
  document.body.classList.add("no-scroll", "menu-open");
}

function closeMenu() {
  // Oculta la X instantáneamente
  const closeBtn = sideMenu.querySelector(".close-icon");
  if (closeBtn) closeBtn.style.display = "none";

  // Cierra el menú visualmente
  menuIcon.classList.remove("active");
  sideMenu.classList.remove("active");
  document.body.classList.remove("no-scroll", "menu-open");
}

// 📱 Click en el icono del header (abre/cierra)
menuIcon.addEventListener("click", () => {
  if (sideMenu.classList.contains("active")) closeMenu();
  else openMenu();
});

// 🖥️ Click en cualquier "X" (tanto la del header como la del overlay)
closeIcons.forEach((icon) => {
  icon.addEventListener("click", closeMenu);
});

// 🔒 Permitir cerrar con la tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sideMenu.classList.contains("active")) {
    closeMenu();
  }
});

// === POPUPS POR CATEGORÍA ===
const toolCards = document.querySelectorAll(".tool-card");
const popups = document.querySelectorAll(".popup-overlay");
const closeButtons = document.querySelectorAll(".close-popup");

// Abrir el popup correcto
toolCards.forEach((card) => {
  card.addEventListener("click", () => {
    const popupId = card.getAttribute("data-popup");
    document.getElementById(popupId).classList.add("active");
    document.body.style.overflow = "hidden"; // 🚫 Deshabilita scroll al abrir
  });
});

// Cerrar popups (botón X)
closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".popup-overlay").classList.remove("active");
    document.body.style.overflow = "auto"; // ✅ Restaura scroll
  });
});

// Cerrar al hacer clic fuera del contenido
popups.forEach((popup) => {
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active");
      document.body.style.overflow = "auto"; // ✅ Restaura scroll
    }
  });
});

// Cerrar popups con tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    popups.forEach((popup) => popup.classList.remove("active"));
    document.body.style.overflow = "auto";
  }
});

// ===== SHOWROOM =====
const projects = [
  {
    title: "Proyecto MASCH",
    desc: "Sitio web profesional desarrollado para Miguel Ángel Santos Chinchón, especialista en acabados de construcción.",
    img: "img/showroom1.png",
    visit: "https://luissants16.github.io/Masch/",
    github: "https://github.com/LuisSants16/Masch",
  },
  {
    title: "Proyecto Control de Gastos Diario",
    desc: "App web para registrar y organizar tus gastos diarios con diseño moderno.",
    img: "img/showroom2.png",
    visit: "https://luissants16.github.io/ControlGastos/",
    github: "https://github.com/LuisSants16/ControlGastos",
  },
];

let currentIndex = 0;
let autoSlideInterval;
let startX = 0;
let endX = 0;

const projectImage = document.getElementById("projectImage");
const projectTitle = document.getElementById("projectTitle");
const projectDesc = document.getElementById("projectDesc");
const showroomBg = document.getElementById("showroomBg");
const visitLink = document.getElementById("visitLink");
const githubLink = document.getElementById("githubLink");
const card = document.querySelector(".showroom-card");
const showroom = document.querySelector(".showroom");

// === FUNCIÓN PRINCIPAL ===
function updateShowroom() {
  const p = projects[currentIndex];
  card.classList.add("fade");
  setTimeout(() => {
    projectImage.src = p.img;
    projectTitle.textContent = p.title;
    projectDesc.textContent = p.desc;
    showroomBg.style.backgroundImage = `url(${p.img})`;
    visitLink.href = p.visit;
    githubLink.href = p.github;
    card.classList.remove("fade");
  }, 300);
}

// === FLECHAS (solo PC) ===
const prevBtn = document.getElementById("prevProject");
const nextBtn = document.getElementById("nextProject");

if (prevBtn && nextBtn) {
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + projects.length) % projects.length;
    updateShowroom();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % projects.length;
    updateShowroom();
  });
}

// === AUTOPLAY EN MÓVIL ===
function startAutoSlide() {
  stopAutoSlide();
  if (window.innerWidth <= 768) {
    autoSlideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % projects.length;
      updateShowroom();
    }, 4000);
  }
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

window.addEventListener("resize", startAutoSlide);

// === SWIPE CON EL DEDO ===
showroom.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  stopAutoSlide(); // Pausar autoplay al tocar
});

showroom.addEventListener("touchend", (e) => {
  endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      currentIndex = (currentIndex + 1) % projects.length;
    } else {
      currentIndex = (currentIndex - 1 + projects.length) % projects.length;
    }
    updateShowroom();
  }

  // Reanudar autoplay después de soltar
  startAutoSlide();
});

// === PAUSAR AUTOPLAY AL MANTENER EL DEDO (TOUCH HOLD) ===
showroom.addEventListener("touchmove", stopAutoSlide);

// === CLICK EN IMAGEN → abrir proyecto ===
projectImage.addEventListener("click", () => {
  window.open(projects[currentIndex].visit, "_blank");
});

// === INICIALIZAR ===
updateShowroom();
startAutoSlide();

