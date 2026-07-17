# Design Spec: Direct Registration (Bypassing OTP)

## Overview
Due to SMTP authentication issues, the OTP verification step blocks all new club registrations. To simplify the registration flow and make it more robust, we are bypassing the OTP step entirely and routing registration straight to saving in MongoDB.

## Proposed Changes

### 1. API Route: `/api/register/send-otp`
We will rewrite `src/app/api/register/send-otp/route.ts` to act as the direct registration endpoint:
- Validate input fields (`name`, `email`, `linkedin`, `phone`, `year`, `department`).
- Check for existing verified registrations by email or phone.
- Save the details directly in the `Registration` collection with `otpVerified: true`.
- Attempt to send a confirmation/welcome email, but swallow any email dispatch errors to prevent blocking registration.

### 2. Frontend Component: `RegistrationPortal.tsx`
We will modify the portal:
- Set `step` directly to `"success"` upon receiving a successful response from `/api/register/send-otp`.
- Clean up unused OTP states, countdown timers, and verify/resend OTP handlers.
