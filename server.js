import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

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

const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 🔹 Página principal (galería + subida)
app.get("/", async (req, res) => {
  res.render("index");
});

// 🔹 Subir imagen
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

// 🔹 Obtener fotos
app.get("/fotos", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: "cumple-romi/",
      max_results: 100
    });
    const urls = resources.resources.map((r) => r.secure_url);
    res.json(urls);
  } catch (error) {
    console.error("Error al obtener imágenes de Cloudinary:", error);
    res.json([]);
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
