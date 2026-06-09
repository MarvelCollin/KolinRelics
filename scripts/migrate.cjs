const fs = require("fs");
const path = require("path");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const { Client } = require("pg");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const REGION = process.env.SUPABASE_DB_REGION || "aws-1-ap-southeast-1";
const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");

if (!PROJECT_REF || !PASSWORD) {
  console.error("Missing SUPABASE_PROJECT_REF or SUPABASE_DB_PASSWORD in .env");
  process.exit(1);
}

async function main() {
  const client = new Client({
    host: `${REGION}.pooler.supabase.com`,
    port: 6543,
    database: "postgres",
    user: `postgres.${PROJECT_REF}`,
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await client.query("select name from public._migrations");
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`apply ${file}`);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public._migrations(name) values($1)", [file]);
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw new Error(`${file} failed: ${err.message}`);
    }
  }

  await client.end();
  console.log("done.");
}

main().catch((err) => {
  console.error("FAILED:", err && (err.stack || err.message || err));
  process.exit(1);
});
