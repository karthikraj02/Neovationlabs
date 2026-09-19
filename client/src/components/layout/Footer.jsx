// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { Link } from "react-router-dom";
import { Code2, Users, AtSign, Mail, Phone } from "lucide-react";
import Container from "../ui/Container";
import Logo from "../ui/Logo";
import InstagramIcon from "../ui/InstagramIcon";
import WhatsAppIcon from "../ui/WhatsAppIcon";

const columns = [
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Services", to: "/services" },
      { label: "Demos", to: "/demos" },
      { label: "Book a Live Demo", to: "/book-demo" },
      { label: "Technology", to: "/technology" },
      { label: "Insights", to: "/insights" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Generative AI", to: "/services/generative-ai" },
      { label: "Software Development", to: "/services/custom-software" },
      { label: "Computer Vision", to: "/services/computer-vision" },
      { label: "AI Agents", to: "/services/agentic-workflows" },
      { label: "Data Engineering", to: "/services/data-engineering" },
      { label: "MLOps", to: "/services/mlops" },
      { label: "Predictive Analytics", to: "/services/predictive-analytics" },
      { label: "Networking", to: "/services/networking" },
      { label: "Internet of Things", to: "/services/iot" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

// One number, written once. `tel:` needs the +country code with no spaces,
// and wa.me needs the digits only (no +).
const PHONE_DISPLAY = "+91 99017 23492";
const PHONE_TEL = "tel:+919901723492";
const WHATSAPP_URL = "https://wa.me/919901723492";

const social = [
  { icon: Users, href: "https://www.linkedin.com/company/neovation-labs-in/", label: "LinkedIn" },
  { icon: InstagramIcon, href: "https://www.instagram.com/neovationlabs/", label: "Instagram" },
  { icon: Code2, href: "https://github.com", label: "GitHub" },
  { icon: AtSign, href: "https://x.com", label: "X" },
  { icon: Mail, href: "mailto:neovationlabs@outlook.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-void">
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <span className="font-display text-lg font-medium tracking-tight text-ink">
                NeovationLabs
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-dim">
              AI engineering for what's next.
            </p>

            <div className="mt-6">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
                Call or WhatsApp
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <a
                  href={PHONE_TEL}
                  aria-label={`Call ${PHONE_DISPLAY}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors duration-300 hover:border-signal-dim hover:text-signal"
                >
                  <Phone size={14} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chat with us on WhatsApp at ${PHONE_DISPLAY}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors duration-300 hover:border-signal-dim hover:text-signal"
                >
                  <WhatsAppIcon size={14} />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-signal"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading} className="col-span-1 md:col-span-1">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
                {col.heading}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-dim transition-colors duration-300 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-ink-faint">
            © 2026 NeovationLabs. All rights reserved.
          </p>
          <p className="font-mono text-xs text-ink-faint">
            <a
              href="https://beautiful-alpaca-6b1495.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-signal"
            >
              Built by dev
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
