import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-navy-line bg-navy text-on-navy-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo onDark markWidth={30} />
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Footer">
          <a href="#how-it-works" className="hover:text-on-navy">
            How it works
          </a>
          <a href="#security" className="hover:text-on-navy">
            Security
          </a>
          <a href="/GaltonKS-Privacy-Policy.pdf" className="hover:text-on-navy">
            Privacy policy
          </a>
          <a href="#contact" className="hover:text-on-navy">
            Book a meeting
          </a>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-10 text-xs leading-relaxed text-on-navy-muted/70 sm:px-8">
        <p>
          © 2026 GaltonKS. Decision support for licensed financial professionals
          and does not provide investment advice to the public. Portfolio and household figures shown on this page
          are illustrative.
        </p>
      </div>
    </footer>
  );
}
