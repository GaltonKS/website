import AcuityScheduler, { ACUITY_URL } from "./AcuityScheduler";

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-navy py-24 text-on-navy sm:py-32">
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl">
            See it on a portfolio you know.
          </h2>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-on-navy-muted">
            Pick a time for a 30-minute walkthrough. Bring a holdings export if
            you like, and we&apos;ll run it live.
          </p>
          <ul className="mt-8 max-w-[30rem] space-y-3 text-on-navy-muted">
            <li className="flex gap-3">
              <Tick /> A risk profile and household profile, start to finish
            </li>
            <li className="flex gap-3">
              <Tick /> The number check and audit trail, up close
            </li>
            <li className="flex gap-3">
              <Tick /> Your questions about data, security and pricing
            </li>
          </ul>
        </div>

        <div className="on-paper overflow-hidden rounded-2xl bg-paper p-2 text-ink sm:p-3">
          <AcuityScheduler />
          <p className="px-4 pb-3 pt-2 text-center text-xs leading-relaxed text-muted">
            Calendar not loading?{" "}
            <a href={ACUITY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
              Open the booking page
            </a>
            . See our{" "}
            <a href="/GaltonKS-Privacy-Policy.pdf" className="underline underline-offset-2 hover:text-ink">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mt-1 shrink-0 text-on-navy" aria-hidden="true">
      <path d="M4 9.5l3 3 7-7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
