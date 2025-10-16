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
