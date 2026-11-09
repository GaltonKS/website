import LiveShot from "./LiveShot";

const MEASURES = [
  {
    term: "Independent bets",
    body: "How many genuinely separate risks the portfolio holds once you account for holdings that rise and fall together.",
  },
  {
    term: "Share of risk from the market",
    body: "How much of the portfolio's movement comes from the market as a whole, with its beta to a broad index.",
  },
  {
    term: "Sector concentration",
    body: "Exposure by sector, and which sectors carry more of the risk than their weight in the portfolio suggests.",
  },
  {
    term: "Drawdown and stress",
    body: "The largest historical fall from a peak, plus preset and custom stress scenarios you can run with a client.",
  },
];

export default function Measures() {
  return (
    <section className="on-paper bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.2fr]">
          <div>
            <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
              Twenty-two holdings can still behave like one bet.
            </h2>
            <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-muted">
              A client with two dozen positions often looks diversified on a statement. Galton measures how the
              holdings actually move together. In this portfolio, 96% of the risk comes from a single shared factor.
            </p>
          </div>

          <LiveShot
            app="overview"
            alt="The GaltonKS overview for the Whitfield household: 22 holdings, 1.3 effective independent bets, sector exposure and downside."
            cardAlt="Where the risk comes from: the largest common factor accounts for 96% of the portfolio's risk."
            cardWidth="60%"
            cardTop="30%"
          />
        </div>

        <dl className="mt-20 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {MEASURES.map((m) => (
            <div key={m.term} className="border-t border-ink/15 pt-5">
              <dt className="font-medium text-navy">{m.term}</dt>
              <dd className="mt-2 leading-relaxed text-muted">{m.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
