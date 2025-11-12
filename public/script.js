async function cargarFotos() {
  const res = await fetch("/fotos");
  const fotos = await res.json();
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = "";
  fotos.reverse().forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    galeria.appendChild(img);
  });
}

async function cargarQR() {
  const res = await fetch("/qr");
  const { qr } = await res.json();
  document.getElementById("qr").src = qr;
}

cargarFotos();
cargarQR();
setInterval(cargarFotos, 5000); // refresca cada 5 segundos
