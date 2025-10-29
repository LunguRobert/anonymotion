/* scripts/simulate-users-live.cjs
 * Simulare realistă multi-actor: postări neregulate (respectă 1/5min), reacții corecte pe emoție,
 * jurnal 0–2/„zi de simulare” (bias spre 1), feedback 1/„zi de simulare”, reporturi ocazionale.
 *
 * Exemplu rulare (Faza A 3h):
 *   BASE_URL=http://localhost:3000 USERS=20 PASSWORD=Passw0rd! DURATION_MIN=180 SPEED=1 node scripts/simulate-users-live.cjs
 */

const BASE_URL       = process.env.BASE_URL || "http://localhost:3000";
const USERS          = parseInt(process.env.USERS || "20", 10);
const USERS_EMAILS   = (process.env.USERS_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
const PASSWORD       = process.env.PASSWORD || "Passw0rd!";
const DURATION_MIN   = parseInt(process.env.DURATION_MIN || "60", 10);
const SPEED          = Math.max(0.1, parseFloat(process.env.SPEED || "1"));
const SAME_IP        = process.env.SAME_IP === "1";
const START_JITTER_MS= parseInt(process.env.START_JITTER_MS || "90000", 10);
const QUIET          = process.env.QUIET === "1";

const PATH = {
  POSTS_GET:      process.env.POSTS_GET      || "/api/posts?limit=25",
  POSTS_POST:     process.env.POSTS_POST     || "/api/posts",
  REACTIONS_POST: process.env.REACTIONS_POST || "/api/reactions",
  JOURNAL_POST:   process.env.JOURNAL_POST   || "/api/journal",
  FEEDBACK_POST:  process.env.FEEDBACK_POST  || "/api/feedback",
  REPORTS_POST:   process.env.REPORTS_POST   || "/api/reports",
};

function wait(ms, { scale = true } = {}) {
  return new Promise(r => setTimeout(r, scale ? ms / SPEED : ms));
}
const waitReal = (ms) => wait(ms, { scale: false });
const now = () => Date.now();
const rand = (min, max) => Math.random() * (max - min) + min;
const choice = (a) => a[Math.floor(Math.random() * a.length)];

// Emoții din app
const emotions = ["SAD", "ANXIOUS", "HAPPY", "ANGRY", "NEUTRAL"];

// distribuție realistă pentru mood în jurnal (poți ajusta)
function pickMood() {
  const r = Math.random();
  if (r < 0.40) return "NEUTRAL";
  if (r < 0.60) return "HAPPY";
  if (r < 0.75) return "SAD";
  if (r < 0.90) return "ANXIOUS";
  return "ANGRY";
}


// Tipuri reale de reacții per emoție (numele tale)
const REACTION_MAP = {
  NEUTRAL: ['like','watch','think','thinkclear'],
  SAD:     ['hug','broken','support','empathy'],
  ANXIOUS: ['imhere','understand','supportive','calm'],
  ANGRY:   ['agreeangry','angry','disapprove','solidarity'],
  HAPPY:   ['congrat','love','smile','super'],
};

// inter-arrival exponential
function expMs(meanMs) {
  const u = 1 - Math.random();
  return -Math.log(u) * meanMs;
}

// Cookie jar simplu pentru fetch din Node
class CookieJar {
  constructor() { this.map = new Map(); }
  setFrom(res) {
    let cookies = [];
    if (typeof res.headers.getSetCookie === "function") {
      cookies = res.headers.getSetCookie();
    } else {
      const sc = res.headers.get("set-cookie");
      if (sc) cookies = sc.split(/,(?=\s*\w+=)/g);
    }
    for (const p of cookies) {
      const m = p.trim().match(/^([^=]+)=([^;]*)/);
      if (m) this.map.set(m[1], m[2]);
    }
  }
  header() {
    const arr = [];
    for (const [k, v] of this.map.entries()) arr.push(`${k}=${v}`);
    return arr.join("; ");
  }
}

class Client {
  constructor(base, ip) {
    this.base = base.replace(/\/$/, "");
    this.ip = ip;
    this.cookies = new CookieJar();
    this.serverSkew = 0;
    this.user = null; // { id, email }
  }

  async fetch(path, { method = "GET", headers = {}, body, followRedirect = false } = {}) {
    const url = path.startsWith("http") ? path : `${this.base}${path}`;
    const h = new Headers(headers);
    if (!h.has("x-forwarded-for")) h.set("x-forwarded-for", this.ip);
    if (!h.has("origin")) h.set("origin", this.base);
    if (!h.has("referer")) h.set("referer", this.base);
    const cookie = this.cookies.header();
    if (cookie) h.set("cookie", cookie);

    const res = await fetch(url, { method, headers: h, body, redirect: followRedirect ? "follow" : "manual" });

    this.cookies.setFrom(res);
    const dateHeader = res.headers.get("date");
    if (dateHeader) this.serverSkew = new Date(dateHeader).getTime() - Date.now();
    return res;
  }

  async ensureSession(email, password) {
    // deja logat?
    let sess = await this.fetch("/api/auth/session", { method: "GET" });
    if (sess.ok) {
      const data = await sess.json().catch(() => ({}));
      if (data?.user?.email) {
        this.user = { email: data.user.email, id: data.user.id || null };
        return true;
      }
    }
    // login
    if (!(await this.loginCredentials(email, password))) return false;

    // confirmare
    sess = await this.fetch("/api/auth/session", { method: "GET" });
    if (!sess.ok) return false;
    const data = await sess.json().catch(() => ({}));
    this.user = { email: data?.user?.email || email, id: data?.user?.id || null };
    return !!this.user.email;
  }

  async loginCredentials(email, password) {
    try {
      // 1) CSRF
      const csrfRes = await this.fetch("/api/auth/csrf");
      if (!csrfRes.ok) return false;
      const { csrfToken } = await csrfRes.json();

      // 2) callback credentials (fără auto-redirect)
      const form = new URLSearchParams();
      form.set("csrfToken", csrfToken);
      form.set("email", email);
      form.set("password", password);

      let res = await this.fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        followRedirect: false,
      });
      this.cookies.setFrom(res);

      // 3) urmărește manual până la 3 redirect-uri
      let hops = 0;
      while ([302, 303, 307, 308].includes(res.status) && hops < 3) {
        const loc = res.headers.get("location");
        if (!loc) break;
        res = await this.fetch(loc, { method: "GET", followRedirect: false });
        this.cookies.setFrom(res);
        hops++;
      }

      // 4) succes dacă nu avem 4xx final
      return res.status < 400;
    } catch {
      return false;
    }
  }

  // rate-limit helper
  retryAtFrom(res, body) {
    let c = [];
    const resetHeader = res.headers.get("x-ratelimit-reset") || res.headers.get("ratelimit-reset");
    if (resetHeader && /^\d+$/.test(resetHeader)) {
      const n = Number(resetHeader);
      c.push(n < 1e12 ? n * 1000 : n);
    }
    const ra = res.headers.get("retry-after");
    if (ra && /^\d+$/.test(ra)) {
      const n = Number(ra);
      c.push((Date.now() + this.serverSkew) + n * 1000);
    }
    if (body && (body.retryAt || body.nextAllowedAt || body.resetAt)) {
      const v = body.retryAt || body.nextAllowedAt || body.resetAt;
      const n = Number(v);
      c.push(!Number.isNaN(n) ? (n < 1e12 ? n * 1000 : n) : Date.parse(v));
    }
    c = c.filter(Number.isFinite);
    return c.length ? Math.max(...c) : null;
  }
}

