import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "@/components/forecast/forecast.css";
import ForecastSite from "@/components/forecast/ForecastSite";

export const metadata: Metadata = {
  title: "GaltonKS Forecast Engine: forecasts you can check line by line",
  description:
    "Upload a business's monthly financials and get a twelve-month projection, with every assumption and formula behind it shown.",
};

/** The home page is the Forecast Engine. The advisor product's page is at /advisors. */
export default function Home() {
  return <ForecastSite />;
}
