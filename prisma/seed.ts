import pg from "pg";
import { hash } from "bcryptjs";

const { Client } = pg;

// Use pooler at 6543 — port 5432 may be blocked by the local network
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  const email = "admin@playport.com";

  const { rows } = await client.query(
    'SELECT id FROM "User" WHERE email = $1',
    [email]
  );

  if (rows.length > 0) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  const password = await hash("admin1234", 12);
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 25);

  await client.query(
    `INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'ADMIN', NOW(), NOW())`,
    [id, email, "Admin", password]
  );

  console.log("Seeded admin user:");
  console.log("  Email:    admin@playport.com");
  console.log("  Password: admin1234");
  console.log("  Role:     ADMIN");
  console.log("\nChange this password after first login!");
}

main()
  .catch(console.error)
  .finally(() => client.end());
