"use client";

import Image from "next/image";
import { GitHubIcon, YouTubeIcon, InstagramIcon, DiscordIcon, LinkedInIcon, EmailIcon } from "@/components/icons/SocialIcons";

const quickLinks = [
  { label: "About",      href: "#about" },
  { label: "What We Do", href: "#whatwedo" },
  { label: "Events",     href: "#community" },
  { label: "Join Us",    href: "#join" },
];

const socials = [
  { Icon: GitHubIcon,    href: "https://github.com/fossgcee",                               label: "GitHub",    active: true },
  { Icon: YouTubeIcon,   href: "https://www.youtube.com/channel/UCTtzkb23e6iQAMMkgigHQqQ", label: "YouTube",   active: true },
  { Icon: InstagramIcon, href: "https://www.instagram.com/fossgcee/",                       label: "Instagram", active: true },
  { Icon: DiscordIcon,   href: "https://discord.com/invite/d6SUMn4JF",                      label: "Discord",   active: true },
  { Icon: LinkedInIcon,  href: "#",                                                          label: "LinkedIn",  active: false },
  { Icon: EmailIcon,     href: "mailto:fossgcee@gmail.com",                                 label: "Email",     active: true },
];

export default function Footer() {
  return (
    <footer
      className="relative border-t"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "#060606" }}
    >
      <style>{`
        .footer-link:hover { color: #ffffff !important; }
        .footer-icon:hover  { color: #ffffff !important; transform: scale(1.15); }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Brand & Connect */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image src="/foss_gcee_logo.png" alt="FOSSGCEE" width={64} height={64} className="rounded-full object-contain" />
              <span className="font-pixel text-[12px]" style={{ color: "#ffffff" }}>FOSSGCEE</span>
            </div>
            {/* Connect moved below log/brand */}
            <div className="flex flex-wrap gap-2">
              {socials.map(({ Icon, href, label, active }) => (
                <a
                  key={label}
                  href={active ? href : undefined}
                  target={active && !href.startsWith("mailto") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={active ? label : `${label} (coming soon)`}
                  title={active ? label : `${label} — coming soon`}
                  className={`footer-icon w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200${!active ? " opacity-30 pointer-events-none" : ""}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="footer-link font-mono text-xs flex items-center gap-1.5 transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Contact Us
            </h4>
            <div className="space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Department of Information Technology,
                <br />
                Administrative Block,
                <br />
                Government College of Engineering,
                <br />
                Erode - 638316
              </p>
              <p className="font-mono text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                fossgcee@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            &gt;_ Built by students, powered by <span style={{ color: "#ffffff" }}>open source</span>
          </p>
          <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} FOSSGCEE · Made with ♥ in Erode
          </p>
        </div>
      </div>
    </footer>
  );
}
