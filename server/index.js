import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool, { initDb } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
const distDir = path.join(__dirname, "..", "dist");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (allowedTypes.has(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
});

function uploadOne(middleware, req, res, next) {
  middleware(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "The selected file is larger than 10 MB."
        : "The selected file type is not supported.";
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "The file could not be uploaded." });
  });
}

// Endpoint: File Upload
app.post("/api/upload", (req, res, next) => uploadOne(upload.single("file"), req, res, next), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.post("/api/upload/image", (req, res, next) => uploadOne(imageUpload.single("file"), req, res, next), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image was selected." });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Endpoint: Get Page by Slug
app.get("/api/pages/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const pageRes = await pool.query("SELECT * FROM pages WHERE slug = $1", [slug]);
    if (pageRes.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    const page = pageRes.rows[0];
    const servicesRes = await pool.query("SELECT id, title, description FROM services WHERE page_slug = $1", [slug]);
    const mediaRes = await pool.query("SELECT id, type, url, alt, title FROM media WHERE page_slug = $1", [slug]);

    // Map DB fields back to frontend camelCase API format
    const pageData = {
      slug: page.slug,
      status: page.status,
      businessName: page.business_name,
      category: page.category,
      tagline: page.tagline,
      established: page.established,
      storyTitle: page.story_title,
      story: page.story,
      heroImage: page.hero_image,
      address: page.address,
      hours: page.hours,
      email: page.email,
      phone: page.phone,
      whatsapp: page.whatsapp,
      instagram: page.instagram,
      accent: page.accent,
      services: servicesRes.rows,
      media: mediaRes.rows,
    };

    res.json(pageData);
  } catch (err) {
    console.error("Error retrieving page:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint: Save/Update Page
app.post("/api/pages", async (req, res) => {
  const page = req.body;
  if (!page.slug) {
    return res.status(400).json({ error: "Slug is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Upsert page metadata
    await client.query(
      `
      INSERT INTO pages (
        slug, status, business_name, category, tagline, established,
        story_title, story, hero_image, address, hours, email, phone,
        whatsapp, instagram, accent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (slug) DO UPDATE SET
        status = EXCLUDED.status,
        business_name = EXCLUDED.business_name,
        category = EXCLUDED.category,
        tagline = EXCLUDED.tagline,
        established = EXCLUDED.established,
        story_title = EXCLUDED.story_title,
        story = EXCLUDED.story,
        hero_image = EXCLUDED.hero_image,
        address = EXCLUDED.address,
        hours = EXCLUDED.hours,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        instagram = EXCLUDED.instagram,
        accent = EXCLUDED.accent;
    `,
      [
        page.slug,
        page.status || "draft",
        page.businessName,
        page.category,
        page.tagline,
        page.established,
        page.storyTitle,
        page.story,
        page.heroImage,
        page.address,
        page.hours,
        page.email,
        page.phone,
        page.whatsapp,
        page.instagram,
        page.accent,
      ]
    );

    // Recreate services
    await client.query("DELETE FROM services WHERE page_slug = $1", [page.slug]);
    if (page.services && page.services.length > 0) {
      for (const service of page.services) {
        await client.query(
          "INSERT INTO services (id, page_slug, title, description) VALUES ($1, $2, $3, $4)",
          [service.id, page.slug, service.title, service.description]
        );
      }
    }

    // Recreate media
    await client.query("DELETE FROM media WHERE page_slug = $1", [page.slug]);
    if (page.media && page.media.length > 0) {
      for (const item of page.media) {
        await client.query(
          "INSERT INTO media (id, page_slug, type, url, alt, title) VALUES ($1, $2, $3, $4, $5, $6)",
          [item.id, page.slug, item.type, item.url, item.alt, item.title]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Page saved successfully", slug: page.slug });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving page:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Render production hosting: serve the Vite build from this same web service.
// API and uploaded-file routes are registered first so they are not handled by
// the React single-page application fallback.
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
} else if (process.env.NODE_ENV === "production") {
  console.warn("Frontend build not found. Run `npm run build` before starting the server.");
}

// Initialize DB and start listening
const PORT = process.env.PORT || 5000;
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to database initialization failure:", err);
    process.exit(1);
  });
