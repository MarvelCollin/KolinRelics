const path = require("path");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const { Client } = require("pg");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const REGION = process.env.SUPABASE_DB_REGION || "aws-1-ap-southeast-1";
const USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const EMAIL = `${USERNAME}@kolinrelics.local`;

if (!PROJECT_REF || !PASSWORD) {
  console.error("Missing SUPABASE_PROJECT_REF or SUPABASE_DB_PASSWORD in .env");
  process.exit(1);
}
if (!ADMIN_PASSWORD) {
  console.error("Missing ADMIN_PASSWORD in .env");
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

  const existing = await client.query(
    "select id, email from auth.users where email = $1",
    [EMAIL]
  );

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await client.query(
      "update auth.users set encrypted_password = crypt($1, gen_salt('bf')), updated_at = now() where id = $2",
      [ADMIN_PASSWORD, id]
    );
    console.log(`Updated password for existing user ${EMAIL}`);
  } else {
    const { rows } = await client.query(
      `insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
        'authenticated', 'authenticated', $1,
        crypt($2, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(), now(),
        '', '', '', ''
      ) returning id`,
      [EMAIL, ADMIN_PASSWORD]
    );
    const id = rows[0].id;

    await client.query(
      `insert into auth.identities (
        id, user_id, provider_id, provider, identity_data,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), $1::uuid, $1::text, 'email',
        jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true),
        now(), now(), now()
      )`,
      [id, EMAIL]
    );
    console.log(`Created admin user ${EMAIL}`);
  }

  await client.end();
  console.log("\nLogin with:");
  console.log(`  Username: ${USERNAME}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error("FAILED:", err && (err.stack || err.message || err));
  process.exit(1);
});
