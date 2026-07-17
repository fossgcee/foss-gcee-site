# Direct Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the member registration system to save user details directly in MongoDB, bypassing OTP verification.

**Architecture:** We will reuse the `/api/register/send-otp` route, converting it to directly validate and save registrations as verified in MongoDB. We will modify `RegistrationPortal.tsx` to directly submit to `/api/register/send-otp` and transition straight to the success screen.

**Tech Stack:** Next.js (App Router), Mongoose, React, TypeScript

---

### Task 1: Clean up temporary test files

**Files:**
- Delete: `test-db.js`
- Delete: `test-mail.js`

- [ ] **Step 1: Delete test-db.js and test-mail.js**
  Run commands to delete these two temporary scripts in the root directory.

- [ ] **Step 2: Commit cleanup**
  ```bash
  git rm -f test-db.js test-mail.js
  git commit -m "chore: remove temporary database and mail testing scripts"
  ```

---

### Task 2: Backend API Route (`/api/register/send-otp`)

**Files:**
- Modify: `src/app/api/register/send-otp/route.ts`

- [ ] **Step 1: Rewrite route handler to perform direct registration**
  Replace the contents of `src/app/api/register/send-otp/route.ts` with code that connects to the database, normalizes user details, checks for duplicates, and creates/saves the `Registration` record directly with `otpVerified: true`.

  ```typescript
  import { NextResponse } from "next/server";
  import dbConnect from "@/lib/db";
  import Registration from "@/models/Registration";
  import { getClientIp, rateLimit } from "@/lib/rateLimit";

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown error";
  };

  export async function POST(request: Request) {
    try {
      const ip = getClientIp(request);
      const ipLimit = rateLimit(`otp:ip:${ip}`, 5, 10 * 60 * 1000);
      if (!ipLimit.allowed) {
        return NextResponse.json(
          { success: false, error: "Too many requests. Try again later." },
          { status: 429, headers: { "Retry-After": Math.ceil((ipLimit.reset - Date.now()) / 1000).toString() } }
        );
      }

      await dbConnect();
      const body = await request.json();
      const { name, email, linkedin, phone, year, department } = body;

      if (!name || !email || !linkedin || !phone || !year || !department) {
        return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedPhone = String(phone).replace(/\s+/g, "").trim();

      const emailLimit = rateLimit(`otp:email:${normalizedEmail}`, 3, 10 * 60 * 1000);
      if (!emailLimit.allowed) {
        return NextResponse.json(
          { success: false, error: "Too many registration requests. Please wait a bit." },
          { status: 429, headers: { "Retry-After": Math.ceil((emailLimit.reset - Date.now()) / 1000).toString() } }
        );
      }

      // Check if phone or email is already registered
      const existingByPhone = await Registration.findOne({ phone: normalizedPhone, otpVerified: true }).select("email");
      if (existingByPhone && existingByPhone.email?.toLowerCase() !== normalizedEmail) {
        return NextResponse.json({ success: false, error: "This mobile number is already registered." }, { status: 400 });
      }

      const existingByEmail = await Registration.findOne({ email: normalizedEmail, otpVerified: true }).select("email");
      if (existingByEmail) {
        return NextResponse.json({ success: false, error: "This email is already registered." }, { status: 400 });
      }

      // Save directly with otpVerified: true
      await Registration.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            name,
            email: normalizedEmail,
            linkedin,
            phone: normalizedPhone,
            year,
            department,
            otpVerified: true,
            approved: false,
            role: "Member",
          },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );

      return NextResponse.json({ success: true, message: "Registration complete!" });
    } catch (error: unknown) {
      console.error("Direct registration error:", error);
      return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Commit backend route updates**
  ```bash
  git add src/app/api/register/send-otp/route.ts
  git commit -m "feat(api): convert send-otp endpoint to direct registration"
  ```

---

### Task 3: Frontend Component (`RegistrationPortal.tsx`)

**Files:**
- Modify: `src/components/RegistrationPortal.tsx`

- [ ] **Step 1: Simplify the step machine state and form submission**
  Update the step state to transition directly to `"success"`, and remove all OTP-related inputs and UI states. Also update the submit button text from "SEND_OTP" to "REGISTER".

  ```tsx
  // ... imports and DEPARTMENTS/YEARS/SOCIALS remain the same

  type Step = "form" | "success"; // Removed "otp"

  // ... interfaces and Field/SelectField components remain the same

  export default function RegistrationPortal() {
    const [step, setStep] = useState<Step>("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormData>({
      name: "", email: "", linkedin: "", phone: "+91 ", year: "", department: "",
    });

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const normalizedLinkedin = form.linkedin.startsWith("http")
          ? form.linkedin
          : `https://${form.linkedin}`;
        const res = await fetch("/api/register/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, linkedin: normalizedLinkedin }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setStep("success");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    // ... handleFormSubmit block and SUCCESS SCREEN (remains exactly as is, except header text update if any)
  ```

  Wait, in the render method, simplify:
  - Header:
    ```tsx
    <p className="font-mono text-[10px] text-black/40 dark:text-white/30 tracking-[0.3em] uppercase">
      Registration Details
    </p>
    <h1 className="text-[1.35rem] sm:text-3xl font-pixel text-black dark:text-white leading-tight break-all sm:break-normal">
      JOIN_FOSS_CLUB
    </h1>
    <p className="font-mono text-xs text-black/50 dark:text-white/40 mt-1">
      Fill in your details to request membership.
    </p>
    ```
  - Progress indicator:
    We can remove the progress indicator div entirely, since there is only a single page to the form.
  - Submit Button:
    ```tsx
    <button
      type="submit"
      disabled={loading}
      className="w-full h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-pixel text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>REGISTER <ArrowRight className="w-4 h-4" /></>}
    </button>
    ```

- [ ] **Step 2: Commit frontend updates**
  ```bash
  git add src/components/RegistrationPortal.tsx
  git commit -m "feat(ui): simplify registration form to register directly without OTP step"
  ```

---

### Task 4: Verification and Browser Testing

- [ ] **Step 1: Test user registration flow via browser**
  Submit a new user form via the `/join` page in the browser. Verify that registration succeeds immediately, showing the success screen with details, and no OTP input step is shown.
