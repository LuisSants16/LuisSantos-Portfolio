document.addEventListener("DOMContentLoaded", () => {
  const activarSerie = document.getElementById("activarSerie");
  const serieCampo = document.getElementById("serieCampo");
  const formulario = document.getElementById("formularioNuevo");

  activarSerie.addEventListener("change", () => {
    // Ya no mostramos el input de serie, solo dejamos marcado internamente si lo requiere
    serieCampo.style.display = "none";
  });

  cargarRegistros();

  document
    .getElementById("buscador")
    .addEventListener("input", cargarRegistros);

  document.querySelectorAll(".filtros button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filtros button")
        .forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      cargarRegistros();
    });
  });

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const sku = document.getElementById("sku").value.trim().toUpperCase();
    const descripcion = document.getElementById("descripcion").value.trim();
    const requiereSerie = activarSerie.checked;
    const marca = document.getElementById("marca").value.trim();
    const fecha = new Date().toISOString().split("T")[0];

    if (!sku || !descripcion || !marca) {
      alert("Completa todos los campos requeridos.");
      return;
    }

    const nuevo = {
      sku,
      descripcion,
      requiereSerie,
      marca,
      fecha,
      stock: 0,
      serie: "",
    };
    const creados = JSON.parse(localStorage.getItem("repuestos_creados")) || [];

    creados.push(nuevo);
    localStorage.setItem("repuestos_creados", JSON.stringify(creados));

    formulario.reset();
    activarSerie.checked = false;
    serieCampo.style.display = "none";
    cargarRegistros();
  });
});

// FUNCIÓN GLOBAL
function cargarRegistros() {
  const desdeInventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const desdeCreados =
    JSON.parse(localStorage.getItem("repuestos_creados")) || [];

  const map = new Map();

  [...desdeInventario, ...desdeCreados].forEach((item) => {
    const sku = (item.sku || "").trim().toUpperCase();
    map.set(sku, {
      sku,
      descripcion: item.descripcion || item.Producto || "",
      serie: item.serie || "",
      marca: item.marca || item.categoria || item.Marca || "",
      fecha: item.fecha || new Date().toISOString().split("T")[0],
    });
  });

  const filtroActivo =
    document.querySelector(".filtros .activo")?.dataset.filtro || "todos";
  const textoBusqueda = document
    .getElementById("buscador")
    .value.trim()
    .toLowerCase();

  const lista = Array.from(map.values()).filter((item) => {
    const coincideBusqueda = Object.values(item).some((v) =>
      (v || "").toLowerCase().includes(textoBusqueda)
    );

    if (filtroActivo === "conSerie" && !item.requiereSerie) return false;
    if (filtroActivo === "sinSerie" && item.requiereSerie) return false;

    return coincideBusqueda;
  });

  const totalTodos = map.size;
  const totalConSerie = Array.from(map.values()).filter(
    (i) => i.requiereSerie
  ).length;
  const totalSinSerie = totalTodos - totalConSerie;

  document.getElementById("totalTodos").textContent = totalTodos;
  document.getElementById("totalConSerie").textContent = totalConSerie;
  document.getElementById("totalSinSerie").textContent = totalSinSerie;

  const tablaBody = document.querySelector("#tablaRegistros tbody");
  tablaBody.innerHTML = "";

  lista.forEach((item) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.descripcion}</td>
      <td>${item.serie || ""}</td>
      <td>${item.marca}</td>
      <td>${item.fecha}</td>
      <td class="acciones">
        <button class="btn-editar" data-sku="${item.sku}">✏️</button>
        <button class="btn-borrar" data-sku="${item.sku}">🗑️</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });
}

const tablaBody = document.querySelector("#tablaRegistros tbody");

tablaBody.addEventListener("click", (e) => {
  const editar = e.target.closest(".btn-editar");
  const borrar = e.target.closest(".btn-borrar");

  if (editar) {
    const skuEditar = editar.dataset.sku;
    if (!skuEditar) return;

    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    let creados = JSON.parse(localStorage.getItem("repuestos_creados")) || [];

    let index = inventario.findIndex((p) => p.sku === skuEditar);
    if (index !== -1) {
      const producto = inventario[index];
      const nuevoSKU = prompt("Editar SKU:", producto.sku) || producto.sku;
      const nuevaDesc =
        prompt("Editar descripción:", producto.descripcion) ||
        producto.descripcion;
      const nuevaMarca =
        prompt("Editar marca:", producto.marca || producto.categoria) ||
        producto.marca;
      const nuevaUM =
        prompt("Editar unidad de medida:", producto.unidad || "") ||
        producto.unidad ||
        "";

      inventario[index] = {
        ...producto,
        sku: nuevoSKU,
        descripcion: nuevaDesc,
        marca: nuevaMarca,
        unidad: nuevaUM,
      };

      localStorage.setItem("inventario", JSON.stringify(inventario));
    } else {
      index = creados.findIndex((p) => p.sku === skuEditar);
      if (index === -1) return;

      const producto = creados[index];
      const nuevoSKU = prompt("Editar SKU:", producto.sku) || producto.sku;
      const nuevaDesc =
        prompt("Editar descripción:", producto.descripcion) ||
        producto.descripcion;
      const nuevaMarca =
        prompt("Editar marca:", producto.marca || producto.categoria) ||
        producto.marca;
      const nuevaUM =
        prompt("Editar unidad de medida:", producto.unidad || "") ||
        producto.unidad ||
        "";

      creados[index] = {
        ...producto,
        sku: nuevoSKU,
        descripcion: nuevaDesc,
        marca: nuevaMarca,
        unidad: nuevaUM,
      };

      localStorage.setItem("repuestos_creados", JSON.stringify(creados));
    }

    cargarRegistros();
  }

  if (borrar) {
    const skuBorrar = borrar.dataset.sku;
    if (!skuBorrar || !confirm("¿Estás seguro de eliminar este código?"))
      return;

    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    let creados = JSON.parse(localStorage.getItem("repuestos_creados")) || [];

    inventario = inventario.filter((p) => p.sku !== skuBorrar);
    creados = creados.filter((p) => p.sku !== skuBorrar);

    localStorage.setItem("inventario", JSON.stringify(inventario));
    localStorage.setItem("repuestos_creados", JSON.stringify(creados));

    cargarRegistros();
  }
});

function renderizarCodigos() {
  const tbody = document.querySelector("#tablaRegistros tbody");
  const registros = JSON.parse(localStorage.getItem("inventario")) || [];

  tbody.innerHTML = "";

  registros.forEach((item, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.descripcion}</td>
      <td>${item.serie ? item.serie : ""}</td>
      <td>${item.marca}</td>
      <td>${item.fecha}</td>
      <td>
        <button class="btn-editar" data-index="${index}">✏️</button>
        <button class="btn-eliminar" data-index="${index}">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  // Activar DataTables
  if ($.fn.DataTable.isDataTable("#tablaRegistros")) {
    $("#tablaRegistros").DataTable().destroy();
  }

  $("#tablaRegistros").DataTable({
    paging: true,
    searching: true,
    ordering: true,
    pageLength: 10,
    language: {
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ registros",
      zeroRecords: "No se encontraron resultados",
      paginate: {
        previous: "Anterior",
        next: "Siguiente",
      },
    },
    columnDefs: [
      { orderable: false, targets: -1 }
    ]
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCodigos();
});
