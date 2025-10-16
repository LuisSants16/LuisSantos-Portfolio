// === MENÚ HAMBURGUESA ===
const menuIcon = document.getElementById('menuIcon');
const sideMenu = document.getElementById('sideMenu');
const closeIcons = document.querySelectorAll('.close-icon'); // incluye la del header y la del overlay

function openMenu() {
  menuIcon.classList.add('active');
  sideMenu.classList.add('active');
  document.body.classList.add('no-scroll', 'menu-open');
}

function closeMenu() {
  // Oculta la X instantáneamente
  const closeBtn = sideMenu.querySelector('.close-icon');
  if (closeBtn) closeBtn.style.display = 'none';

  // Cierra el menú visualmente
  menuIcon.classList.remove('active');
  sideMenu.classList.remove('active');
  document.body.classList.remove('no-scroll', 'menu-open');
}

// 📱 Click en el icono del header (abre/cierra)
menuIcon.addEventListener('click', () => {
  if (sideMenu.classList.contains('active')) closeMenu();
  else openMenu();
});

// 🖥️ Click en cualquier "X" (tanto la del header como la del overlay)
closeIcons.forEach(icon => {
  icon.addEventListener('click', closeMenu);
});

// 🔒 Permitir cerrar con la tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
    closeMenu();
  }
});


// === POPUPS POR CATEGORÍA ===
const toolCards = document.querySelectorAll('.tool-card');
const popups = document.querySelectorAll('.popup-overlay');
const closeButtons = document.querySelectorAll('.close-popup');

// Abrir el popup correcto
toolCards.forEach(card => {
  card.addEventListener('click', () => {
    const popupId = card.getAttribute('data-popup');
    document.getElementById(popupId).classList.add('active');
    document.body.style.overflow = "hidden"; // 🚫 Deshabilita scroll al abrir
  });
});

// Cerrar popups (botón X)
closeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.popup-overlay').classList.remove('active');
    document.body.style.overflow = "auto"; // ✅ Restaura scroll
  });
});

// Cerrar al hacer clic fuera del contenido
popups.forEach(popup => {
  popup.addEventListener('click', e => {
    if (e.target === popup) {
      popup.classList.remove('active');
      document.body.style.overflow = "auto"; // ✅ Restaura scroll
    }
  });
});

// Cerrar popups con tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    popups.forEach(popup => popup.classList.remove('active'));
    document.body.style.overflow = "auto";
  }
});

// ===== SHOWROOM =====
const projects = [
  {
    title: "Phonebook App",
    desc: "Aplicación para registrar, buscar , editar y eliminar contactos con una interfaz moderna e intuitiva.",
    img: "img/showroom1.jpg",
    visit: "https://ejemplo-phonebook.com",
    github: "https://github.com/luissant16/phonebook"
  },
  {
    title: "Company Calendar",
    desc: "Calendario empresarial para gestionar reuniones y fechas legales importantes.",
    img: "img/showroom2.jpg",
    visit: "https://ejemplo-calendar.com",
    github: "https://github.com/luissant16/calendar"
  }
];

let currentIndex = 0;

const projectImage = document.getElementById("projectImage");
const projectTitle = document.getElementById("projectTitle");
const projectDesc = document.getElementById("projectDesc");
const showroomBg = document.getElementById("showroomBg");
const visitLink = document.getElementById("visitLink");
const githubLink = document.getElementById("githubLink");

// === FUNCIÓN PRINCIPAL ===
function updateShowroom() {
  const p = projects[currentIndex];
  projectImage.src = p.img;
  projectTitle.textContent = p.title;
  projectDesc.textContent = p.desc;
  showroomBg.style.backgroundImage = `url(${p.img})`;

  // 🔗 Actualizar enlaces
  visitLink.href = p.visit;
  githubLink.href = p.github;
}

// === EVENTOS ===

// Click en la imagen → abre el proyecto
projectImage.addEventListener("click", () => {
  window.open(projects[currentIndex].visit, "_blank");
});

// Flecha izquierda
document.getElementById("prevProject").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + projects.length) % projects.length;
  updateShowroom();
});

// Flecha derecha
document.getElementById("nextProject").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % projects.length;
  updateShowroom();
});

// Inicializar showroom al cargar
updateShowroom();


function updateShowroom() {
  const p = projects[currentIndex];
  const card = document.querySelector(".showroom-card");

  // 🔹 efecto de desvanecimiento
  card.classList.add("fade");

  setTimeout(() => {
    projectImage.src = p.img;
    projectTitle.textContent = p.title;
    projectDesc.textContent = p.desc;
    showroomBg.style.backgroundImage = `url(${p.img})`;
    visitLink.href = p.visit;
    githubLink.href = p.github;

    card.classList.remove("fade");
  }, 300); // duración del fade-out
}
