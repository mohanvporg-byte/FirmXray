import pg from "pg";
import Redis from "ioredis";
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
redis.connect().catch(() => console.warn("Redis unavailable: CVE cache disabled"));
export const q = (text, params) => pool.query(text, params);
