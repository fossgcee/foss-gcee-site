const requiredEnvVars = [
  "MONGODB_URI",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    // Always warn — never throw, as this runs at build time and would
    // crash static page collection (/_not-found, /, etc.) on Vercel
    // if env vars are not yet set in the deployment environment.
    console.warn(`[WARNING] Missing environment variables: ${missing.join(", ")}`);
  }
}

// Automatically validate on import
validateEnv();
