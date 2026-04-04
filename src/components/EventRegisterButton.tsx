"use client";

import { useState } from "react";
import RegistrationModal from "@/components/RegistrationModal";

type EventRegisterButtonProps = {
  eventTitle: string;
  eventSlug: string;
  label?: string;
  className?: string;
};

export default function EventRegisterButton({ eventTitle, eventSlug, label = "REGISTER_NOW", className }: EventRegisterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-text text-bg font-pixel text-[11px] uppercase tracking-widest hover:scale-[1.03] transition-transform"}
      >
        {label}
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
