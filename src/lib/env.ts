const requiredEnvVars = [
  "MONGODB_URI",
  "ADMIN_PASSWORD",
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    } else {
      console.warn(`[WARNING] Missing environment variables: ${missing.join(", ")}`);
    }
  }
}

// Automatically validate on import
validateEnv();
