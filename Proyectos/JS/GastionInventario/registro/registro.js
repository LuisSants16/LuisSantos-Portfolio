// Obtener datos desde localStorage o usar arreglo vacío
function obtenerDatosLocalStorage(clave) {
  const datos = localStorage.getItem(clave);
  if (!datos) return [];
  try {
    return JSON.parse(datos);
  } catch {
    return [];
  }
}

// Elementos DOM (igual que antes)
const tabEntradas = document.getElementById("tabEntradas");
const tabSalidas = document.getElementById("tabSalidas");
const contenidoEntradas = document.getElementById("entradas");
const contenidoSalidas = document.getElementById("salidas");

const fechaInicioEntradas = document.getElementById("fechaInicioEntradas");
const fechaFinEntradas = document.getElementById("fechaFinEntradas");
const buscadorEntradas = document.getElementById("buscadorEntradas");

const fechaInicioSalidas = document.getElementById("fechaInicioSalidas");
const fechaFinSalidas = document.getElementById("fechaFinSalidas");
const buscadorSalidas = document.getElementById("buscadorSalidas");

const tablaEntradasBody = document.querySelector("#tablaEntradas tbody");
const tablaSalidasBody = document.querySelector("#tablaSalidas tbody");

// Cargar datos desde localStorage
function cargarDatos() {
  return {
    entradas: obtenerDatosLocalStorage("entradas"),
    salidas: obtenerDatosLocalStorage("salidas"),
  };
}

// Función para mostrar tabla con datos filtrados
function mostrarDatos(tablaBody, datos, filtro) {
  tablaBody.innerHTML = "";

  const datosFiltrados = datos.filter((item) => {
    const fechaItem = new Date(item.fecha);
    if (filtro.fechaInicio && fechaItem < new Date(filtro.fechaInicio))
      return false;
    if (filtro.fechaFin && fechaItem > new Date(filtro.fechaFin)) return false;

    const textoFiltro = filtro.texto.toLowerCase().trim();

    if (
      textoFiltro &&
      !item.sku.toLowerCase().includes(textoFiltro) &&
      !item.descripcion.toLowerCase().includes(textoFiltro)
    ) {
      return false;
    }
  });

  if (datosFiltrados.length === 0) {
    tablaBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;">No hay registros que coincidan con el filtro.</td></tr>';
    return;
  }

  datosFiltrados.forEach((item) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.descripcion}</td>
      <td>${item.serie || ""}</td>
      <td>${item.cantidad}</td>
      <td>${item.fecha}</td>
      <td>${item.responsable || ""}</td>
    `;
    tablaBody.appendChild(fila);
  });
}

// Variables globales para datos actuales
let datosEntradas = [];
let datosSalidas = [];

// Manejo cambio pestañas
tabEntradas.addEventListener("click", () => {
  tabEntradas.classList.add("active");
  tabSalidas.classList.remove("active");
  contenidoEntradas.classList.add("active");
  contenidoSalidas.classList.remove("active");
  aplicarFiltrosEntradas();
});

tabSalidas.addEventListener("click", () => {
  tabSalidas.classList.add("active");
  tabEntradas.classList.remove("active");
  contenidoSalidas.classList.add("active");
  contenidoEntradas.classList.remove("active");
  aplicarFiltrosSalidas();
});

// Aplicar filtros y mostrar tabla entradas
function aplicarFiltrosEntradas() {
  mostrarDatos(tablaEntradasBody, datosEntradas, {
    fechaInicio: fechaInicioEntradas.value,
    fechaFin: fechaFinEntradas.value,
    texto: buscadorEntradas.value.trim(),
  });
}

// Aplicar filtros y mostrar tabla salidas
function aplicarFiltrosSalidas() {
  mostrarDatos(tablaSalidasBody, datosSalidas, {
    fechaInicio: fechaInicioSalidas.value,
    fechaFin: fechaFinSalidas.value,
    texto: buscadorSalidas.value.trim(),
  });
}

// Eventos para filtros entradas
fechaInicioEntradas.addEventListener("change", aplicarFiltrosEntradas);
fechaFinEntradas.addEventListener("change", aplicarFiltrosEntradas);
buscadorEntradas.addEventListener("input", aplicarFiltrosEntradas);

// Eventos para filtros salidas
fechaInicioSalidas.addEventListener("change", aplicarFiltrosSalidas);
fechaFinSalidas.addEventListener("change", aplicarFiltrosSalidas);
buscadorSalidas.addEventListener("input", aplicarFiltrosSalidas);

// Cargar datos y mostrar entradas inicialmente
document.addEventListener("DOMContentLoaded", () => {
  const datos = cargarDatos();
  datosEntradas = datos.entradas;
  datosSalidas = datos.salidas;
  aplicarFiltrosEntradas();
});
