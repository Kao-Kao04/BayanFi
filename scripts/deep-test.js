/**
 * Deep end-to-end test of the full demo golden path.
 * Tests every click a judge would make.
 */
const BASE = 'http://localhost:4000';
const ISSUES = [];

const ok  = (n, d) => console.log(`  ✅ ${n}${d ? ': '+d : ''}`);
const err = (n, d) => { console.log(`  ❌ ${n}: ${d}`); ISSUES.push({ n, d }); };
const inf = (n, d) => console.log(`  ℹ️  ${n}: ${d}`);

async function post(url, body, token) {
  const h = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  return fetch(url, { method: 'POST', headers: h, body: JSON.stringify(body) });
}
async function get(url, token) {
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

async function main() {
  console.log('\n🔬 BayanFi Deep End-to-End Test\n');

  // ── LOGIN ────────────────────────────────────────────────────────────
  console.log('── 1. Auth ───────────────────────────────────────');
  const lr = await (await post(`${BASE}/v1/auth/login`, { email: 'juan@bayanfi.io', password: 'BayanFi@2026' })).json();
  const juanToken = lr.data?.accessToken;
  juanToken ? ok('juan login') : err('juan login', lr.error?.message);

  const ar = await (await post(`${BASE}/v1/auth/login`, { email: 'admin@bayanfi.io', password: 'BayanFi@2026' })).json();
  const adminToken = ar.data?.accessToken;
  adminToken ? ok('admin login') : err('admin login', ar.error?.message);

  const sr = await (await post(`${BASE}/v1/auth/login`, { email: 'store@bayanfi.io', password: 'BayanFi@2026' })).json();
  const storeToken = sr.data?.accessToken;
  storeToken ? ok('store login') : err('store login', sr.error?.message);

  // ── BENEFICIARY PROFILE ──────────────────────────────────────────────
  console.log('\n── 2. Beneficiary Profile ────────────────────────');
  const benR = await (await get(`${BASE}/v1/beneficiaries/me`, juanToken)).json();
  const ben = benR.data;
  if (ben?.firstName) {
    ok(`Profile exists: ${ben.firstName} ${ben.lastName}, ${ben.city}`);
  } else {
    err('Profile missing', `${benR.error?.message} — Apply button will fail without this`);
    // Create it so the rest of the test works
    console.log('  → Creating profile automatically...');
    const cr = await post(`${BASE}/v1/beneficiaries`, {
      firstName: 'Juan', lastName: 'Dela Cruz',
      dateOfBirth: '2004-03-12', addressLine1: '123 Rizal St',
      barangay: 'Poblacion', city: 'Quezon City',
      province: 'Metro Manila', region: 'NCR',
    }, juanToken);
    const cj = await cr.json();
    cj.data?.id ? ok('Profile created') : err('Profile creation failed', cj.error?.message);
  }

  // ── WALLET ───────────────────────────────────────────────────────────
  console.log('\n── 3. Stellar Wallet (sponsored reserves) ────────');
  const wR = await (await get(`${BASE}/v1/wallets/me`, juanToken)).json();
  const wallets = wR.data || [];
  if (wallets.length > 0) {
    const w = wallets[0];
    ok(`Wallet exists: ${w.publicKey?.slice(0,8)}...`);
    w.balanceXlm === '0' || w.balanceXlm === '0.0000000'
      ? ok(`Sponsored reserves confirmed: 0 XLM`)
      : inf('XLM balance', w.balanceXlm);
    // Check live Horizon balance
    const hR = await fetch(`https://horizon-testnet.stellar.org/accounts/${w.publicKey}`);
    if (hR.ok) {
      const hJ = await hR.json();
      ok(`On-chain confirmed: num_sponsored=${hJ.num_sponsored}, sponsor=${hJ.sponsor?.slice(0,8)}...`);
    } else {
      err('Horizon lookup', `HTTP ${hR.status}`);
    }
  } else {
    err('No wallet', 'Will try creating one...');
    const cw = await post(`${BASE}/v1/wallets`, {}, juanToken);
    const cwJ = await cw.json();
    cwJ.data?.publicKey
      ? ok(`Wallet created: ${cwJ.data.publicKey.slice(0,8)}... (0 XLM sponsored)`)
      : err('Wallet creation', cwJ.error?.message);
  }

  // ── PROGRAMS + APPLY ─────────────────────────────────────────────────
  console.log('\n── 4. Programs & Apply Flow ──────────────────────');
  const pR = await (await get(`${BASE}/v1/public/programs`)).json();
  const programs = pR.data || [];
  programs.length > 0
    ? ok(`Programs visible: ${programs.map(p => p.name.slice(0, 25)).join(', ')}`)
    : err('No programs', 'Seed may have failed');

  if (programs.length > 0 && juanToken) {
    // Check existing applications first
    const appsR = await (await get(`${BASE}/v1/applications`, juanToken)).json();
    const existing = (appsR.data || []).filter(a => a.programId === programs[0].id && a.status !== 'CANCELLED');

    if (existing.length > 0) {
      ok(`Application already exists for ${programs[0].name.slice(0,25)}: status=${existing[0].status}`);
    } else {
      const apR = await post(`${BASE}/v1/applications`, { programId: programs[0].id }, juanToken);
      const apJ = await apR.json();
      apJ.data?.id
        ? ok(`Apply works: applicationId=${apJ.data.id.slice(0,8)}... status=${apJ.data.status}`)
        : err('Apply failed', apJ.error?.message);
    }
  }

  // ── AI CHAT ──────────────────────────────────────────────────────────
  console.log('\n── 5. AI Chat (Gemini) ───────────────────────────');
  const aiR = await (await post(`${BASE}/v1/ai/chat`, { message: 'Am I eligible for the scholarship program?' }, juanToken)).json();
  const reply = aiR.data?.reply || '';
  const isGemini = reply.length > 30 && !reply.includes('temporarily unavailable');
  isGemini
    ? ok(`Gemini responding: "${reply.slice(0, 70)}..."`)
    : err('AI chat fallback', `Got: "${reply.slice(0, 60)}" — is AI service running?`);

  // ── ON-CHAIN TRANSPARENCY ────────────────────────────────────────────
  console.log('\n── 6. On-Chain Transparency ──────────────────────');
  if (programs.length > 0) {
    const ocR = await (await get(`${BASE}/v1/public/programs/${programs[0].id}/onchain`)).json();
    const oc = ocR.data;
    if (oc?.verified) {
      ok(`Verify on Stellar works`);
      ok(`Funding wallet: ${oc.fundingWallet?.slice(0,8)}...`);
      ok(`Explorer link: ${oc.explorerUrl?.slice(0, 50)}...`);
      inf('On-chain balances', JSON.stringify(oc.onChainBalances?.slice(0,1)));
    } else {
      err('On-chain verify', oc?.reason || 'not verified');
    }
  }

  // ── MERCHANT QR ──────────────────────────────────────────────────────
  console.log('\n── 7. Merchant QR Generation ─────────────────────');
  if (storeToken) {
    const qrR = await post(`${BASE}/v1/merchants/me/qr`, {}, storeToken);
    const qrJ = await qrR.json();
    if (qrJ.data?.qrCode) {
      const isDataUrl = qrJ.data.qrCode.startsWith('data:image/png;base64,');
      ok(`QR generated: ${isDataUrl ? 'valid PNG data URL ✓' : 'unexpected format'}`);
      ok(`Payment URI: ${qrJ.data.uri?.slice(0, 50)}...`);
    } else {
      err('QR generation', qrJ.error?.message);
    }
  }

  // ── NOTIFICATIONS ────────────────────────────────────────────────────
  console.log('\n── 8. Notifications ──────────────────────────────');
  const nR = await (await get(`${BASE}/v1/notifications`, juanToken)).json();
  Array.isArray(nR.data)
    ? ok(`Notifications endpoint works (${nR.data.length} notifications)`)
    : err('Notifications', nR.error?.message);

  // ── FRONTEND ROUTES ──────────────────────────────────────────────────
  console.log('\n── 9. All Frontend Routes ────────────────────────');
  const routes = [
    '/', '/transparency', '/login', '/register',
    '/beneficiary', '/beneficiary/programs', '/beneficiary/wallet',
    '/beneficiary/assistant', '/beneficiary/notifications',
    '/admin', '/merchant', '/merchant/qr',
    '/auditor',
  ];
  for (const route of routes) {
    try {
      const r = await fetch(`http://localhost:3000${route}`);
      r.ok ? ok(route) : err(route, `HTTP ${r.status}`);
    } catch {
      err(route, 'Frontend not running');
      break;
    }
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  if (ISSUES.length === 0) {
    console.log('🟢 Everything is working — good to demo!\n');
  } else {
    console.log(`🔴 ${ISSUES.length} issue(s) found:\n`);
    ISSUES.forEach(i => console.log(`   ❌ ${i.n}: ${i.d}`));
    console.log('');
  }
}

main().catch(e => console.error('Test error:', e.message));
