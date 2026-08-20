import { Mail, MapPin, Clock } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import ContactForm from "../components/ContactForm";
import InstagramIcon from "../components/ui/InstagramIcon";
import { usePageMeta } from "../hooks/usePageMeta";

const details = [
  { icon: Mail, label: "Primary Email", value: "neovationlabs@outlook.com", href: "mailto:neovationlabs@outlook.com" },
  { icon: Mail, label: "Official Support", value: "neovationlabs.official@gmail.com", href: "mailto:neovationlabs.official@gmail.com" },
  { icon: InstagramIcon, label: "Instagram", value: "@neovationlabs", href: "https://www.instagram.com/neovationlabs/" },
  { icon: Clock, label: "Response time", value: "Within 1 business day" },
  { icon: MapPin, label: "Working with clients", value: "Remote-first, worldwide" },
];

export default function Contact() {
  usePageMeta("Contact", "Tell us about the problem you're solving. We'll follow up with next steps, usually within a business day.");
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Build Something Intelligent."
        description="Tell us about the problem you're solving. We'll follow up with next steps, usually within a business day."
      />

      <section className="bg-void pb-24 md:pb-32">
        <Container className="grid gap-14 md:grid-cols-[0.9fr_1.4fr] md:gap-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
              Get in touch
            </div>
            <ul className="mt-6 space-y-6">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-signal">
                    <Icon size={15} />
                  </span>
                  <div>
                    <div className="text-xs text-ink-faint">{label}</div>
                    {href ? (
                      <a
                        href={href}
                        className="mt-0.5 block text-sm text-ink transition-colors hover:text-signal hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <div className="mt-0.5 text-sm text-ink">{value}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ContactForm />
        </Container>
      </section>
    </>
  );
}