// content generators
function genContent(i) {
  const a = ["Azi am învățat că", "Mă simt", "Mic progres:", "Încerc să", "Mi-e teamă că", "Sunt recunoscător pentru", "Observ că", "Mă frustrează", "Mă bucur că"];
  const b = ["lucrurile merg încet dar sigur.", "nu-i rău să o iei de la capăt.", "rutina chiar ajută.", "am exagerat ieri.", "mă ajută o pauză.", "azi e o zi bună.", "mai lucrez la asta mâine.", "am nevoie de feedback."];
  return `${choice(a)} ${choice(b)} (#${i})`;
}
function genJournal() {
  const t = ["Dimineața", "Munca", "Familia", "Sănătatea", "Obiceiurile", "Somnul", "Sportul"];
  const n = ["10 minute de respirație.", "plimbare scurtă.", "am evitat doomscrolling.", "mi-am notat 3 lucruri bune.", "am scris 15 minute.", "am băut apă mai multă."];
  return `${choice(t)} — ${choice(n)}`;
}
function genFeedback() {
  const items = ["Îmi place simplitatea.", "Aș vrea dark mode pe jurnal.", "Ar fi util reminder zilnic.", "Notificări mai discrete, pls.", "Performanța e bună și pe mobil."];
  return choice(items);
}
function genReportReason() {
  return choice(["abuz", "spam", "limbaj_inadecvat", "discriminare"]);
}

