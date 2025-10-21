const proyectos = document.querySelectorAll(".proyecto");

window.addEventListener("scroll", () => {
  proyectos.forEach(proyecto => {
    const top = proyecto.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      proyecto.classList.add("visible");
    }
  });
});
