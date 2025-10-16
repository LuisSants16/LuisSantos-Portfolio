document
  .getElementById("buscarCodigoBtn")
  .addEventListener("click", buscarCodigo);
document
  .getElementById("buscarDescripcionBtn")
  .addEventListener("click", buscarDescripcion);
document
  .getElementById("limpiarBtn")
  .addEventListener("click", limpiarResultados);

function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9/]/g, "")
    .trim();
}

function buscarCodigo() {
  busquedaCancelada = false;
  mostrarCarga();

  const archivos = Array.from(document.getElementById("fileInput").files);
  const codigo = normalizarTexto(
    document.getElementById("codigo").value.trim()
  );
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  if (!codigo) {
    ocultarCarga();
    alert("⚠️ Ingrese un código válido para buscar.");
    return;
  }

  let resultadosGlobales = [];
  let totalProcesables = archivos.filter(
    (f) =>
      f.name.endsWith(".xlsx") ||
      f.name.endsWith(".xls") ||
      f.name.endsWith(".docx")
  ).length;
  let procesados = 0;

  archivos.forEach((archivo) => {
    if (archivo.name.endsWith(".xlsx") || archivo.name.endsWith(".xls")) {
      leerExcel(archivo, codigo, false, (res) => {
        resultadosGlobales.push(...res);
        procesados++;
        if (procesados === totalProcesables) {
          mostrarUltimos10(resultadosGlobales, resultadoDiv);
        }
      });
    } else if (archivo.name.endsWith(".docx")) {
      leerWord(archivo, codigo, (res) => {
        resultadosGlobales.push(...res);
        procesados++;
        if (procesados === totalProcesables) {
          mostrarUltimos10(resultadosGlobales, resultadoDiv);
        }
      });
    }
  });

  if (totalProcesables === 0) {
    resultadoDiv.innerHTML =
      "<p style='color:orange;'>No se seleccionaron archivos compatibles.</p>";
  }
}

function buscarDescripcion() {
  mostrarCarga();

  const archivos = Array.from(document.getElementById("fileInput").files);
  const descripcion = normalizarTexto(
    document.getElementById("descripcion").value.trim()
  );
  const resultadoDiv = document.getElementById("resultadoDescripcion");
  resultadoDiv.innerHTML = "";

  if (!descripcion) {
    ocultarCarga();
    alert("⚠️ Ingrese una descripción válida para buscar.");
    return;
  }

  let resultadosGlobales = [];
  let totalProcesables = archivos.filter(
    (f) =>
      f.name.endsWith(".xlsx") ||
      f.name.endsWith(".xls") ||
      f.name.endsWith(".docx")
  ).length;
  let procesados = 0;

  archivos.forEach((archivo) => {
    if (archivo.name.endsWith(".xlsx") || archivo.name.endsWith(".xls")) {
      leerExcel(archivo, descripcion, true, (res) => {
        resultadosGlobales.push(...res);
        procesados++;
        if (procesados === totalProcesables) {
          mostrarUltimos10(resultadosGlobales, resultadoDiv);
        }
      });
    } else if (archivo.name.endsWith(".docx")) {
      leerWord(archivo, descripcion, (res) => {
        resultadosGlobales.push(...res);
        procesados++;
        if (procesados === totalProcesables) {
          mostrarUltimos10(resultadosGlobales, resultadoDiv);
        }
      });
    }
  });

  if (totalProcesables === 0) {
    resultadoDiv.innerHTML =
      "<p style='color:orange;'>No se seleccionaron archivos compatibles.</p>";
  }
}

function leerWord(archivo, busqueda, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const arrayBuffer = event.target.result;
    mammoth
      .extractRawText({ arrayBuffer: arrayBuffer })
      .then(function (result) {
        const texto = result.value;
        const textoNormalizado = normalizarTexto(texto);
        const indices = [];
        let index = textoNormalizado.indexOf(busqueda);
        while (index !== -1) {
          indices.push(index);
          index = textoNormalizado.indexOf(busqueda, index + 1);
        }

        const resultados = indices.map((i) => {
          const fragmento = texto.substring(Math.max(0, i - 40), i + 40);
          const fileURL = URL.createObjectURL(archivo);
          return `
            <div class="resultado-item">
              <strong>Archivo Word:</strong> ${archivo.name}<br>
              <strong>Fragmento:</strong> ${fragmento}...<br>
              <a href="${fileURL}" target="_blank">Abrir</a>
            </div>
          `;
        });

        callback(resultados);
      })
      .catch(function (err) {
        callback([
          `<p style="color:orange;">No se pudo leer ${archivo.name}: ${err.message}</p>`,
        ]);
      });
  };
  reader.readAsArrayBuffer(archivo);
}

