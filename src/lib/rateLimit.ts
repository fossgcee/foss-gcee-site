type RateLimitEntry = {
  count: number;
  reset: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number;
};

const getStore = () => {
  const globalAny = globalThis as typeof globalThis & {
    __rateLimitStore?: Map<string, RateLimitEntry>;
  };
  if (!globalAny.__rateLimitStore) {
    globalAny.__rateLimitStore = new Map();
  }
  return globalAny.__rateLimitStore;
};

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp ? realIp.trim() : "unknown";
};

export const rateLimit = (key: string, limit: number, windowMs: number): RateLimitResult => {
  const store = getStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.reset) {
    const reset = now + windowMs;
    store.set(key, { count: 1, reset });
    return { allowed: true, remaining: limit - 1, reset };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, reset: existing.reset };
  }

  existing.count += 1;
  store.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, reset: existing.reset };
};
