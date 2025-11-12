import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

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

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// --- Configuración multer ---
const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- Página principal ---
app.get("/", (req, res) => res.render("index"));

// --- Subida a Cloudinary ---
app.post("/upload", upload.single("foto"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cumple-romi"
    });
    console.log("✅ Foto subida:", result.secure_url);
    res.redirect("/");
  } catch (error) {
    console.error("❌ Error subiendo imagen a Cloudinary:", error);
    res.status(500).send("Error al subir imagen");
  }
});

// --- Listado de fotos ---
app.get("/fotos", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: "cumple-romi/",
      max_results: 50
    });
    const urls = resources.resources.map(r => r.secure_url);
    res.json(urls);
  } catch (error) {
    console.error("Error al obtener imágenes de Cloudinary:", error);
    res.json([]);
  }
});

// --- Agregar tema ---
app.post("/tema", async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: "Texto inválido" });
    }

    const textoNorm = texto.trim().toLowerCase();

    const snapshot = await db.collection("temas")
      .where("textoNorm", "==", textoNorm)
      .get();

    if (!snapshot.empty) {
      return res.status(409).json({ error: "Ese tema ya fue agregado 🎈" });
    }

    await db.collection("temas").add({
      texto: texto.trim(),
      textoNorm,
      fecha: new Date()
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error al guardar tema:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// --- Mostrar lista de temas ---
app.get("/temas-lista", async (req, res) => {
  try {
    const snapshot = await db.collection("temas").orderBy("fecha", "asc").get();
    const temas = snapshot.docs.map(doc => doc.data());
    res.render("temas", { temas });
  } catch (err) {
    res.status(500).send("Error al obtener temas");
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
