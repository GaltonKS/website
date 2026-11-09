import LiveShot from "./LiveShot";

export default function Household() {
  return (
    <section id="household" className="on-paper bg-card py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 md:grid-cols-[1.2fr_0.9fr]">
        <LiveShot
          app="household"
          alt="The household profile screen in GaltonKS, with willingness questions for each partner, ability and need."
          cardAlt="Household profile: a ceiling of 5.7 out of 10, set by Amy Whitfield, with each partner's willingness shown as an estimate and a range."
          cardWidth="40%"
          cardTop="16%"
          cardRight="6%"
          className="order-last md:order-first"
        />
        <div>
          <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
            A risk profile that admits what it doesn&apos;t know.
          </h2>
          <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-muted">
            Galton separates how much risk a household wants, how much it can afford and how much its plan needs.
            Each is an estimate with a range, not a single score. Each partner answers for themselves, and the
            household ceiling never goes above what the more cautious partner, or the household&apos;s finances,
            can bear.
          </p>
          <p className="mt-4 max-w-[32rem] text-lg leading-relaxed text-muted">
            When the pieces disagree, Galton flags it, so the conversation with your client starts in the right
            place.
          </p>
        </div>
      </div>
    </section>
  );
}
