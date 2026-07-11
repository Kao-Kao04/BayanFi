/**
 * Preflight environment check.
 * Runs before db:migrate/db:seed to fail fast with a friendly, actionable
 * message instead of a cryptic Prisma/driver error.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const problems = [];

if (!fs.existsSync(envPath)) {
  console.error('\n[BayanFi] Missing .env file.');
  console.error('  Fix: copy .env.example to .env, then set DATABASE_URL.\n');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
const get = (key) => {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : '';
};

const dbUrl = get('DATABASE_URL');

if (!dbUrl) {
  problems.push('DATABASE_URL is empty.');
} else if (dbUrl.includes('[YOUR-PASSWORD]')) {
  problems.push('DATABASE_URL still contains the [YOUR-PASSWORD] placeholder.');
} else if (!/^postgres(ql)?:\/\//.test(dbUrl)) {
  problems.push('DATABASE_URL does not look like a PostgreSQL connection string.');
}

for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY']) {
  if (!get(key)) problems.push(`${key} is not set.`);
}
if (get('ENCRYPTION_KEY') && get('ENCRYPTION_KEY').length < 32) {
  problems.push('ENCRYPTION_KEY must be at least 32 characters.');
}

if (problems.length > 0) {
  console.error('\n[BayanFi] Environment is not ready:\n');
  for (const p of problems) console.error('  - ' + p);
  console.error('\n  Edit .env and try again. For Supabase, use the Session-mode');
  console.error('  (port 5432) connection string from Project Settings -> Database.\n');
  process.exit(1);
}

console.log('[BayanFi] Environment looks good. Proceeding...');
