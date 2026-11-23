/* Real output of forecast-engine (github.com/GaltonKS/forecast-engine) run on its
   synthetic sample_data/sample_financials.csv. Regenerate if the sample or engine changes. */

/** Monthly totals: [period, revenue, cogs, opex, other]. */
export const HIST: [string, number, number, number, number][] = [
  ["2024-01", 93107, 16897, 71448, 400], ["2024-02", 95451, 16745, 72599, 389],
  ["2024-03", 103025, 17914, 77030, 392], ["2024-04", 101077, 18209, 76410, 395],
  ["2024-05", 106309, 18334, 76851, 403], ["2024-06", 109882, 19945, 78296, 415],
  ["2024-07", 114942, 20683, 78144, 400], ["2024-08", 115591, 21113, 82092, 404],
  ["2024-09", 121950, 21944, 80132, 408], ["2024-10", 128017, 22439, 81030, 398],
  ["2024-11", 125901, 22087, 83506, 415], ["2024-12", 130423, 23550, 85130, 397],
  ["2025-01", 138062, 24739, 85335, 399], ["2025-02", 142047, 23993, 90204, 408],
  ["2025-03", 147264, 25768, 91901, 412], ["2025-04", 150225, 25713, 88900, 386],
  ["2025-05", 153402, 26176, 89366, 415], ["2025-06", 161073, 27499, 95210, 420],
  ["2025-07", 166180, 27948, 96507, 386], ["2025-08", 169155, 29683, 96674, 419],
  ["2025-09", 181674, 30119, 97589, 411], ["2025-10", 180533, 32391, 101643, 410],
  ["2025-11", 186462, 32073, 98807, 408], ["2025-12", 199982, 34678, 101502, 389],
];

/** Drivers fitted by engine/forecast.py fit_drivers(), with the engine's own explanations. */
export const FIT = {
  revenue_base: { value: 188992.05, method: "Average revenue of the last 3 months" },
  revenue_growth: { value: 0.0327813, method: "Log-linear trend fit over the last 12 months" },
  gross_margin: { value: 0.8275877, method: "(revenue − cogs) / revenue over the last 6 months" },
  opex_base: { value: 100650.62, method: "Average opex of the last 3 months" },
  opex_growth: { value: 0.0146135, method: "Log-linear trend fit over the last 12 months" },
  other_net: { value: 403.85, method: "Average net other income of the last 6 months" },
};

/** The December 2025 rows of the sample CSV: [account, category, amount]. */
export const DEC: [string, "revenue" | "cogs" | "opex" | "other", number][] = [
  ["Subscription revenue", "revenue", 181323.36],
  ["Services revenue", "revenue", 18658.42],
  ["Hosting", "cogs", 28596.21],
  ["Payment processing", "cogs", 6081.35],
  ["Salaries", "opex", 78165.64],
  ["Rent", "opex", 6000.0],
  ["Marketing", "opex", 17335.9],
  ["Interest income", "other", 389.07],
];
