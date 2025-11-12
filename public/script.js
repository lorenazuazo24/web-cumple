document.addEventListener("DOMContentLoaded", async () => {
  await cargarFotos();

  const form = document.getElementById("formSubir");
  if (form) {
    form.addEventListener("submit", subirFoto);
  }

  const botonDescargarTodo = document.getElementById("descargarTodo");
  if (botonDescargarTodo) {
    botonDescargarTodo.addEventListener("click", descargarTodas);
  }
});

async function subirFoto(e) {
  e.preventDefault();
  const form = e.target;
  const inputFile = form.querySelector('input[type="file"]');
  const estado = document.getElementById("estadoSubida");
  const boton = form.querySelector("button");

  if (!inputFile.files.length) return alert("Seleccioná una foto primero 😄");

  const formData = new FormData(form);
  estado.textContent = "📤 Subiendo foto...";
  boton.disabled = true;

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      estado.textContent = "✅ Foto subida con éxito 🎉";
      inputFile.value = "";
      setTimeout(() => {
        estado.textContent = "";
        cargarFotos();
      }, 2000);
    } else {
      estado.textContent = "❌ Error al subir la foto";
    }
  } catch (error) {
    console.error(error);
    estado.textContent = "❌ Error al subir la foto";
  } finally {
    boton.disabled = false;
  }
}

// 🔹 Cargar galería
async function cargarFotos() {
  const galeria = document.getElementById("galeria");
  if (!galeria) return;

  try {
    const res = await fetch("/fotos");
    const fotos = await res.json();
    galeria.innerHTML = "";

    if (!fotos.length) {
      galeria.innerHTML = "<p>Aún no hay fotos 💗</p>";
      return;
    }

    fotos.reverse().forEach((url, index) => {
      const contenedor = document.createElement("div");
      contenedor.classList.add("foto-container");

      const img = document.createElement("img");
      img.src = url;
      img.alt = `Foto ${index + 1}`;

      const botonDescargar = document.createElement("button");
      botonDescargar.classList.add("descargar-btn");
      botonDescargar.textContent = "⬇ Descargar foto";
      botonDescargar.onclick = () => descargarFoto(url, index);

      contenedor.appendChild(img);
      contenedor.appendChild(botonDescargar);
      galeria.appendChild(contenedor);
    });
  } catch (error) {
    galeria.innerHTML = "<p>Error al cargar las fotos 😢</p>";
  }
}

// 🔹 Descargar individual
function descargarFoto(url, index) {
  fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const a = document.createElement("a");
      const nombre = `foto_${new Date().toISOString().split("T")[0]}_${index + 1}_${Math.floor(
        Math.random() * 10000
      )}.jpg`;
      a.href = URL.createObjectURL(blob);
      a.download = nombre;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

// 🔹 Descargar todas
async function descargarTodas() {
  const res = await fetch("/fotos");
  const fotos = await res.json();
  if (!fotos.length) return alert("No hay fotos para descargar 😢");

  for (let i = 0; i < fotos.length; i++) {
    await new Promise((resolve) => {
      fetch(fotos[i])
        .then((r) => r.blob())
        .then((blob) => {
          const a = document.createElement("a");
          const nombre = `foto_${new Date().toISOString().split("T")[0]}_${i + 1}_${Math.floor(
            Math.random() * 10000
          )}.jpg`;
          a.href = URL.createObjectURL(blob);
          a.download = nombre;
          a.click();
          URL.revokeObjectURL(a.href);
          setTimeout(resolve, 400);
        })
        .catch(() => resolve());
    });
  }
  alert("✅ Todas las fotos fueron descargadas 🎉");
}
