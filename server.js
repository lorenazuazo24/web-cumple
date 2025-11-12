import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";

const app = express();
const PORT = 3000;

// Carpeta pública
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Endpoint para subir fotos
app.post("/upload", upload.single("foto"), (req, res) => {
  res.redirect("/"); // vuelve al home después de subir
});

// Endpoint que lista fotos
app.get("/fotos", (req, res) => {
  const files = fs.readdirSync("uploads");
  const urls = files.map((file) => `/uploads/${file}`);
  res.json(urls);
});

// Generar QR dinámico para la página de subida
app.get("/qr", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}/subir.html`;
  const qr = await QRCode.toDataURL(url);
  res.json({ qr });
});

app.listen(PORT, () => console.log(`🎂 Cumple Romi activo en http://localhost:${PORT}`));
