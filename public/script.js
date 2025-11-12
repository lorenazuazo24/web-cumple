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
    console.error("❌ Error cargando fotos:", error);
    galeria.innerHTML = "<p>Error al cargar las fotos 😢</p>";
  }
}

// 🔹 Descargar una foto con nombre único
function descargarFoto(url, index) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const enlace = document.createElement("a");
      const fecha = new Date().toISOString().split("T")[0];
      const nombreUnico = `foto_${fecha}_${index + 1}_${Math.floor(
        Math.random() * 10000
      )}.jpg`;
      enlace.href = URL.createObjectURL(blob);
      enlace.download = nombreUnico;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    })
    .catch((err) => console.error("Error al descargar imagen:", err));
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

    for (let i = 0; i < fotos.length; i++) {
      const url = fotos[i];
      await new Promise((resolve) => {
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            const enlace = document.createElement("a");
            const fecha = new Date().toISOString().split("T")[0];
            const nombreUnico = `foto_${fecha}_${i + 1}_${Math.floor(
              Math.random() * 10000
            )}.jpg`;
            enlace.href = URL.createObjectURL(blob);
            enlace.download = nombreUnico;
            enlace.click();
            URL.revokeObjectURL(enlace.href);
            setTimeout(resolve, 400);
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
