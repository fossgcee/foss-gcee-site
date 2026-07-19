import { supabase } from "./supabase";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number;
};

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp ? realIp.trim() : "unknown";
};

export const rateLimit = async (
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> => {
  const now = new Date();
  
  // Opportunistic prune: delete rows that expired more than 1 hour ago
  const pruneThreshold = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  supabase
    .from("rate_limits")
    .delete()
    .lt("window_start", pruneThreshold)
    .then(({ error }: { error: any }) => {
      if (error) console.error("Rate limit prune error:", error);
    });

  // Check if a rate limit entry exists
  const { data: entry, error: fetchError } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (fetchError) {
    console.error("Rate limit fetch error:", fetchError);
    return { allowed: true, remaining: limit - 1, reset: Date.now() + windowMs };
  }

  if (!entry) {
    // Insert new rate limit entry
    const resetTime = Date.now() + windowMs;
    const { error: insertError } = await supabase
      .from("rate_limits")
      .insert({
        key,
        count: 1,
        window_start: now.toISOString(),
        window_ms: windowMs,
      });

    if (insertError) {
      console.error("Rate limit insert error:", insertError);
    }
    return { allowed: true, remaining: limit - 1, reset: resetTime };
  }

  const windowStart = new Date(entry.window_start).getTime();
  const resetTime = windowStart + entry.window_ms;

  if (Date.now() > resetTime) {
    // Window expired, reset rate limit entry
    const newResetTime = Date.now() + windowMs;
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({
        count: 1,
        window_start: now.toISOString(),
        window_ms: windowMs,
      })
      .eq("key", key);

    if (updateError) {
      console.error("Rate limit reset update error:", updateError);
    }
    return { allowed: true, remaining: limit - 1, reset: newResetTime };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: resetTime };
  }

  // Increment counter
  const newCount = entry.count + 1;
  const { error: incrementError } = await supabase
    .from("rate_limits")
    .update({ count: newCount })
    .eq("key", key);

  if (incrementError) {
    console.error("Rate limit increment error:", incrementError);
  }

  return { allowed: true, remaining: limit - newCount, reset: resetTime };
};