async function safeJson(res) { try { return await res.json(); } catch { return null; } }
async function getFeed(c) {
  const res = await c.fetch(PATH.POSTS_GET);
  if (!res.ok) return [];
  return res.json().catch(() => []);
}

// Plan pe „fereastra de simulare”: distribuim evenimentele în [now, now + horizonMs]
function planWindow(horizonMs) {
  const start = now(), endAt = start + horizonMs;

  // jurnal 0–2/„zi de simulare”, bias spre 1
  const r = Math.random();
  const count = r < 0.2 ? 0 : r < 0.9 ? 1 : 2;

  const journalTimes = [];
  for (let k = 0; k < count; k++) {
    const t = start + Math.pow(Math.random(), 0.6) * horizonMs; // bias spre final
    journalTimes.push(Math.floor(t));
  }
  journalTimes.sort((a, b) => a - b);

  // feedback 1/„zi de simulare” (pe la 40–90% din fereastră)
  const feedbackAt = start + (0.4 + Math.random() * 0.5) * horizonMs;

  // report ocazional: 20–40% șansă/fereastră
  const doReport = Math.random() < rand(0.2, 0.4);
  const reportAt = doReport ? start + rand(0.2, 0.9) * horizonMs : undefined;

  return { endAt, journalTimes, feedbackAt, reportAt };
}

