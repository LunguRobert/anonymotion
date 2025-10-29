// src/lib/rate-limit.js
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---- Helpers
function getClientIP(req) {
  // încearcă diverse headere folosite în proxy/CDN; fallback local
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return (
    ip ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

// ---- Config buckets
const MEM_POSTS_WINDOW =
  Number(process.env.RL_POSTS5M_MS || 300_000); // 5min implicit în dev

const memLimits = {
  common:      { limit: 60, windowMs: 60_000 },
  strict:      { limit: 20, windowMs: 60_000 },
  posts5m:     { limit: 1,  windowMs: MEM_POSTS_WINDOW },
  feedback1m:  { limit: 3,  windowMs: 60_000 },
  login:       { limit: 10, windowMs: 60_000 },
};

// ---- Upstash (prod)
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.DISABLE_REDIS !== '1';

const redis = hasUpstash ? Redis.fromEnv() : undefined;

const ratelimitUpstash = hasUpstash
  ? {
      // 60 req / min / actor
      common:     new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m") }),
      // 20 mutative / min / actor
      strict:     new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m") }),
      // 1 post / 5 min / actor
      posts5m:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(1,  "5 m") }),
      // 3 feedback / min / actor
      feedback1m: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3,  "1 m") }),
      // login/register/verify
      login:      new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
    }
  : null;

// ---- Fallback in-memory (dev)
const memStore = globalThis.__RL_MEM__ ?? new Map();
globalThis.__RL_MEM__ = memStore;

function memLimit(key, bucket) {
  const cfg = memLimits[bucket] ?? memLimits.common;
  const now = Date.now();
  const rec = memStore.get(key);

  if (!rec || now > rec.resetAt) {
    const resetAt = now + cfg.windowMs;
    memStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: cfg.limit,
      remaining: cfg.limit - 1,
      reset: Math.ceil(resetAt / 1000),
    };
  }

  if (rec.count >= cfg.limit) {
    return {
      success: false,
      limit: cfg.limit,
      remaining: 0,
      reset: Math.ceil(rec.resetAt / 1000),
    };
  }

  rec.count += 1;
  memStore.set(key, rec);
  return {
    success: true,
    limit: cfg.limit,
    remaining: cfg.limit - rec.count,
    reset: Math.ceil(rec.resetAt / 1000),
  };
}

/**
 * Limitează cererea pentru un „actor”:
 *  - dacă `session?.user?.id` există → per utilizator
 *  - altfel → per IP
 *
 * Usage:
 *   const session = await getServerSession(authOptions)
 *   const limited = await enforceRateLimit(req, "posts5m", session)
 *   if (limited) return limited
 */
export async function enforceRateLimit(req, bucket = "common", session) {
const actor =
  (session?.user?.id && `u:${session.user.id}`) ||
  (session?.user?.email && `e:${session.user.email}`) ||
  `ip:${getClientIP(req)}`;

  const key = `rl:${bucket}:${actor}`;

  // Upstash (prod) sau mem (dev)
  let result;
  if (ratelimitUpstash && ratelimitUpstash[bucket]) {
    const data = await ratelimitUpstash[bucket].limit(key);
    // Upstash returnează deja limit/remaining/reset
    result = {
      success: data.success,
      limit: data.limit,
      remaining: data.remaining,
      reset: data.reset,
    };
  } else {
    result = memLimit(key, bucket);
  }

    if (!result.success) {
    // normalizează reset la milisecunde (poate veni în sec sau ms)
    const resetMs =
      typeof result.reset === "number"
        ? (result.reset < 1e12 ? result.reset * 1000 : result.reset)
        : Date.now() + (memLimits[bucket]?.windowMs ?? 60_000);

    const retryAfter = Math.max(1, Math.ceil((resetMs - Date.now()) / 1000)); // secunde până la reset

    const headers = {
      "content-type": "application/json",
      "Retry-After": String(retryAfter),                        // secunde corecte
      "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),  // UNIX seconds
      "X-RateLimit-Limit": String(result.limit ?? ""),
      "X-RateLimit-Remaining": String(result.remaining ?? ""),
    };

    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      { status: 429, headers }
    );
  }

  return null; // OK

}
