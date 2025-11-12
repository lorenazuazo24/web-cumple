import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// --- Firebase ---
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// --- Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- App ---
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // 🔥 NECESARIO para forms

// --- Multer ---
const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ------------------------------
//        Página principal
// ------------------------------
app.get("/", async (req, res) => {
  try {
    // Traer temas para mostrar en index
    const snapshot = await db.collection("temas").orderBy("fecha", "asc").get();
    const temas = snapshot.docs.map(doc => doc.data());

    res.render("index", { temas });
  } catch (err) {
    console.error("Error cargando temas:", err);
    res.render("index", { temas: [] });
  }
});

// ------------------------------
//     Subida de fotos
// ------------------------------
app.post("/upload", upload.single("foto"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cumple-romi"
    });

    console.log("📸 Foto subida:", result.secure_url);
    res.redirect("/");
  } catch (error) {
    console.error("❌ Error subiendo imagen:", error);
    res.status(500).send("Error al subir imagen");
  }
});

// ------------------------------
//      Obtener fotos
// ------------------------------
app.get("/fotos", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: "cumple-romi/",
      max_results: 80
    });

    const urls = resources.resources.map(r => r.secure_url);
    res.json(urls);

  } catch (error) {
    console.error("Error obteniendo fotos:", error);
    res.json([]);
  }
});

// ------------------------------
//        Agregar tema
// ------------------------------
app.post("/agregar-tema", async (req, res) => {
  try {
    const texto = req.body.tema;

    if (!texto || !texto.trim()) {
      return res.redirect("/");
    }

    const textoNorm = texto.trim().toLowerCase();

    // Buscar duplicado
    const snapshot = await db.collection("temas")
      .where("textoNorm", "==", textoNorm)
      .get();

    if (!snapshot.empty) {
      console.log("❗ Tema duplicado:", texto);
      return res.redirect("/");
    }

    // Guardar nuevo tema
    await db.collection("temas").add({
      texto: texto.trim(),
      textoNorm,
      fecha: new Date()
    });

    console.log("🎶 Tema agregado:", texto);

    res.redirect("/");

  } catch (err) {
    console.error("Error agregando tema:", err);
    res.redirect("/");
  }
});

// ------------------------------
//        Página lista temas
// ------------------------------
app.get("/temas-lista", async (req, res) => {
  try {
    const snapshot = await db.collection("temas").orderBy("fecha", "asc").get();
    const temas = snapshot.docs.map(doc => doc.data());

    res.render("temas", { temas });
  } catch (err) {
    console.error("Error leyendo temas:", err);
    res.status(500).send("Error cargando temas");
  }
});

// ------------------------------
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
