import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Cargar variables de entorno
dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de vistas
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Archivos estáticos (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Configuración de multer (solo para recibir el archivo antes de subirlo a Cloudinary)
const storage = multer.diskStorage({
  destination: "./tmp", // carpeta temporal
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Genera el QR para la página de subida
app.get("/", async (req, res) => {
  const urlSubida = `${req.protocol}://${req.get("host")}/subir`;
  const qr = await QRCode.toDataURL(urlSubida); // genera QR base64
  res.render("index", { qr });
});

// Página de subida
app.get("/subir", (req, res) => res.render("subir"));

// Endpoint de subida a Cloudinary
app.post("/upload", upload.single("foto"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log("✅ Foto subida:", result.secure_url);
    res.redirect("/");
  } catch (error) {
    console.error("❌ Error subiendo imagen a Cloudinary:", error);
    res.status(500).send("Error al subir imagen");
  }
});

// Lista de fotos (Cloudinary)
app.get("/fotos", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      max_results: 50 // cuántas querés listar
    });

    const urls = resources.resources.map(r => r.secure_url);
    res.json(urls);
  } catch (error) {
    console.error("Error al obtener imágenes de Cloudinary:", error);
    res.json([]);
  }
});

// Inicia el servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
