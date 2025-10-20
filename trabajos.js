// Seleccionamos los elementos principales
const proyectos = document.querySelectorAll('.lista-proyectos li');
const previewImg = document.getElementById('preview');
const descripcionTexto = document.getElementById('descripcion-texto');
const imagenProyecto = document.querySelector('.imagen-proyecto'); // 👈 nuevo
const btnVerProyecto = document.getElementById('btn-ver-proyecto'); // 👈 nuevo

proyectos.forEach((item) => {
  item.addEventListener('click', () => {
    // Quitar la clase activa del anterior
    proyectos.forEach(p => p.classList.remove('activo'));

    // Agregar clase activa al seleccionado
    item.classList.add('activo');

    // Tomar datos del elemento clickeado
    const nuevaImg = item.getAttribute('data-img');
    const nuevaDesc = item.getAttribute('data-desc');
    const nuevoLink = item.getAttribute('data-link'); // opcional si usas links dinámicos

    // 🔹 Animación de fade suave (imagen + texto + botón)
    imagenProyecto.classList.add('cambiando');
    previewImg.style.opacity = 0;
    descripcionTexto.style.opacity = 0;
    btnVerProyecto.style.opacity = 0;

    setTimeout(() => {
      // Cambiar imagen y descripción
      previewImg.src = nuevaImg;
      descripcionTexto.textContent = nuevaDesc;
      if (nuevoLink) btnVerProyecto.href = nuevoLink; // 👈 actualiza link si existe

      // Mostrar de nuevo con efecto
      imagenProyecto.classList.remove('cambiando');
      previewImg.style.opacity = 1;
      descripcionTexto.style.opacity = 1;
      btnVerProyecto.style.opacity = 1;
    }, 400); // Tiempo del fade-out antes del cambio
  });
});
