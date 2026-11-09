import LiveShot from "./LiveShot";

// Two product screens side by side, after Meuze's product pairs: the screen's name, one line
// on what it's for, and the live shot above.
const ITEMS = [
  {
    app: "stress",
    name: "Stress test",
    title: "See the loss before the market does.",
    body: "Run preset or custom scenarios against a client's holdings and see the effect by sector, asset class and position, in dollars.",
    alt: "The stress test screen: a broad market sell-off moves the portfolio −14.6%, a change of −$187,298.",
    cardAlt: "Largest losses by position under a broad sell-off, led by AAPL at −2.20%, or −$28,322.",
    cardWidth: "56%",
    cardTop: "34%",
  },
  {
    app: "review",
    name: "Review prep",
    title: "Know what changed since the last meeting.",
    body: "Every measure compared with the previous version of the portfolio, next to the client's tolerance and recent activity.",
    alt: "The review prep screen comparing the October and November versions of the Whitfield portfolio.",
    cardAlt: "What changed: effective independent bets rose from 1.3 to 1.6 and positions fell from 22 to 16.",
    cardWidth: "64%",
    cardTop: "28%",
  },
];

export default function Showcase() {
  return (
    <section className="on-paper bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="max-w-[40rem] font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
          Built for the client meeting, not the spreadsheet.
        </h2>
        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-8">
          {ITEMS.map((it) => (
            <article key={it.app}>
              <LiveShot app={it.app} alt={it.alt} cardAlt={it.cardAlt} cardWidth={it.cardWidth} cardTop={it.cardTop} />
              <p className="mt-6 font-medium text-navy">{it.name}</p>
              <h3 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.01em] text-ink">{it.title}</h3>
              <p className="mt-3 max-w-[30rem] text-lg leading-relaxed text-muted">{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