function mostrarUltimos10(resultados, resultadoDiv) {
  resultadoDiv.innerHTML = "";

  resultados.slice(-10).forEach((htmlString) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlString.trim();

    Array.from(wrapper.children).forEach((el) => {
      resultadoDiv.appendChild(el);
    });
  });

  if (resultadoDiv.children.length === 0) {
    resultadoDiv.innerHTML = "<p>No se encontraron coincidencias.</p>";
  }

  ocultarCarga();
}

function leerExcel(archivo, busqueda, esDescripcion, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    let resultados = [];

    const buscado = normalizarTexto(busqueda);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const fechaDocumento = extraerFechaDesdeExcel(sheet);
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    jsonData.forEach((fila, filaIndex) => {
      fila.forEach((celda, colIndex) => {
        if (busquedaCancelada) return;

        if (celda !== undefined && celda !== null && celda.toString().trim() !== "") {
          const celdaStr = String(celda).trim();
          const comparado = normalizarTexto(celdaStr);

          if (comparado === buscado) {
            const celdaResaltada = resaltarCoincidencia(celdaStr, busqueda);

            const fileURL = URL.createObjectURL(archivo);
            const nombreArchivo = archivo.name;
            const celdaExcel = XLSX.utils.encode_cell({ r: filaIndex, c: colIndex });
            const codigo = fila[0] || "Código no encontrado";

            if (esDescripcion) {
              resultados.push(`
                <div class="resultado-item">
                  <p><strong>Archivo:</strong> ${nombreArchivo}</p>
                  <p><strong>Fecha:</strong> ${fechaDocumento}</p>
                  <p><strong>Código:</strong> ${codigo}</p>
                  <p><strong>Descripción:</strong> ${celdaResaltada}</p>
                  <button class="btn-ver" onclick="mostrarVistaPrevia(this, '${fileURL}', '${nombreArchivo}')">Vista previa</button>
                  <div class="preview-area" style="display: none; margin-top: 10px;"></div>
                </div>
              `);
            } else {
              resultados.push(`
                <div class="resultado-item">
                  <p><strong>Archivo:</strong> ${nombreArchivo}</p>
                  <p><strong>Hoja:</strong> ${sheetName}</p>
                  <p><strong>Celda:</strong> ${celdaExcel}</p>
                  <p><strong>Contenido:</strong> ${celdaResaltada}</p>
                  <p><strong>Fecha del documento:</strong> ${fechaDocumento}</p>
                  <button class="btn-ver" onclick="mostrarVistaPrevia(this, '${fileURL}', '${nombreArchivo}')">Vista previa</button>
                  <div class="preview-area" style="display: none; margin-top: 10px;"></div>
                </div>
              `);
            }
          }
        }
      });
    });

    callback(resultados);
  };
  reader.readAsArrayBuffer(archivo);
}

function limpiarResultados() {
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("resultadoDescripcion").innerHTML = "";
}

function ordenarResultados(direccion, tipo = "codigo") {
  const contenedor = document.getElementById(
    tipo === "descripcion" ? "resultadoDescripcion" : "resultado"
  );
  const items = Array.from(contenedor.querySelectorAll(".resultado-item"));

  const itemsConFecha = items.map((item) => {
    const textoFecha = item.innerHTML.match(
      /<strong>Fecha:<\/strong>\s*(.*?)<\/p>/
    );
    const fecha = textoFecha ? new Date(textoFecha[1]) : new Date("1900-01-01");
    return { fecha, item };
  });

  itemsConFecha.sort((a, b) => {
    return direccion === "asc" ? a.fecha - b.fecha : b.fecha - a.fecha;
  });

  contenedor.innerHTML = "";
  itemsConFecha.forEach((obj) => contenedor.appendChild(obj.item));
}

