// Seleccionamos los elementos principales
const proyectos = document.querySelectorAll('.lista-proyectos li');
const previewImg = document.getElementById('preview');
const descripcionTexto = document.getElementById('descripcion-texto');

proyectos.forEach((item) => {
  item.addEventListener('click', () => {
    // Quitar la clase activa del anterior
    proyectos.forEach(p => p.classList.remove('activo'));

    // Agregar clase activa al seleccionado
    item.classList.add('activo');

    // Tomar datos del elemento clickeado
    const nuevaImg = item.getAttribute('data-img');
    const nuevaDesc = item.getAttribute('data-desc');

    // Animación de fade suave
    previewImg.style.opacity = 0;
    descripcionTexto.style.opacity = 0;

    setTimeout(() => {
      // Cambiar imagen y descripción
      previewImg.src = nuevaImg;
      descripcionTexto.textContent = nuevaDesc;

      // Mostrar de nuevo con efecto
      previewImg.style.opacity = 1;
      descripcionTexto.style.opacity = 1;
    }, 400); // Tiempo del fade-out antes del cambio
  });
});
