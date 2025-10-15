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

  // cierra el menú visualmente
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

// ==== POPUP DE 3 PROYECTOS ====
const toolCards = document.querySelectorAll('.tool-card');
const popupOverlay = document.getElementById('popupOverlay');
const closePopup = document.querySelector('.close-popup');

// Mostrar el popup al hacer clic en cualquier tarjeta
toolCards.forEach(card => {
  card.addEventListener('click', () => {
    popupOverlay.classList.add('active');
  });
});

// Cerrar al hacer clic en la X o fuera del popup
closePopup.addEventListener('click', () => popupOverlay.classList.remove('active'));
popupOverlay.addEventListener('click', e => {
  if (e.target === popupOverlay) popupOverlay.classList.remove('active');
});
