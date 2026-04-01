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
      className="relative border-t bg-bg border-border-2"
    >
      <style>{`
        .footer-link:hover { color: var(--text) !important; }
        .footer-icon:hover  { color: var(--text) !important; transform: scale(1.15); }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/foss_gcee_logo.png" alt="FOSSGCEE" width={44} height={44} className="rounded-full object-contain filter dark:invert-0 light:invert" />
              <span className="font-pixel text-[9px] text-text">FOSSGCEE</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-muted-2">
              Free and Open Source Software Club at Government College of Engineering, Erode.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest mb-5 text-muted">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="footer-link font-mono text-xs flex items-center gap-1.5 transition-colors duration-200 text-muted-2"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="text-muted">›</span> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest mb-5 text-muted">
              Connect
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {socials.map(({ Icon, href, label, active }) => (
                <a
                  key={label}
                  href={active ? href : undefined}
                  target={active && !href.startsWith("mailto") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={active ? label : `${label} (coming soon)`}
                  title={active ? label : `${label} — coming soon`}
                  className={`footer-icon w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 bg-surface border border-border text-muted-2${!active ? " opacity-30 pointer-events-none" : ""}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
            <p className="font-mono text-xs text-muted">fossgcee@gmail.com</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border"
        >
          <p className="font-mono text-xs text-muted">
            &gt;_ Built by students, powered by <span className="text-text">open source</span>
          </p>
          <p className="font-mono text-xs text-muted-2">
            © {new Date().getFullYear()} FOSSGCEE · Made with ♥ in Erode
          </p>
        </div>
      </div>
    </footer>
  );
}
