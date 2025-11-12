// Mostrar QR generado en el servidor (usando Pug variable global o fetch)
document.addEventListener("DOMContentLoaded", async () => {
  const qrImg = document.getElementById("qr");
  if (qrImg) {
    // Si el servidor renderiza el QR en la vista (index.pug), este paso no es necesario
    try {
      const res = await fetch(window.location.href);
      const html = await res.text();
      const match = html.match(/data:image\/png;base64,[A-Za-z0-9+/=]+/);
      if (match) qrImg.src = match[0];
    } catch (e) {
      console.warn("No se pudo cargar el QR automáticamente:", e);
    }
  }

  // Mostrar fotos de la galería
  await cargarFotos();
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

    fotos.reverse().forEach(nombre => {
      const img = document.createElement("img");
      img.src = nombre;
      img.alt = "Foto del cumple";
      galeria.appendChild(img);
    });
  } catch (error) {
    console.error("Error cargando fotos:", error);
  }
}
