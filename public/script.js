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
      galeria.innerHTML = "<p>Aún no hay fotos 🩷</p>";
      return;
    }

    fotos.reverse().forEach((url) => {
      const cont = document.createElement("div");
      cont.className = "foto-container";

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Foto del cumple";

      const boton = document.createElement("button");
      boton.className = "descargar-btn";
      boton.textContent = "⬇ Descargar esta foto";
      boton.addEventListener("click", () => descargarFoto(url));

      cont.appendChild(img);
      cont.appendChild(boton);
      galeria.appendChild(cont);
    });
  } catch (error) {
    console.error("Error cargando fotos:", error);
  }
}

function descargarFoto(url) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "foto_cumple.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function descargarTodas() {
  try {
    const res = await fetch("/fotos");
    const fotos = await res.json();

    for (const url of fotos) {
      descargarFoto(url);
      await new Promise(r => setTimeout(r, 300)); // leve pausa
    }
  } catch (e) {
    console.error("Error descargando todas las fotos:", e);
  }
}