// bucla per actor
async function actor(i, email) {
  const ip = SAME_IP ? "10.0.0.42" : `10.0.${Math.floor(i/250)}.${(i % 250) + 10}`;
  const c = new Client(BASE_URL, ip);

  const logged = await c.ensureSession(email, PASSWORD);
  if (!QUIET) console.log(`[u${i+1}] ${logged ? "logged in as " + email : "anonymous (login failed)"}`);

  if (START_JITTER_MS > 0) await wait(rand(0, START_JITTER_MS));

  const simEndsAt = now() + DURATION_MIN * 60_000;
  // Fereastra de planificare: maxim 24h, dar tăiată la durata simulării
  const HORIZON_MS = Math.min(24 * 60 * 60 * 1000, DURATION_MIN * 60_000);
  let windowPlan = planWindow(HORIZON_MS);

  // state pt cooldown la postări
  let postRetryAt = 0;
  // cache simplu ca să nu încercăm aceeași postare prea des
  const reactedRecently = new Map(); // postId -> expiresAt

  while (now() < simEndsAt) {
    // replan dacă am depășit fereastra curentă
    if (now() >= windowPlan.endAt) windowPlan = planWindow(HORIZON_MS);

    // 1) postări: încercări neregulate cu inter-arrival exp (~ 12-30 min)
    const nextPostAt    = now() + expMs(rand(12, 30) * 60_000);
    // 2) reacții: 1–3 min
    const nextReactAt   = now() + expMs(rand(1, 3)  * 60_000);
    // 3) jurnal
    const nextJournalAt = windowPlan.journalTimes.length ? windowPlan.journalTimes[0] : Infinity;
    // 4) feedback
    const nextFeedbackAt= windowPlan.feedbackAt ?? Infinity;
    // 5) report
    const nextReportAt  = windowPlan.reportAt ?? Infinity;

    const soonest = Math.min(nextPostAt, nextReactAt, nextJournalAt, nextFeedbackAt, nextReportAt, postRetryAt || Infinity);
    const sleepFor = Math.max(0, soonest - now());
    if (sleepFor > 0) {
      if (soonest === postRetryAt) await waitReal(sleepFor); // nu comprimăm rate-limit
      else await wait(sleepFor);
    }

    // eliberează blocajul când am ajuns la retry
    if (soonest === postRetryAt) { postRetryAt = 0; continue; }

    if (soonest === nextPostAt) {
      const content = genContent(i), emotion = choice(emotions);
      const res = await c.fetch(PATH.POSTS_POST, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, emotion }),
      });
      if (res.status === 201) {
        if (!QUIET) console.log(`[u${i+1}] post OK (${emotion})`);
      } else if (res.status === 429) {
        const body = await safeJson(res);
        const ra = c.retryAtFrom(res, body);
        if (ra) postRetryAt = ra;
        if (!QUIET) console.log(`[u${i+1}] post 429, retry @ ${new Date(ra||0).toLocaleTimeString()}`);
      } else if (res.status === 401) {
        // încearcă re-login o dată
        const relog = await c.ensureSession(email, PASSWORD);
        if (!relog && !QUIET) console.log(`[u${i+1}] post requires auth (login failed)`);
      }
      continue;
    }

    if (soonest === nextReactAt) {
      const feed = await getFeed(c);
      if (feed.length) {
        const myId = c.user?.id || null;

        // nu reacționăm la propria postare și evităm duplicatele deja în feed
        const candidates = feed.filter(p => {
          if (myId && p.userId === myId) return false;
          const already = Array.isArray(p.reactions) && myId
            ? p.reactions.some(r => r.userId === myId)
            : false;
          if (already) return false;
          const until = reactedRecently.get(p.id) || 0;
          if (Date.now() < until) return false;
          return true;
        });

        if (candidates.length) {
          // preferă postări mai recente
          const recent = candidates.slice(0, Math.min(15, candidates.length));
          const post = choice(recent);

          // alege un tip valid pentru emoția postării
          const allowed = REACTION_MAP[post.emotion] || REACTION_MAP.NEUTRAL;
          const type = choice(allowed);

          // marchează ca "reacționat recent" 15 min ca să evităm retry-uri dese pe aceeași
          reactedRecently.set(post.id, Date.now() + 15 * 60 * 1000);

          const res = await c.fetch(PATH.REACTIONS_POST, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ postId: post.id, type }),
          });

          if (!QUIET) {
            if (res.ok) console.log(`[u${i+1}] react ${type} -> ${post.id} (${post.emotion})`);
            else if (res.status === 401) console.log(`[u${i+1}] react requires auth`);
            else if (res.status === 409) console.log(`[u${i+1}] react duplicate (unique per post/user)`);
            else console.log(`[u${i+1}] react ${type} -> ${post.id} HTTP ${res.status}`);
          }
        }
      }
      continue;
    }

    if (soonest === nextJournalAt) {
      windowPlan.journalTimes.shift();
      const res = await c.fetch(PATH.JOURNAL_POST, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: genJournal(), mood: pickMood() }),
      });
      if (!QUIET) {
        if (res.ok) console.log(`[u${i+1}] journal OK`);
        else if (res.status === 401) console.log(`[u${i+1}] journal requires auth`);
        else console.log(`[u${i+1}] journal HTTP ${res.status}`);
      }
      continue;
    }

    if (soonest === nextFeedbackAt) {
      windowPlan.feedbackAt = undefined;
      const fbTypePool = ["PRAISE","FEATURE","BUG","OTHER"];
      const payload = { type: choice(fbTypePool), message: genFeedback() };
      // din când în când atașăm și un rating 3..5 (opțional în schema ta)
      if (Math.random() < 0.5) payload.rating = Math.floor(rand(3, 6));

      const res = await c.fetch(PATH.FEEDBACK_POST, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!QUIET) {
        if (res.ok) console.log(`[u${i+1}] feedback OK`);
        else console.log(`[u${i+1}] feedback HTTP ${res.status}`);
      }
      continue;
    }

    if (soonest === nextReportAt) {
      windowPlan.reportAt = undefined;
      const feed = await getFeed(c);
      if (feed.length) {
        const myId = c.user?.id || null;
        const candidates = feed.filter(p => !myId || p.userId !== myId);
        if (candidates.length) {
          const post = choice(candidates.slice(0, Math.min(20, candidates.length)));
          const res = await c.fetch(PATH.REPORTS_POST, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ postId: post.id, reason: genReportReason() }),
          });
          if (!QUIET) {
            if (res.ok) console.log(`[u${i+1}] report OK -> ${post.id}`);
            else console.log(`[u${i+1}] report HTTP ${res.status}`);
          }
        }
      }
      continue;
    }
  }

  if (!QUIET) console.log(`[u${i+1}] done`);
}

async function main() {
  const emails = USERS_EMAILS.length
    ? USERS_EMAILS
    : Array.from({ length: USERS }, (_, i) => `user${i+1}@test.local`);

  console.log(`Sim start @ ${BASE_URL} for ${DURATION_MIN} min (speed=${SPEED}x)`);
  console.log("Users:", emails.join(", "));

  await Promise.all(emails.map((e, i) => actor(i, e)));

  console.log("Simulation done.");
}

main().catch(err => { console.error(err); process.exit(1); });
