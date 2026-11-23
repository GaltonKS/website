import Script from "next/script";

/** Public Acuity scheduling page, used for the "Schedule a meeting" fallback link. */
export const ACUITY_URL = "https://galtonks.as.me/";

const EMBED_SRC = "https://app.acuityscheduling.com/schedule.php?owner=40758280&ref=embedded_csp";

/** The GaltonKS Acuity calendar, embedded inline. Acuity's embed.js resizes the frame to fit its content. */
export default function AcuityScheduler({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <iframe
        src={EMBED_SRC}
        title="Schedule a meeting with GaltonKS"
        width="100%"
        height="800"
        frameBorder="0"
        allow="payment"
        loading="lazy"
        style={{ display: "block", border: 0, width: "100%", minHeight: 640 }}
      />
      <Script src="https://embed.acuityscheduling.com/js/embed.js" strategy="lazyOnload" />
    </div>
  );
}
