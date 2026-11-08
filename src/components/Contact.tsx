"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import kitchenPhoto from "@/assets/photos/kitchen-review.jpg";
import { AUM, ROLES, submitContact, validateContact, type ContactRequest } from "@/lib/contact";

const EMPTY: ContactRequest = { name: "", email: "", firm: "", role: "", aum: "", message: "", website: "" };
type Errors = Partial<Record<keyof ContactRequest, string>>;

export default function Contact() {
  const [form, setForm] = useState<ContactRequest>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [failure, setFailure] = useState("");

  const set = (k: keyof ContactRequest) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      await submitContact(form);
      setState("sent");
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "The request didn't go through.");
      setState("failed");
    }
  }

  const input =
    "mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-ink placeholder:text-muted/60 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/30";
  const border = (k: keyof ContactRequest) => (errors[k] ? "border-bad" : "border-rule");

  return (
    <section id="contact" className="relative overflow-hidden bg-navy py-24 text-on-navy sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 bottom-0 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(227,173,51,0.3), transparent 65%)" }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl">
            See it on a portfolio you know.
          </h2>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-on-navy-muted">
            Tell us about your practice and we&apos;ll set up a 30-minute walkthrough. Bring a holdings export if
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

          <motion.figure
            className="relative mt-10 max-w-[30rem]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src={kitchenPhoto}
                alt="An advisor and a client review printed charts together at a kitchen island."
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover object-[60%_35%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent" />
            </div>
            <figcaption className="absolute -bottom-4 left-4 rounded-full border border-white/12 bg-navy/80 px-4 py-2 text-sm text-on-navy backdrop-blur">
              30 minutes, on a portfolio you choose
            </figcaption>
          </motion.figure>
        </div>

        <div className="on-paper rounded-2xl bg-card p-6 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8">
          <AnimatePresence mode="wait">
            {state === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[26rem] flex-col items-start justify-center"
                role="status"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-good/10 text-good">
                  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                    <path d="M5 11.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 className="mt-5 font-serif text-3xl text-navy">Request sent</h3>
                <p className="mt-3 max-w-[26rem] leading-relaxed text-muted">
                  Thanks, {form.name.split(" ")[0]}. We&apos;ll email {form.email} to find a time that works.
                </p>
                <button
                  type="button"
                  className="mt-6 text-sm font-medium text-gold-dark underline underline-offset-4"
                  onClick={() => {
                    setForm(EMPTY);
                    setState("idle");
                  }}
                >
                  Send another request
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Name" error={errors.name}>
                    <input
                      id="f-name"
                      autoComplete="name"
                      className={`${input} ${border("name")}`}
                      value={form.name}
                      onChange={set("name")}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "e-name" : undefined}
                    />
                  </Field>
                  <Field id="email" label="Work email" error={errors.email}>
                    <input
                      id="f-email"
                      type="email"
                      autoComplete="email"
                      className={`${input} ${border("email")}`}
                      value={form.email}
                      onChange={set("email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "e-email" : undefined}
                    />
                  </Field>
                  <Field id="firm" label="Firm" error={errors.firm}>
                    <input
                      id="f-firm"
                      autoComplete="organization"
                      className={`${input} ${border("firm")}`}
                      value={form.firm}
                      onChange={set("firm")}
                      aria-invalid={!!errors.firm}
                      aria-describedby={errors.firm ? "e-firm" : undefined}
                    />
                  </Field>
                  <Field id="role" label="Your role" optional>
                    <select id="f-role" className={`${input} ${border("role")}`} value={form.role} onChange={set("role")}>
                      <option value="">Choose one</option>
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="aum" label="Assets under management" optional>
                      <select id="f-aum" className={`${input} ${border("aum")}`} value={form.aum} onChange={set("aum")}>
                        <option value="">Choose a range</option>
                        {AUM.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="message" label="Anything we should know?" optional error={errors.message}>
                      <textarea
                        id="f-message"
                        rows={4}
                        className={`${input} ${border("message")} resize-y`}
                        placeholder="What you'd like to see, how many clients you serve, when you're free"
                        value={form.message}
                        onChange={set("message")}
                      />
                    </Field>
                  </div>
                  {/* honeypot, hidden from people and screen readers */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label>
                      Website
                      <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                    </label>
                  </div>
                </div>

                {state === "failed" && (
                  <p className="mt-5 rounded-lg border border-bad/30 bg-bad/[0.06] px-4 py-3 text-sm text-bad" role="alert">
                    {failure}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="mt-6 w-full rounded-full bg-navy px-6 py-3.5 font-medium text-on-navy transition-colors hover:bg-[#13213a] disabled:opacity-70"
                >
                  {state === "sending" ? "Sending request…" : "Request a meeting"}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-muted">
                  We use these details only to arrange the meeting. See our{" "}
                  <a href="/GaltonKS-Privacy-Policy.pdf" className="underline underline-offset-2 hover:text-ink">
                    privacy policy
                  </a>
                  .
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`e-${id}`} className="mt-1.5 text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mt-1 shrink-0 text-gold-bright" aria-hidden="true">
      <path d="M4 9.5l3 3 7-7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
