const ITEMS = [
  {
    term: "Two-step sign-in",
    body: "Authenticator codes at sign-in, and a fresh code before sensitive actions such as deleting a client.",
  },
  {
    term: "Each firm's data kept apart",
    body: "Separation is enforced row by row in the database itself, not only in the application.",
  },
  {
    term: "An audit trail that can't be edited",
    body: "Questions, engine runs, replies and approvals are recorded append-only, with the engine version and a fingerprint of the holdings used.",
  },
  {
    term: "Verified advisors only",
    body: "New accounts stay pending until we check the advisor's CRD number. Until then they see nothing.",
  },
  {
    term: "Nothing cached in the browser",
    body: "Client data isn't stored on the device, and analytics are limited to anonymous page views.",
  },
  {
    term: "Client explanations you approve",
    body: "Replies meant for clients are drafts until you approve them, and edited drafts go through the number check again.",
  },
];

export default function Security() {
  return (
    <section id="security" className="on-paper border-t border-rule bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.6fr]">
          <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
            Built for the compliance review.
          </h2>
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <div key={it.term} className="border-t border-ink/15 pt-5">
                <dt className="font-medium text-navy">{it.term}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{it.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
