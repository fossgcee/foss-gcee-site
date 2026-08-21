import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Shared API utilities — centralised to avoid copy-paste drift across routes.
// ---------------------------------------------------------------------------

/** Simple email format check. */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/** Returns the canonical site URL, stripping any trailing slash. */
export const getSiteUrl = (): string =>
  (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://fossgcee.in"
  ).replace(/\/$/, "");

/** Returns the absolute URL to the FOSS Club logo used in emails. */
export const getLogoUrl = (): string => `${getSiteUrl()}/foss_gcee_logo.png`;

/**
 * Escapes the five HTML special characters to prevent XSS when inserting
 * user-supplied strings into email HTML templates.
 */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Escapes special regex metacharacters so a string can be safely interpolated
 * into a MongoDB `$regex` operator without ReDoS risk.
 */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Extracts the plain error message from an unknown thrown value.
 * NOTE: Only use server-side. Do NOT forward this directly to API clients —
 * use a generic message for the client and log the real error server-side.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  if (typeof error === "string") return error;
  return "Unknown error";
};
