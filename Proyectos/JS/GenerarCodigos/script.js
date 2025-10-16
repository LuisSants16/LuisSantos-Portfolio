let productos = JSON.parse(localStorage.getItem("productos")) || [];
let paginaActual = 1;

function guardarEnLocal() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

let contador = productos.length;

function generarSKU(desc) {
  const palabras = desc.toUpperCase().split(" ")
  let abreviatura = ""

  for (let palabra of palabras) {
    // Solo toma letras significativas (evita preposiciones cortas como "DE", "A", etc.)
    if (palabra.length > 2) {
      abreviatura += palabra[0]
    }
  }

  // Si por alguna razón no se generó abreviatura, usar "X"
  if (abreviatura === "") abreviatura = "X"

  contador++
  const numero = String(contador).padStart(3, '0')

  return abreviatura + "-" + numero
}

function agregarProducto() {
  const descripcion = document.getElementById("descripcion").value.trim();
  if (descripcion === "") return;

  const sku = generarSKU(descripcion);
  productos.push({ descripcion, sku });
  guardarEnLocal();
  mostrarTabla();
  document.getElementById("descripcion").value = "";
}

function eliminarProducto(index) {
  productos.splice(index, 1);
  guardarEnLocal();
  mostrarTabla();
}

function editarProducto(index) {
  const nuevoDesc = prompt("Editar descripción:", productos[index].descripcion);
  if (!nuevoDesc) return;
  productos[index].descripcion = nuevoDesc;
  productos[index].sku = generarSKU(nuevoDesc);
  guardarEnLocal();
  mostrarTabla();
}

function mostrarTabla() {
  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "";

  const limite = parseInt(document.getElementById("limiteRegistros").value);
  const totalPaginas = Math.ceil(productos.length / limite);
  const inicio = productos.length - paginaActual * limite;
  const fin = inicio + limite;

  const productosMostrados = productos
    .slice(Math.max(0, inicio), Math.max(0, fin))
    .reverse();

  productosMostrados.forEach((prod, i) => {
    const indexOriginal = productos.indexOf(prod);
    tabla.innerHTML += `
    <tr>
        <td>${i + 1}</td>
        <td contenteditable="true" onblur="actualizarDescripcion(${indexOriginal}, this.innerText.trim())">${
        prod.descripcion
        }</td>
        <td>${prod.sku}</td>
        <td class="acciones">
        <button onclick="editarProducto(${indexOriginal})">✏️</button>
        <button onclick="eliminarProducto(${indexOriginal})">🗑️</button>
        </td>
    </tr>
    `;
  });

  renderizarPaginacion(totalPaginas);
}

function renderizarPaginacion(totalPaginas) {
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  const crearBoton = (texto, pagina) => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.onclick = () => {
      paginaActual = pagina;
      mostrarTabla();
    };
    btn.disabled = pagina === paginaActual;
    return btn;
  };

  if (paginaActual > 1)
    contenedor.appendChild(crearBoton("« Anterior", paginaActual - 1));

  for (let i = 1; i <= totalPaginas; i++) {
    contenedor.appendChild(crearBoton(i, i));
  }

  if (paginaActual < totalPaginas)
    contenedor.appendChild(crearBoton("Siguiente »", paginaActual + 1));
}

function filtrarTabla() {
  const texto = document.getElementById("busqueda").value.toLowerCase();
  const filas = document.querySelectorAll("#tablaProductos tr");

  filas.forEach((fila) => {
    const descripcion = fila.children[1].textContent.toLowerCase();
    const sku = fila.children[2].textContent.toLowerCase();
    fila.style.display =
      descripcion.includes(texto) || sku.includes(texto) ? "" : "none";
  });
}

function actualizarDescripcion(index, nuevaDescripcion) {
  if (!nuevaDescripcion || nuevaDescripcion === productos[index].descripcion) return
  productos[index].descripcion = nuevaDescripcion
  productos[index].sku = generarSKU(nuevaDescripcion)
  guardarEnLocal()
  mostrarTabla()
}

mostrarTabla();
