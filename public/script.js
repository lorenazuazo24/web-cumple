document.addEventListener("DOMContentLoaded", async () => {
  await cargarFotos();

  const botonDescargarTodo = document.getElementById("descargarTodo");
  if (botonDescargarTodo) {
    botonDescargarTodo.addEventListener("click", descargarTodas);
  }
});

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

    // Mostrar las fotos en orden inverso (las más nuevas primero)
    fotos.reverse().forEach((url) => {
      const contenedor = document.createElement("div");
      contenedor.classList.add("foto-container");

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Foto del cumple";

      // 🔹 Botón para descargar individualmente
      const botonDescargar = document.createElement("button");
      botonDescargar.classList.add("descargar-btn");
      botonDescargar.textContent = "⬇ Descargar esta foto";

      botonDescargar.onclick = () => descargarFoto(url);

      contenedor.appendChild(img);
      contenedor.appendChild(botonDescargar);
      galeria.appendChild(contenedor);
    });
  } catch (error) {
    console.error("❌ Error cargando fotos:", error);
    galeria.innerHTML = "<p>Error al cargar las fotos 😢</p>";
  }
}

// 🔹 Descargar una sola foto con nombre único
function descargarFoto(url) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const enlace = document.createElement("a");
      const nombreUnico =
        "foto_" +
        new Date().toISOString().replace(/[:.]/g, "-") +
        "_" +
        Math.floor(Math.random() * 1000) +
        ".jpg";
      enlace.href = URL.createObjectURL(blob);
      enlace.download = nombreUnico;
      enlace.click();
    })
    .catch((err) => console.error("Error al descargar la imagen:", err));
}

// 🔹 Descargar todas las fotos
async function descargarTodas() {
  try {
    const res = await fetch("/fotos");
    const fotos = await res.json();

    if (!fotos.length) {
      alert("No hay fotos para descargar 😢");
      return;
    }

    for (const url of fotos) {
      await new Promise((resolve) => {
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            const enlace = document.createElement("a");
            const nombreUnico =
              "foto_" +
              new Date().toISOString().replace(/[:.]/g, "-") +
              "_" +
              Math.floor(Math.random() * 1000) +
              ".jpg";
            enlace.href = URL.createObjectURL(blob);
            enlace.download = nombreUnico;
            enlace.click();
            setTimeout(resolve, 500); // 🔹 pausa leve entre descargas
          })
          .catch((err) => {
            console.error("Error descargando una foto:", err);
            resolve();
          });
      });
    }

    alert("✅ Todas las fotos fueron descargadas correctamente 🎉");
  } catch (e) {
    console.error("Error descargando todas las fotos:", e);
    alert("❌ Error al intentar descargar las fotos");
  }
}
