document.addEventListener("DOMContentLoaded", () => {
  cargarInventario();
});

const tablaBody = document.querySelector("#tablaProductos tbody");

function cargarInventario() {
  const datos = JSON.parse(localStorage.getItem("inventario")) || [];

  tablaBody.innerHTML = "";

  datos.forEach((producto) => {
    const colorAlerta = obtenerColorAlerta(producto.stock);

    const fila = document.createElement("tr");
    fila.innerHTML = `
    <td>${producto.sku}</td>
    <td>${producto.descripcion}</td>
    <td>${producto.marca || ""}</td>
    <td>${producto.serie || ""}</td>
    <td>
      <span class="alerta-stock ${colorAlerta}"></span>
      ${producto.stock}
    </td>
    <td>${producto.fecha}</td>
  `;
    tablaBody.appendChild(fila);
  });
}

function guardarInventario() {
  const filas = document.querySelectorAll("#tablaProductos tbody tr");
  const productos = [];

  filas.forEach((fila) => {
    const celdas = fila.querySelectorAll("td");
    productos.push({
      sku: celdas[0].textContent,
      descripcion: celdas[1].textContent,
      marca: celdas[2].textContent,
      serie: celdas[3].textContent,
      stock: celdas[4].textContent,
      fecha: celdas[5].textContent,
    });
  });

  localStorage.setItem("inventario", JSON.stringify(productos));
}

document.getElementById("inputExcel").addEventListener("change", function (e) {
  const archivo = e.target.files[0];
  const lector = new FileReader();

  lector.onload = function (event) {
    const datos = new Uint8Array(event.target.result);
    const workbook = XLSX.read(datos, { type: "array" });
    const hojaNombre = workbook.SheetNames[0];
    const hoja = workbook.Sheets[hojaNombre];
    const productos = XLSX.utils.sheet_to_json(hoja);

    const inventarioExistente =
      JSON.parse(localStorage.getItem("inventario")) || [];
    const inventarioMap = new Map();

    // Normalizar inventario existente
    inventarioExistente.forEach((item) => {
      const sku = (item["sku"] || "")
        .toString()
        .normalize("NFKD")
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9_#\-]/g, "")
        .toUpperCase();
      inventarioMap.set(sku, {
        ...item,
        sku,
      });
    });

    // Procesar nuevos productos del Excel
    productos.forEach((producto) => {
      const sku = (producto["SKU"] || "")
        .toString()
        .normalize("NFKD")
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9_#\-]/g, "")
        .toUpperCase();
      const descripcion = (producto["Producto"] || "").trim();
      const marca = (producto["Marca"] || "").trim();
      const serie = (producto["Serie"] || "").trim();
      const nuevoStock = parseInt(producto["STOCK"]) || 0;
      const fecha = new Date().toISOString().split("T")[0];

      if (inventarioMap.has(sku)) {
        const existente = inventarioMap.get(sku);
        const stockSumado = parseInt(existente.stock) + nuevoStock;

        inventarioMap.set(sku, {
          sku,
          descripcion: existente.descripcion || descripcion,
          marca: existente.marca || marca,
          serie: existente.serie || serie,
          stock: stockSumado,
          fecha,
        });
      } else {
        inventarioMap.set(sku, {
          sku,
          descripcion,
          marca,
          serie,
          stock: nuevoStock,
          fecha,
        });
      }
    });

    const inventarioFinal = Array.from(inventarioMap.values());
    localStorage.setItem("inventario", JSON.stringify(inventarioFinal));

    tablaBody.innerHTML = "";
    cargarInventario();
    alert("Importación exitosa. Stock fusionado por SKU.");
  };

  lector.readAsArrayBuffer(archivo);
});

$(document).ready(function () {
  const table = $("#tablaProductos").DataTable({
    paging: true,
    searching: true,
    ordering: true,
    info: false,
    language: {
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ registros",
      zeroRecords: "No se encontraron resultados",
      paginate: {
        previous: "Anterior",
        next: "Siguiente",
      },
    },
  });

  $("#tablaProductos thead tr:eq(1) th").each(function (i) {
    $("input", this).on("keyup change", function () {
      if (table.column(i).search() !== this.value) {
        table.column(i).search(this.value).draw();
      }
    });
  });
});

const VERSION_APP = "v2";
if (localStorage.getItem("app_version") !== VERSION_APP) {
  localStorage.clear();
  localStorage.setItem("app_version", VERSION_APP);
}

function obtenerColorAlerta(stock) {
  if (stock <= 5) {
    return "rojo"; // Bajo stock
  } else if (stock <= 20) {
    return "amarillo"; // Medio
  } else {
    return "verde"; // Stock suficiente
  }
}
