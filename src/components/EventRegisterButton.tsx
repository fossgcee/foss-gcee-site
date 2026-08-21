"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import RegistrationModal from "@/components/RegistrationModal";

type EventRegisterButtonProps = {
  eventTitle: string;
  eventSlug: string;
  registrationMode?: "internal" | "external";
  externalRsvpUrl?: string;
  label?: string;
  className?: string;
  children?: ReactNode;
};

export default function EventRegisterButton({
  eventTitle,
  eventSlug,
  registrationMode = "internal",
  externalRsvpUrl = "",
  label,
  className,
  children,
}: EventRegisterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const baseClassName = className || "inline-flex items-center justify-center gap-3 px-10 py-5 rounded-[20px] bg-text text-bg font-pixel text-[12px] uppercase tracking-[0.15em] hover:scale-[1.05] active:scale-[0.98] shadow-[0_0_30px_var(--color-accent-glow)] border border-border-2 transition-all duration-300 cursor-pointer";

  let rsvpLabel = label;
  if (!rsvpLabel) {
    if (registrationMode === "external" && externalRsvpUrl) {
      if (externalRsvpUrl.includes("fossunited.org")) {
        rsvpLabel = "RSVP_ON_FOSSUNITED";
      } else if (externalRsvpUrl.includes("lu.ma")) {
        rsvpLabel = "RSVP_ON_LUMA";
      } else if (externalRsvpUrl.includes("devfolio")) {
        rsvpLabel = "RSVP_ON_DEVFOLIO";
      } else {
        rsvpLabel = "RSVP_EXTERNAL";
      }
    } else {
      rsvpLabel = "REGISTER_NOW";
    }
  }

  if (registrationMode === "external" && externalRsvpUrl) {
    return (
      <a
        href={externalRsvpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClassName}
      >
        {children ?? (
          <>
            {rsvpLabel} <ExternalLink className="w-4 h-4 shrink-0" />
          </>
        )}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={baseClassName}
      >
        {children ?? rsvpLabel}
      </button>
      <RegistrationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        eventTitle={eventTitle}
        eventSlug={eventSlug}
      />
    </>
  );
}
