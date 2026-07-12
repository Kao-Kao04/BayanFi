/**
 * BayanFi Pre-Demo Health Check
 * Run with: node scripts/health-check.js
 * Checks all critical endpoints before the demo.
 */

const BASE = 'http://localhost:4000';
const RESULTS = [];

function pass(name) {
  RESULTS.push({ name, status: 'PASS' });
  console.log(`  ✅ ${name}`);
}
function fail(name, detail) {
  RESULTS.push({ name, status: 'FAIL', detail });
  console.log(`  ❌ ${name} — ${detail}`);
}
function info(name, detail) {
  console.log(`  ℹ️  ${name}: ${detail}`);
}

async function get(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const r = await fetch(url, { headers });
  return r;
}
async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  return r;
}

async function main() {
  console.log('\n🔍 BayanFi Pre-Demo Health Check\n');

  // ── 1. STELLAR TESTNET ──────────────────────────────────────────────
  console.log('── Stellar Testnet ──────────────────────────────');
  try {
    const r = await get('https://horizon-testnet.stellar.org');
    r.ok ? pass('Horizon API reachable') : fail('Horizon API', `HTTP ${r.status}`);
  } catch (e) { fail('Horizon API', e.message); }

  const MASTER = 'GDI7ZF3BS25FXS4IO2AEJVJJ6RAA72MHEMV53RDIJ4JUXYXQ7HOJHRWX';
  const ORG    = 'GADRQH46TDRW46ZQ2DU2EZFKKUHU3X37GKXBTVWFWAJ6ITJ4UMDEKVJX';

  try {
    const r = await get(`https://horizon-testnet.stellar.org/accounts/${MASTER}`);
    if (r.ok) {
      const a = await r.json();
      const xlm = a.balances.find(b => b.asset_type === 'native');
      pass(`Master account exists (${parseFloat(xlm?.balance || 0).toFixed(0)} XLM, sponsoring ${a.num_sponsoring})`);
      if (parseFloat(xlm?.balance || 0) < 10) fail('Master XLM balance', `Only ${xlm?.balance} XLM — may run out of sponsoring capacity`);
    } else { fail('Master account', `HTTP ${r.status}`); }
  } catch (e) { fail('Master account', e.message); }

  try {
    const r = await get(`https://horizon-testnet.stellar.org/accounts/${ORG}`);
    if (r.ok) {
      const a = await r.json();
      const xlm = a.balances.find(b => b.asset_type === 'native');
      pass(`Org (DSWD) account exists (${parseFloat(xlm?.balance || 0).toFixed(0)} XLM)`);
    } else { fail('Org account', `HTTP ${r.status}`); }
  } catch (e) { fail('Org account', e.message); }

  // ── 2. BACKEND HEALTH ───────────────────────────────────────────────
  console.log('\n── Backend (localhost:4000) ─────────────────────');
  try {
    const r = await get(`${BASE}/health`);
    r.ok ? pass('Backend is up') : fail('Backend health', `HTTP ${r.status}`);
  } catch (e) { fail('Backend is up', `NOT RUNNING — ${e.message}`); return summarize(); }

  try {
    const r = await get(`${BASE}/health/ready`);
    const j = await r.json();
    const db = (j.data && j.data.database) ? j.data.database : j.database;
    db === 'up' ? pass(`Database connected`) : fail('Database', `status=${db}`);
  } catch (e) { fail('Database readiness', e.message); }

  // ── 3. PUBLIC ENDPOINTS (no auth) ──────────────────────────────────
  console.log('\n── Public Endpoints (no login) ──────────────────');
  try {
    const r = await get(`${BASE}/v1/public/stats`);
    if (r.ok) {
      const j = await r.json();
      const d = j.data;
      pass(`Public stats (${d.totalPrograms} programs, ${d.activeOrganizations} orgs)`);
      info('Budget', `${parseInt(d.totalBudget).toLocaleString()} USDC total`);
    } else { fail('Public stats', `HTTP ${r.status}`); }
  } catch (e) { fail('Public stats', e.message); }

  try {
    const r = await get(`${BASE}/v1/public/programs`);
    if (r.ok) {
      const j = await r.json();
      const progs = j.data;
      pass(`Public programs (${progs.length} active)`);

      // On-chain verify for first program
      if (progs.length > 0) {
        const pid = progs[0].id;
        const oc = await get(`${BASE}/v1/public/programs/${pid}/onchain`);
        if (oc.ok) {
          const ocj = await oc.json();
          ocj.data?.verified
            ? pass(`On-chain verify: ${progs[0].name.slice(0, 30)} — wallet ${ocj.data.fundingWallet?.slice(0,8)}...`)
            : fail('On-chain verify', ocj.data?.reason || 'not verified');
        } else { fail('On-chain verify', `HTTP ${oc.status}`); }
      }
    } else { fail('Public programs', `HTTP ${r.status}`); }
  } catch (e) { fail('Public programs', e.message); }

  // ── 4. AUTH FLOW ────────────────────────────────────────────────────
  console.log('\n── Auth Flow ─────────────────────────────────────');
  let juanToken, adminToken, storeToken;

  const logins = [
    { email: 'juan@bayanfi.io', label: 'Beneficiary (juan)', ref: v => juanToken = v },
    { email: 'admin@bayanfi.io', label: 'Admin', ref: v => adminToken = v },
    { email: 'store@bayanfi.io', label: 'Merchant (store)', ref: v => storeToken = v },
  ];

  for (const { email, label, ref } of logins) {
    try {
      const r = await post(`${BASE}/v1/auth/login`, { email, password: 'BayanFi@2026' });
      if (r.ok) {
        const j = await r.json();
        const token = j.data?.accessToken;
        if (token) { pass(`Login: ${label}`); ref(token); }
        else { fail(`Login: ${label}`, 'no token in response'); }
      } else {
        const j = await r.json().catch(() => ({}));
        fail(`Login: ${label}`, `HTTP ${r.status} — ${j.error?.message || ''}`);
      }
    } catch (e) { fail(`Login: ${label}`, e.message); }
  }

  // ── 5. BENEFICIARY FLOW ─────────────────────────────────────────────
  console.log('\n── Beneficiary Flow ──────────────────────────────');
  if (juanToken) {
    try {
      const r = await get(`${BASE}/v1/auth/me`, juanToken);
      r.ok ? pass('GET /auth/me') : fail('GET /auth/me', `HTTP ${r.status}`);
    } catch (e) { fail('GET /auth/me', e.message); }

    try {
      const r = await get(`${BASE}/v1/wallets/me`, juanToken);
      if (r.ok) {
        const j = await r.json();
        const wallets = j.data;
        wallets.length > 0
          ? pass(`Wallet exists: ${wallets[0].publicKey.slice(0,8)}... (${wallets[0].balanceUsdc} USDC, ${wallets[0].balanceXlm} XLM)`)
          : pass('Wallets endpoint works (no wallet yet — will create in demo)');
      } else { fail('GET /wallets/me', `HTTP ${r.status}`); }
    } catch (e) { fail('GET /wallets/me', e.message); }

    try {
      const r = await get(`${BASE}/v1/applications`, juanToken);
      r.ok ? pass('GET /applications') : fail('GET /applications', `HTTP ${r.status}`);
    } catch (e) { fail('GET /applications', e.message); }

    try {
      const r = await post(`${BASE}/v1/ai/chat`, { message: 'Am I eligible?' }, juanToken);
      if (r.ok) {
        const j = await r.json();
        pass(`AI chat: "${(j.data?.reply || '').slice(0, 50)}..."`);
      } else { fail('AI chat', `HTTP ${r.status}`); }
    } catch (e) { fail('AI chat', e.message); }

    try {
      const r = await get(`${BASE}/v1/notifications`, juanToken);
      r.ok ? pass('GET /notifications') : fail('GET /notifications', `HTTP ${r.status}`);
    } catch (e) { fail('GET /notifications', e.message); }
  }

  // ── 6. MERCHANT FLOW ────────────────────────────────────────────────
  console.log('\n── Merchant Flow ─────────────────────────────────');
  if (storeToken) {
    try {
      const r = await get(`${BASE}/v1/merchants/me`, storeToken);
      if (r.ok) {
        const j = await r.json();
        pass(`Merchant profile: ${j.data?.businessName}`);
      } else { fail('GET /merchants/me', `HTTP ${r.status}`); }
    } catch (e) { fail('GET /merchants/me', e.message); }
  }

  // ── 7. FRONTEND ─────────────────────────────────────────────────────
  console.log('\n── Frontend (localhost:3000) ─────────────────────');
  const webRoutes = [
    ['/', 'Landing page'],
    ['/transparency', 'Transparency dashboard'],
    ['/login', 'Login page'],
    ['/register', 'Register page'],
  ];
  for (const [path, label] of webRoutes) {
    try {
      const r = await fetch(`http://localhost:3000${path}`);
      r.ok ? pass(`${label} (${r.status})`) : fail(label, `HTTP ${r.status}`);
    } catch { fail(label, 'NOT RUNNING — start with npm run dev:web'); break; }
  }

  summarize();
}

function summarize() {
  const passed = RESULTS.filter(r => r.status === 'PASS').length;
  const failed = RESULTS.filter(r => r.status === 'FAIL');
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📊 Result: ${passed}/${RESULTS.length} passed`);
  if (failed.length === 0) {
    console.log('🟢 All checks passed — good to demo!\n');
  } else {
    console.log(`🔴 ${failed.length} issue(s) need attention:\n`);
    failed.forEach(f => console.log(`   ❌ ${f.name}: ${f.detail}`));
    console.log('');
  }
}

main().catch(e => { console.error('Check script error:', e.message); process.exit(1); });
