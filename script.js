
const menuIcon = document.getElementById('menuIcon');
const sideMenu = document.getElementById('sideMenu');

menuIcon.addEventListener('click', () => {
  menuIcon.classList.toggle('active');
  sideMenu.classList.toggle('active');
  document.body.classList.toggle('no-scroll'); // evita scroll del fondo
});
