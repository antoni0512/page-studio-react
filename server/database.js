import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        slug VARCHAR(255) PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        business_name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        tagline VARCHAR(255),
        established VARCHAR(50),
        story_title VARCHAR(255),
        story TEXT,
        hero_image TEXT,
        address TEXT,
        hours VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(255),
        whatsapp VARCHAR(255),
        instagram VARCHAR(255),
        accent VARCHAR(50)
      );
    `);

    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) NOT NULL,
        page_slug VARCHAR(255) NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        PRIMARY KEY (page_slug, id)
      );
    `);

    // Create media table
    await client.query(`
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(255) NOT NULL,
        page_slug VARCHAR(255) NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
        type VARCHAR(50),
        url TEXT,
        alt VARCHAR(255),
        title VARCHAR(255),
        PRIMARY KEY (page_slug, id)
      );
    `);

    // Migrate databases created by older versions where child IDs were
    // globally unique. IDs only need to be unique within their own page.
    await client.query(`
      ALTER TABLE services DROP CONSTRAINT IF EXISTS services_pkey;
      ALTER TABLE services ALTER COLUMN id SET NOT NULL;
      ALTER TABLE services ALTER COLUMN page_slug SET NOT NULL;
      ALTER TABLE services ADD CONSTRAINT services_pkey PRIMARY KEY (page_slug, id);

      ALTER TABLE media DROP CONSTRAINT IF EXISTS media_pkey;
      ALTER TABLE media ALTER COLUMN id SET NOT NULL;
      ALTER TABLE media ALTER COLUMN page_slug SET NOT NULL;
      ALTER TABLE media ADD CONSTRAINT media_pkey PRIMARY KEY (page_slug, id);
    `);

    await client.query("COMMIT");
    console.log("Database initialized successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to initialize database:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
