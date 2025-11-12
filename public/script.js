document.addEventListener("DOMContentLoaded", async () => {
  await cargarFotos();

  const botonDescargarTodo = document.getElementById("descargarTodo");
  if (botonDescargarTodo)
    botonDescargarTodo.addEventListener("click", descargarTodas);

  const botonAgregarTema = document.getElementById("agregarTema");
  if (botonAgregarTema)
    botonAgregarTema.addEventListener("click", agregarTema);
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
  } catch (err) {
    galeria.innerHTML = "<p>Error cargando fotos 😢</p>";
  }
}

function descargarFoto(url, index) {
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const enlace = document.createElement("a");
      const fecha = new Date().toISOString().split("T")[0];
      enlace.href = URL.createObjectURL(blob);
      enlace.download = `foto_${fecha}_${index + 1}.jpg`;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    });
}

async function descargarTodas() {
  const res = await fetch("/fotos");
  const fotos = await res.json();

  for (let i = 0; i < fotos.length; i++) {
    await new Promise((resolve) => {
      descargarFoto(fotos[i], i);
      setTimeout(resolve, 400);
    });
  }
}

async function agregarTema() {
  const input = document.getElementById("inputTema");
  const mensaje = document.getElementById("mensajeTema");
  const texto = input.value.trim();

  if (!texto) {
    mensaje.textContent = "⚠️ Escribí un tema.";
    return;
  }

  try {
    const res = await fetch("/tema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const data = await res.json();

    if (res.status === 200) {
      mensaje.textContent = "✅ Tema agregado!";
      input.value = "";
    } else {
      mensaje.textContent = data.error || "❌ Error al agregar tema";
    }
  } catch {
    mensaje.textContent = "❌ Error al conectar con el servidor.";
  }
}
