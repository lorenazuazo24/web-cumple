import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// configuración de vistas
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// configuración de multer
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// genera el QR para la página de subida
app.get("/", async (req, res) => {
  const urlSubida = `${req.protocol}://${req.get("host")}/subir`;
  const qr = await QRCode.toDataURL(urlSubida); // genera base64
  res.render("index", { qr });
});

// página de subida
app.get("/subir", (req, res) => res.render("subir"));

// endpoint de subida
app.post("/upload", upload.single("foto"), (req, res) => res.redirect("/"));

// lista de fotos
app.get("/fotos", (req, res) => {
  const dir = path.join(__dirname, "public/uploads");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  res.json(files);
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