function mostrarVistaPrevia(boton, url, nombreArchivo) {
  const contenedor = boton.nextElementSibling;
  const esWord = nombreArchivo.toLowerCase().endsWith(".docx");
  const esExcel = nombreArchivo.toLowerCase().endsWith(".xls") || nombreArchivo.toLowerCase().endsWith(".xlsx");

  if (contenedor.style.display === "block") {
    contenedor.style.display = "none";
    contenedor.innerHTML = "";
    return;
  }

  contenedor.innerHTML = "Cargando vista previa...";
  contenedor.style.display = "block";

  fetch(url)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const busqueda = document.getElementById("codigo").value || document.getElementById("descripcion").value;
      if (esWord) {
        mammoth.extractRawText({ arrayBuffer: buffer }).then(result => {
          const textoOriginal = result.value;
          const resaltado = resaltarCoincidencia(textoOriginal, busqueda);
          contenedor.innerHTML = `<div style="white-space: pre-wrap;">${resaltado}</div>`;
        });
      } else if (esExcel) {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let html = XLSX.utils.sheet_to_html(sheet);

        const resaltado = resaltarCoincidencia(html, busqueda);
        contenedor.innerHTML = resaltado;
      } else {
        contenedor.innerHTML = "Vista previa no disponible.";
      }
    })
    .catch(err => {
      contenedor.innerHTML = "Error al cargar vista previa.";
      console.error(err);
    });
}

function mostrarCarga(mensaje = "🔄 Cargando, por favor espere...") {
  const overlay = document.getElementById("overlay-carga");
  const texto = overlay.querySelector(".loader-text");
  texto.textContent = mensaje;
  overlay.style.display = "flex";
}

function ocultarCarga(retardo = 400) {
  const overlay = document.getElementById("overlay-carga");
  overlay.classList.add("oculto");
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove("oculto");
  }, retardo);
}

function extraerFechaDesdeExcel(sheet) {
  try {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    for (let fila of data) {
      for (let i = 0; i < fila.length; i++) {
        const celda = fila[i];
        if (!celda) continue;

        const texto = String(celda)
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "")
          .toLowerCase();

        if (texto === "fecha") {
          const posibleFecha = fila[i + 1];
          if (posibleFecha && String(posibleFecha).trim() !== "") {
            return String(posibleFecha).trim();
          }
        }
      }
    }

    return "Fecha no encontrada";
  } catch (error) {
    console.error("Error leyendo fecha:", error);
    return "Fecha no encontrada";
  }
}

function resaltarCoincidencia(textoOriginal, busqueda) {
  if (!busqueda) return textoOriginal;

  const safeBusqueda = busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeBusqueda})`, 'ig');
  return textoOriginal.replace(regex, '<mark>$1</mark>');
}

const toggleBtn = document.getElementById("toggle-modo");

function actualizarIconoModo() {
  const claro = document.body.classList.contains("modo-claro");
  toggleBtn.innerHTML = claro ? "🌙 Modo oscuro" : "🌞 Modo claro";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("modo-claro");
  const modo = document.body.classList.contains("modo-claro") ? "claro" : "oscuro";
  localStorage.setItem("modo", modo);
  actualizarIconoModo();
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modo") === "claro") {
    document.body.classList.add("modo-claro");
  }
  actualizarIconoModo();
});

document.getElementById("fileInput").addEventListener("change", function () {
  const span = document.getElementById("file-name");
  const files = this.files;
  if (files.length === 0) {
    span.textContent = "Ningún archivo seleccionado";
  } else {
    span.textContent = `${files.length} archivo${files.length > 1 ? "s" : ""} seleccionado`;
  }
});

function limpiarResultados() {
  const tieneCodigo = document.getElementById("codigo").value.trim() !== "";
  const tieneDescripcion = document.getElementById("descripcion").value.trim() !== "";
  const tieneArchivos = document.getElementById("fileInput").files.length > 0;
  const tieneResultados = document.getElementById("resultado").innerHTML.trim() !== "" ||
                          document.getElementById("resultadoDescripcion").innerHTML.trim() !== "";

  if (!tieneCodigo && !tieneDescripcion && !tieneArchivos && !tieneResultados) {
    alert("⚠️ No hay nada que limpiar.");
    return;
  }

  mostrarCarga("🧹 Limpiando todo, por favor espere...");

  setTimeout(() => {
    document.getElementById("codigo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("fileInput").value = "";
    document.getElementById("file-name").textContent = "Ningún archivo seleccionado";
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("resultadoDescripcion").innerHTML = "";

    ocultarCarga();
  }, 600);
}
