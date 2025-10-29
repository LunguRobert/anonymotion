// scripts/latency-monitor.cjs
// Loghează p50/p95/p99 pentru endpoint-uri, direct în fișier.
// Compatibil Git Bash / CMD / PowerShell, fără TTY/tee.

const fs   = require('fs');
const path = require('path');

// ---- Config prin ENV / CLI ----
const BASE     = process.env.BASE_URL || 'http://localhost:3000';
const INTERVAL = parseInt(process.env.INTERVAL_MS || '60000', 10);
const SAMPLES  = parseInt(process.env.SAMPLES || '10', 10);
const TARGETS  = (process.env.TARGETS || '/api/posts?limit=9,/api/posts?limit=25,/api/posts/stream')
  .split(',').map(s => s.trim()).filter(Boolean);

let LOG_FILE  = 'latency.log';
let APPEND    = (process.env.LOG_APPEND || '1') === '1';
let NO_STDOUT = (process.env.NO_STDOUT  || '0') === '1';

// CLI flags: --log=..., --overwrite, --no-stdout
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--log=')) LOG_FILE = arg.slice('--log='.length);
  if (arg === '--overwrite') APPEND = false;
  if (arg === '--no-stdout') NO_STDOUT = true;
}
if (!path.isAbsolute(LOG_FILE)) LOG_FILE = path.join(process.cwd(), LOG_FILE);

// ---- Utilitare ----
function pct(arr, p) {
  if (!arr.length) return 0;
  const a = arr.slice().sort((x, y) => x - y);
  const i = Math.ceil((p / 100) * a.length) - 1;
  return a[Math.max(0, i)];
}

function logLine(obj) {
  const line = JSON.stringify(obj);
  try { fs.appendFileSync(LOG_FILE, line + '\n', 'utf8'); }
  catch (e) { console.error('Failed to write log:', e?.message || e); console.log(line); }
  if (!NO_STDOUT && process.stdout.isTTY) console.log(line);
}

async function probeOnce(url) {
  const t0 = Date.now();
  try { await fetch(url, { cache: 'no-store' }); } catch {}
  return Date.now() - t0;
}

let warmed = false;
async function runOnce() {
  if (!warmed) {
    for (const t of TARGETS) { try { await fetch(BASE + t); } catch {} }
    warmed = true;
  }
  for (const t of TARGETS) {
    const samples = [];
    for (let i = 0; i < SAMPLES; i++) samples.push(await probeOnce(BASE + t));
    logLine({
      ts: new Date().toISOString(),
      base: BASE,
      target: t,
      n: samples.length,
      p50: pct(samples, 50),
      p95: pct(samples, 95),
      p99: pct(samples, 99),
      min: Math.min(...samples),
      max: Math.max(...samples),
    });
  }
}

async function main() {
  if (!APPEND) { try { fs.writeFileSync(LOG_FILE, '', 'utf8'); } catch {} }
  logLine({ ts: new Date().toISOString(), event: 'start', base: BASE, targets: TARGETS, intervalMs: INTERVAL, samples: SAMPLES, log: LOG_FILE });
  await runOnce();
  setInterval(runOnce, INTERVAL);
}

main().catch(err => {
  logLine({ ts: new Date().toISOString(), event: 'fatal', error: String(err) });
  process.exit(1);
});
