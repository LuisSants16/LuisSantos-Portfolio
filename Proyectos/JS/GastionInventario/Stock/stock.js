document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fecha").value = hoy;

  // Cambiar de pestañas
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // Mostrar campo de serie si el SKU lo requiere
  document.getElementById("skuBuscar").addEventListener("input", () => {
    const sku = document.getElementById("skuBuscar").value.trim().toUpperCase();
    const inventario = [
      ...(JSON.parse(localStorage.getItem("inventario")) || []),
      ...(JSON.parse(localStorage.getItem("repuestos_creados")) || []),
    ];
    const item = inventario.find((p) => p.sku === sku);
    const contenedor = document.getElementById("serieContenedor");

    if (item && item.requiereSerie) {
      contenedor.innerHTML = `
        <label for="serieAgregar">Serie:</label>
        <input type="text" id="serieAgregar" required />
      `;
    } else {
      contenedor.innerHTML = "";
    }
  });

  // Formulario de agregar stock
  document
    .getElementById("formularioAgregarStock")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const sku = document
        .getElementById("skuBuscar")
        .value.trim()
        .toUpperCase();
      const cantidad = parseInt(document.getElementById("cantidad").value);
      const fecha = document.getElementById("fecha").value;
      const serieInput = document.getElementById("serieAgregar");
      const serie = serieInput ? serieInput.value.trim() : "";

      if (!sku || isNaN(cantidad) || cantidad <= 0) {
        alert("Completa correctamente todos los campos.");
        return;
      }

      const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
      const index = inventario.findIndex((p) => p.sku === sku);

      if (index === -1) {
        // Si el SKU está en repuestos_creados pero no en inventario, moverlo
        const creados =
          JSON.parse(localStorage.getItem("repuestos_creados")) || [];
        const creado = creados.find((p) => p.sku === sku);

        if (creado) {
          creado.stock = cantidad;
          creado.fecha = fecha;
          if (serie) creado.serie = serie;

          inventario.push(creado);

          // Eliminar de repuestos_creados
          const nuevosCreados = creados.filter((p) => p.sku !== sku);
          localStorage.setItem(
            "repuestos_creados",
            JSON.stringify(nuevosCreados)
          );
          localStorage.setItem("inventario", JSON.stringify(inventario));

          alert("Repuesto movido al inventario y stock actualizado.");
          e.target.reset();
          document.getElementById("fecha").value = hoy;
          document.getElementById("serieContenedor").innerHTML = "";
          return;
        }

        // Si tampoco está en creados
        alert("SKU no encontrado.");
        return;
      }

      inventario[index].stock =
        parseInt(inventario[index].stock || 0) + cantidad;
      inventario[index].fecha = fecha;

      if (serie) {
        inventario[index].serie = serie;
      }

      localStorage.setItem("inventario", JSON.stringify(inventario));
      alert("Stock actualizado correctamente.");
      e.target.reset();
      document.getElementById("fecha").value = hoy;
      document.getElementById("serieContenedor").innerHTML = "";
    });

  // Formulario de consumo
  document
    .getElementById("formularioConsumo")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const tipo = document.getElementById("tipoConsumo").value;
      const nota = document.getElementById("notaConsumo").value.trim();
      const sku = document.getElementById("skuConsumo").value.trim();
      const cantidad = parseInt(
        document.getElementById("cantidadConsumo").value
      );

      if (!sku || !nota || isNaN(cantidad) || cantidad <= 0) {
        alert("Complete correctamente todos los campos.");
        return;
      }

      const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
      const producto = inventario.find((p) => p.sku === sku);

      if (!producto) {
        alert("SKU no encontrado.");
        return;
      }

      if (parseInt(producto.stock) < cantidad) {
        alert("Stock insuficiente para realizar el consumo.");
        return;
      }

      producto.stock = parseInt(producto.stock) - cantidad;
      localStorage.setItem("inventario", JSON.stringify(inventario));

      alert(`Consumo registrado: ${tipo} - ${cantidad} unidades de ${sku}.`);
      e.target.reset();
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const skuInput = document.getElementById("skuBuscar");
  const descripcionInput = document.getElementById("descripcionProducto");

  if (skuInput && descripcionInput) {
    skuInput.addEventListener("input", () => {
      const sku = skuInput.value.trim().toUpperCase();

      const inventario =
        JSON.parse(localStorage.getItem("inventario")) ||
        JSON.parse(localStorage.getItem("stock")) ||
        [];

      if (!sku) {
        descripcionInput.value = "";
        return;
      }

      const producto = inventario.find((p) =>
        (p.sku || "").toString().replace(/\s+/g, "").toUpperCase().includes(sku)
      );
      descripcionInput.value = producto ? producto.descripcion : "";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const skuConsumo = document.getElementById("skuConsumo");
  const descripcionConsumo = document.getElementById("descripcionConsumo");

  if (skuConsumo && descripcionConsumo) {
    skuConsumo.addEventListener("input", () => {
      const sku = skuConsumo.value.trim().toUpperCase();

      if (!sku) {
        descripcionConsumo.value = "";
        return;
      }

      const inventario = JSON.parse(localStorage.getItem("inventario")) || JSON.parse(localStorage.getItem("stock")) || [];

      const producto = inventario.find(p =>
        (p.sku || "").toString().replace(/\s+/g, "").toUpperCase().includes(sku)
      );

      descripcionConsumo.value = producto ? producto.descripcion : "";
    });
  }
});

// Agregar una serie para un SKU sin duplicados
function agregarSerieAlStock(nuevoRegistro) {
  let inventario = JSON.parse(localStorage.getItem('inventario')) || [];

  const existe = inventario.some(item => 
    item.sku === nuevoRegistro.sku && item.serie === nuevoRegistro.serie
  );

  if (existe) {
    alert('La serie ya está registrada para este modelo.');
    return false;
  }

  inventario.push(nuevoRegistro);
  localStorage.setItem('inventario', JSON.stringify(inventario));
  actualizarStockGeneral(nuevoRegistro.sku, 1);
  return true;
}

// Actualizar stock general por SKU
function actualizarStockGeneral(sku, cantidad) {
  let stockGeneral = JSON.parse(localStorage.getItem('stockGeneral')) || {};

  stockGeneral[sku] = (stockGeneral[sku] || 0) + cantidad;
  if (stockGeneral[sku] < 0) stockGeneral[sku] = 0;

  localStorage.setItem('stockGeneral', JSON.stringify(stockGeneral));
}

// Cargar tabla stock
function cargarTablaStock() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  const tbody = document.querySelector('#tablaStock tbody');
  tbody.innerHTML = '';

  inventario.forEach(item => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.descripcion}</td>
      <td>${item.serie}</td>
      <td>${item.marca}</td>
      <td>${item.responsable}</td>
      <td>${item.fecha}</td>
    `;
    tbody.appendChild(fila);
  });
}

document.addEventListener('DOMContentLoaded', cargarTablaStock);

// Manejar formulario agregar serie
document.getElementById('formAgregarSerie').addEventListener('submit', e => {
  e.preventDefault();

  const nuevoRegistro = {
    sku: document.getElementById('inputSKU').value.trim().toUpperCase(),
    descripcion: document.getElementById('inputDescripcion').value.trim(),
    serie: document.getElementById('inputSerie').value.trim(),
    marca: document.getElementById('inputMarca').value.trim(),
    responsable: document.getElementById('inputResponsable').value.trim(),
    fecha: new Date().toISOString().slice(0,10)
  };

  if (agregarSerieAlStock(nuevoRegistro)) {
    alert('Serie agregada con éxito');
    e.target.reset();
    cargarTablaStock();
  }
});
