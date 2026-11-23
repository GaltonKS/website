"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { mountForecast } from "./scene";

/** The Forecast Engine page. The markup is static; mountForecast() draws the charts,
 *  runs the animations and wires up the controls and booking form. */
export default function ForecastSite() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return mountForecast(root.current);
  }, []);

  return (
    <div className="fc" ref={root}>
      <header className="top">
        <div className="wrap">
          <a className="logo" href="#top" aria-label="GaltonKS Forecast Engine, back to top">
            <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="lg-top" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1b2433" />
                  <stop offset="1" stopColor="#e3ad33" />
                </linearGradient>
                <linearGradient id="lg-mid" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#5d5a52" />
                  <stop offset="1" stopColor="#e9d9b3" />
                </linearGradient>
              </defs>
              <rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="#000815" stroke="#d4a032" strokeWidth="2" />
              <g transform="translate(4 11)">
                <path d="M2 30 L28 18 L54 30 L28 42 Z" fill="#253042" />
                <path d="M2 22 L28 10 L54 22 L28 34 Z" fill="url(#lg-mid)" />
                <path d="M2 14 L28 2 L54 14 L28 26 Z" fill="url(#lg-top)" stroke="#f2c14e" strokeWidth="0.8" />
              </g>
            </svg>
            GaltonKS <span>Forecast Engine</span>
          </a>
          <nav className="links" aria-label="Main">
            <a href="#features">Product</a>
            <a href="#stack">How it connects</a>
            <a href="#trust">Security</a>
            <a className="btn" href="#book">
              Book a walkthrough
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="wrap">
          <div className="hero">
            <h1>Forecasts you can check line by line.</h1>
            <p className="lede">
              Upload a business&apos;s monthly financials and get a twelve-month projection, with every assumption and
              formula behind it shown.
            </p>
            <div className="ctas">
              <a className="btn" href="#book">
                Book a walkthrough
              </a>
              <a className="tlink" href="#forecast-board">
                Try the live forecast
              </a>
            </div>

            <div className="board" id="forecast-board">
              <div className="board-head">
                <h2>Sample company: 24 months of actuals and a 12-month forecast</h2>
                <div className="legend" aria-hidden="true">
                  <span>
                    <i className="k-ink"></i>Actual revenue
                  </span>
                  <span>
                    <i className="k-fc"></i>Forecast revenue
                  </span>
                  <span>
                    <i className="k-ni"></i>Net income
                  </span>
                </div>
              </div>
              <svg
                id="chart"
                viewBox="0 0 1200 440"
                role="img"
                aria-label="Bar chart of monthly revenue: 24 months of actuals from January 2024 to December 2025, then a 12-month forecast. A line shows net income."
              ></svg>
              <div className="controls">
                <div className="ctl">
                  <label htmlFor="g">
                    Monthly revenue growth <b id="g-out"></b>
                  </label>
                  <input id="g" type="range" min="-2" max="8" step="0.1" />
                </div>
                <div className="ctl">
                  <label htmlFor="m">
                    Gross margin <b id="m-out"></b>
                  </label>
                  <input id="m" type="range" min="50" max="95" step="0.5" />
                </div>
                <div className="ctl">
                  <label htmlFor="o">
                    Monthly opex growth <b id="o-out"></b>
                  </label>
                  <input id="o" type="range" min="-2" max="6" step="0.1" />
                </div>
                <div className="result" aria-live="polite">
                  <small>Net income in month 12</small>
                  <strong id="ni12">$0</strong>
                  <button className="reset" id="reset" type="button" hidden>
                    Go back to the fitted drivers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="band" aria-label="The formulas the engine uses">
          <div className="band-inner">
            <div className="band-label">Six formulas. No black box. Every forecast shows exactly these.</div>
            <div className="track" id="track" aria-hidden="true"></div>
          </div>
        </div>

        <div className="wrap">
          <section id="features">
            <div className="feature">
              <div className="copy">
                <p className="kicker">Upload</p>
                <h2>Start from the numbers you already have.</h2>
                <p>
                  Export a profit and loss by month from any accounting system and upload it as a CSV. The engine checks
                  every row, totals each month, and flags gaps so a missing month never skews the trend.
                </p>
                <div className="links">
                  <a className="tlink" href="#forecast-board">
                    See the sample company
                  </a>
                </div>
              </div>
              <div className="visual" id="upload-vis">
                <div className="up">
                  <div>
                    <h4>sample_financials.csv, December 2025</h4>
                    <div className="csv-rows" id="csv-rows"></div>
                  </div>
                  <div className="arrow" aria-hidden="true"></div>
                  <div className="totals" id="totals">
                    <div className="head">December 2025 totals</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature flip">
              <div className="copy">
                <p className="kicker">Drivers</p>
                <h2>See every assumption and where it came from.</h2>
                <p>
                  Growth is fitted from the last twelve months, margins and cost baselines from recent averages. Each
                  driver comes with a plain explanation, and anything you change is marked as an override. Try the
                  sliders above and watch this panel update.
                </p>
                <div className="links">
                  <a className="tlink" href="#forecast-board">
                    Change a driver
                  </a>
                </div>
              </div>
              <div className="visual mathv">
                <div className="formulas">
                  <p className="vis-h">Month 12, worked out</p>
                  <div id="formulas"></div>
                </div>
                <div>
                  <p className="vis-h">Drivers</p>
                  <table className="drivers">
                    <tbody id="drivers"></tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="feature">
              <div className="copy">
                <p className="kicker">Scenarios</p>
                <h2>Test what-ifs side by side.</h2>
                <p>
                  Override any driver to model a price increase, a hiring plan or a slower year. Each scenario is saved
                  with its assumptions, so you can compare them with the base case and explain the difference.
                </p>
                <div className="links">
                  <a className="tlink" href="#book">
                    Book a walkthrough
                  </a>
                </div>
              </div>
              <div className="visual">
                <div className="chips" id="chips" role="group" aria-label="Scenarios"></div>
                <svg
                  id="scen"
                  viewBox="0 0 640 320"
                  role="img"
                  aria-label="Line chart comparing net income over 12 months for four scenarios"
                ></svg>
                <div className="scen-foot" id="scen-foot"></div>
              </div>
            </div>
          </section>

          <section id="stack">
            <div className="stack-head">
              <h2 className="sec-title">One engine behind your dashboards, portals and reports.</h2>
              <p>
                The engine runs as an API. Send it actuals, ask for a forecast, and get back numbers plus the reasoning,
                ready to show in whatever your team or your clients already use.
              </p>
            </div>
            <div className="flow">
              <svg
                id="flow"
                viewBox="0 0 1100 300"
                role="img"
                aria-label="Diagram: accounting exports flow into the Forecast Engine API, which feeds dashboards, client portals and reports."
              ></svg>
              <div className="code">
                <div>
                  <h4>Ask for a forecast with one override</h4>
                  <pre>
                    <span className="k">POST</span>
                    {` /tenants/{id}/forecasts\n{\n  "horizon_months": 12,\n  "overrides": { "revenue_growth": 0.02 }\n}`}
                  </pre>
                </div>
                <div>
                  <h4>Get numbers and the reasoning back</h4>
                  <pre>
                    {`"revenue_growth": {\n  "value": 0.02,\n  "method": `}
                    <span className="k">&quot;Scenario override&quot;</span>
                    {`,\n  "overridden": true\n},\n"formulas": { "revenue": "revenue[t] = …" }`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section id="trust">
            <h2 className="sec-title" style={{ maxWidth: "16ch" }}>
              Built to be trusted with client data.
            </h2>
            <div className="trust" style={{ marginTop: 40 }}>
              <div>
                <h3>Each client kept separate</h3>
                <p>Every query is scoped to one client. A forecast from one never appears under another.</p>
              </div>
              <div>
                <h3>Same inputs, same answer</h3>
                <p>The math is deterministic, so a forecast can be rerun and audited months later.</p>
              </div>
              <div>
                <h3>Honest about weak data</h3>
                <p>Short histories and missing months come back as warnings, not hidden guesses.</p>
              </div>
              <div>
                <h3>Key-based access</h3>
                <p>Every call except a health check needs an API key.</p>
              </div>
              <div>
                <h3>Corrections are safe</h3>
                <p>Re-uploading a month replaces that account&apos;s amount, with no double counting.</p>
              </div>
              <div className="next">
                <h3>Plain-language scenarios</h3>
                <p>Describe a what-if in words and an AI layer turns it into driver changes. The math stays the same.</p>
              </div>
            </div>
          </section>

          <section id="book">
            <div className="book">
              <div>
                <h2>See it run on your numbers.</h2>
                <p>
                  In 30 minutes we&apos;ll load a sample of your financials, walk through each driver, and show how
                  scenarios would work for you or your clients.
                </p>
                <ul>
                  <li>Bring a recent profit and loss export if you have one</li>
                  <li>We&apos;ll talk about how it fits your stack</li>
                  <li>No commitment, no slides</li>
                </ul>
              </div>
              <div>
                <form className="req" id="req" noValidate>
                  <div className="row">
                    <label>
                      Name
                      <input name="name" autoComplete="name" required />
                    </label>
                    <label>
                      Work email
                      <input name="email" type="email" autoComplete="email" required />
                    </label>
                  </div>
                  <label>
                    Company or firm
                    <input name="firm" autoComplete="organization" required />
                  </label>
                  <label>
                    What would you like to forecast?
                    <textarea name="note" placeholder="For example: monthly cash flow for our advisory clients"></textarea>
                  </label>
                  <label>
                    Times that suit you
                    <input name="times" placeholder="For example: Tue or Thu afternoons, ET" />
                  </label>
                  {/* honeypot, hidden from people and screen readers */}
                  <div style={{ position: "absolute", left: -9999 }} aria-hidden="true">
                    <label>
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                  <p className="err" id="err" role="alert"></p>
                  <div>
                    <button className="btn gold" type="submit" id="req-submit">
                      Request a walkthrough
                    </button>
                  </div>
                  <p className="privacy">
                    We use these details only to arrange the walkthrough. See our{" "}
                    <a href="/GaltonKS-Privacy-Policy.pdf">privacy policy</a>.
                  </p>
                </form>
                <div className="done" id="done" tabIndex={-1} role="status">
                  <h3>Request sent</h3>
                  <p id="done-msg">We&apos;ll email you to find a time that works.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer>
        <div className="wrap">
          <div>
            <h4>GaltonKS Forecast Engine</h4>
            <p style={{ margin: 0, maxWidth: "34ch" }}>
              Driver-based forecasts with the math shown. Sample data on this page is synthetic.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <a href="#features">Upload</a>
              </li>
              <li>
                <a href="#features">Drivers</a>
              </li>
              <li>
                <a href="#features">Scenarios</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/">GaltonKS home</Link>
              </li>
              <li>
                <a href="#trust">Security</a>
              </li>
              <li>
                <a href="#book">Book a walkthrough</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
