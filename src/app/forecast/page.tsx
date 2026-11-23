import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "./forecast.css";
import ForecastSite from "@/components/forecast/ForecastSite";

export const metadata: Metadata = {
  title: "GaltonKS Forecast Engine: forecasts you can check line by line",
  description:
    "Upload a business's monthly financials and get a twelve-month projection, with every assumption and formula behind it shown.",
};

export default function ForecastPage() {
  return <ForecastSite />;
}
