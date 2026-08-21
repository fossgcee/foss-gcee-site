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
  label = "REGISTER_NOW",
  className,
  children,
}: EventRegisterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const baseClassName = className || "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-text text-bg font-pixel text-[11px] uppercase tracking-widest hover:scale-[1.03] transition-transform";

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
            RSVP_ON_FOSSUNITED <ExternalLink className="w-4 h-4" />
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
        {children ?? label}
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
