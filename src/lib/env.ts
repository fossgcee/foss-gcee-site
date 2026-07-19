const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
] as const;

let hasWarned = false;

export function validateEnv() {
  if (hasWarned) return;
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    // Always warn — never throw, as this runs at build time and would
    // crash static page collection (/_not-found, /, etc.) on Vercel
    // if env vars are not yet set in the deployment environment.
    console.warn(`[WARNING] Missing environment variables: ${missing.join(", ")}`);
    hasWarned = true;
  }
}

// Automatically validate on import
validateEnv();
