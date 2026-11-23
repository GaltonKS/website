import { DEC, FIT, HIST } from "./data";

/* Draws and animates the Forecast Engine page inside `root` and wires up its controls.
   Everything it creates or listens to is torn down by the returned cleanup function,
   so React's double-mount in development and client navigation leave nothing behind. */

type Drivers = { g: number; m: number; o: number };
type Month = { rev: number; cogs: number; gp: number; opex: number; oi: number; ni: number };

const HORIZON = 12;
const N = HIST.length + HORIZON;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NS = "http://www.w3.org/2000/svg";

const fmtK = (v: number) => "$" + Math.round(v / 1000) + "k";
const fmt$ = (v: number) => (v < 0 ? "−$" : "$") + Math.abs(Math.round(v)).toLocaleString("en-US");
const pct = (v: number, d = 1) => (v * 100).toFixed(d) + "%";
const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const niceMax = (v: number) => {
  const raw = v * 1.12;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const s = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * mag >= raw) ?? 10;
  return s * mag;
};

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  parent: Element,
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent.appendChild(e);
  return e;
}

/** Same math as forecast-engine's engine/forecast.py project(). */
function project(d: Drivers): Month[] {
  const out: Month[] = [];
  for (let t = 1; t <= HORIZON; t++) {
    const rev = FIT.revenue_base.value * Math.pow(1 + d.g, t);
    const cogs = rev * (1 - d.m);
    const opex = FIT.opex_base.value * Math.pow(1 + d.o, t);
    const oi = rev - cogs - opex;
    out.push({ rev, cogs, gp: rev - cogs, opex, oi, ni: oi + FIT.other_net.value });
  }
  return out;
}

export function mountForecast(root: HTMLElement): () => void {
  const q = <T extends Element = HTMLElement>(id: string) => root.querySelector<T>("#" + id)!;
  const ac = new AbortController();
  const on = <E extends Event>(t: EventTarget, type: string, fn: (e: E) => void) =>
    t.addEventListener(type, fn as EventListener, { signal: ac.signal });
  const frames = new Set<number>();
  const raf = (fn: FrameRequestCallback) => {
    const id = requestAnimationFrame((t) => {
      frames.delete(id);
      fn(t);
    });
    frames.add(id);
  };
  const timers: number[] = [];
  const cleanups: (() => void)[] = [];
  const observers: IntersectionObserver[] = [];
  const onVisible = (node: Element, fn: () => void, threshold = 0.3) => {
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          fn();
        }
      },
      { threshold },
    );
    io.observe(node);
    observers.push(io);
  };
  // Containers this function fills; emptied again on cleanup.
  const filled: Element[] = [];
  const fill = <T extends Element>(e: T) => (filled.push(e), e);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fitted: Drivers = { g: FIT.revenue_growth.value, m: FIT.gross_margin.value, o: FIT.opex_growth.value };
  const drv: Drivers = { ...fitted };
  const histRows = HIST.map(([, rev, cogs, opex, oth]) => ({ rev, ni: rev - cogs - opex + oth }));

  /* ---------- hero chart ---------- */
  const svg = fill(q<SVGSVGElement>("chart"));
  const SMALL = innerWidth < 640;
  const W = SMALL ? 560 : 1200,
    Hh = SMALL ? 460 : 440,
    L = SMALL ? 52 : 64,
    R = SMALL ? 14 : 18,
    T = 26,
    B = 46;
  svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`);
  svg.classList.toggle("small", SMALL);
  const PW = W - L - R,
    PH = Hh - T - B,
    step = PW / N,
    bw = step * 0.68;
  const defs = el("defs", {}, svg);
  const pat = el("pattern", { id: "hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  el("rect", { width: 6, height: 6, fill: "rgba(212,160,50,.12)" }, pat);
  el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "rgba(212,160,50,.75)", "stroke-width": 2.2 }, pat);
  const gGrid = el("g", {}, svg),
    gBars = el("g", {}, svg),
    gLines = el("g", {}, svg),
    gLab = el("g", {}, svg);
  const xToday = L + HIST.length * step;
  el("rect", { x: xToday, y: T - 10, width: W - R - xToday, height: PH + 10, fill: "rgba(212,160,50,.07)" }, gGrid);
  const divider = el("line", { x1: xToday, x2: xToday, y1: T - 10, y2: T + PH, stroke: "#8A6D1F", "stroke-width": 1.5, "stroke-dasharray": "4 4" }, gGrid);
  const tLab = el("text", { x: xToday + 10, y: T + 6, "font-weight": 600, style: "fill:#8A6D1F" }, gLab);
  tLab.textContent = "Forecast";
  const aLab = el("text", { x: xToday - 10, y: T + 6, "text-anchor": "end", "font-weight": 600, style: "fill:#1B2433" }, gLab);
  aLab.textContent = "Actuals";
  const ticks = Array.from({ length: 6 }, () => ({
    line: el("line", { class: "tick", x1: L, x2: W - R }, gGrid),
    txt: el("text", { x: L - 10, "text-anchor": "end" }, gGrid),
  }));
  for (let i = 0; i < N; i += SMALL ? 6 : 3) {
    const d = new Date(2024, i, 1);
    const t = el("text", { x: L + i * step + step / 2, y: Hh - 18, "text-anchor": "middle" }, gGrid);
    t.textContent = MON[d.getMonth()] + (d.getMonth() === 0 ? " ’" + String(d.getFullYear()).slice(2) : "");
    if (d.getMonth() === 0) t.setAttribute("style", "fill:#1B2433;font-weight:600");
  }
  const bars = Array.from({ length: N }, (_, i) => {
    const fc = i >= HIST.length;
    return el(
      "rect",
      { x: L + i * step + (step - bw) / 2, width: bw, rx: 3, fill: fc ? "url(#hatch)" : "#1B2433", stroke: fc ? "#8A6D1F" : "none", "stroke-width": fc ? 1.8 : 0 },
      gBars,
    );
  });
  const niPath = el("path", { fill: "none", stroke: "#2F6B34", "stroke-width": 3.5, "stroke-linejoin": "round", "stroke-linecap": "round" }, gLines);
  const handle = el("g", { class: "handle", tabindex: 0, role: "slider", "aria-label": "Drag to change the month-12 revenue forecast" }, gLines);
  el("circle", { r: 22, fill: "transparent" }, handle);
  el("circle", { class: "ring", r: 9 }, handle);
  const hint = el("text", { class: "drag-hint", "text-anchor": "end" }, gLab);
  hint.textContent = "Drag to reshape";
  const endLab = el("text", { "text-anchor": "middle", "font-weight": 700, style: "fill:#8A6D1F;font-size:14px" }, gLab);

  let yMax = 300000,
    yMaxTarget = yMax;
  let tgt = project(drv);
  const cur = tgt.map((r) => ({ ...r }));
  const Y = (v: number) => T + PH - (Math.max(v, 0) / yMax) * PH;
  const Yl = (v: number) => T + PH - (v / yMax) * PH;
  const computeTarget = () => {
    tgt = project(drv);
    yMaxTarget = niceMax(Math.max(...histRows.map((r) => r.rev), ...tgt.map((r) => r.rev)));
  };
  let introStart: number | null = null,
    running = false,
    touched = false,
    started = false;

  function draw(now: number) {
    let moving = false;
    const k = reduce ? 1 : 0.18;
    if (Math.abs(yMax - yMaxTarget) > 1) {
      yMax += (yMaxTarget - yMax) * k;
      moving = true;
    } else yMax = yMaxTarget;
    cur.forEach((c, i) => {
      for (const key of Object.keys(c) as (keyof Month)[]) {
        const d = tgt[i][key] - c[key];
        if (Math.abs(d) > 0.5) {
          c[key] += d * k;
          moving = true;
        } else c[key] = tgt[i][key];
      }
    });
    if (introStart === null) introStart = now;
    const et = !started ? 0 : reduce ? 1e9 : now - introStart;
    ticks.forEach((tk, i) => {
      const v = (yMax * i) / 5,
        y = Yl(v);
      tk.line.setAttribute("y1", String(y));
      tk.line.setAttribute("y2", String(y));
      tk.txt.setAttribute("y", String(y + 4));
      tk.txt.textContent = fmtK(v);
    });
    const hd = 38,
      fcStart = HIST.length * hd + 350;
    const all = histRows.map((r) => r.rev).concat(cur.map((r) => r.rev));
    const niAll = histRows.map((r) => r.ni).concat(cur.map((r) => r.ni));
    let introDone = true;
    bars.forEach((b, i) => {
      const delay = i < HIST.length ? i * hd : fcStart + (i - HIST.length) * 60;
      const f = ease((et - delay) / 520);
      if (f < 1) introDone = false;
      const y = Y(all[i] * f);
      b.setAttribute("y", String(y));
      b.setAttribute("height", String(Math.max(T + PH - y, 0)));
    });
    const niProg = Math.min(Math.max((et - 400) / (fcStart + HORIZON * 60 + 300), 0), 1);
    const upto = Math.ceil(niProg * N);
    let d = "";
    for (let i = 0; i < upto; i++) d += (i ? "L" : "M") + (L + i * step + step / 2).toFixed(1) + " " + Yl(niAll[i]).toFixed(1);
    niPath.setAttribute("d", d || "M0 0");
    const hx = L + (N - 1) * step + step / 2,
      hy = Y(cur[HORIZON - 1].rev),
      showH = et > fcStart + HORIZON * 60 + 400;
    handle.setAttribute("transform", `translate(${hx},${hy})`);
    handle.style.opacity = showH ? "1" : "0";
    hint.setAttribute("x", String(hx - 18));
    hint.setAttribute("y", String(hy + 5));
    hint.style.opacity = showH && !touched ? "1" : "0";
    endLab.setAttribute("x", String(hx));
    endLab.setAttribute("y", String(hy - 18));
    endLab.textContent = showH ? fmtK(cur[HORIZON - 1].rev) : "";
    const dv = et > HIST.length * hd ? "1" : "0";
    divider.style.opacity = dv;
    tLab.style.opacity = dv;
    if (started && (moving || !introDone || !showH || niProg < 1)) raf(draw);
    else running = false;
  }
  const kick = () => {
    if (!running) {
      running = true;
      raf(draw);
    }
  };

  /* ---------- controls + math panel ---------- */
  const gIn = q<HTMLInputElement>("g"),
    mIn = q<HTMLInputElement>("m"),
    oIn = q<HTMLInputElement>("o");
  const syncInputs = () => {
    gIn.value = (drv.g * 100).toFixed(1);
    mIn.value = (drv.m * 100).toFixed(1);
    oIn.value = (drv.o * 100).toFixed(1);
  };
  const isOver = (k: keyof Drivers) => Math.abs(drv[k] - fitted[k]) > 1e-6;
  const formulasEl = fill(q("formulas")),
    driversEl = fill(q("drivers"));

  function renderPanels() {
    const m12 = project(drv)[HORIZON - 1];
    q("g-out").textContent = pct(drv.g);
    q("m-out").textContent = pct(drv.m);
    q("o-out").textContent = pct(drv.o);
    (["g", "m", "o"] as const).forEach((k) => q(k + "-out").classList.toggle("over", isOver(k)));
    q("ni12").textContent = fmt$(m12.ni);
    q("reset").hidden = !(isOver("g") || isOver("m") || isOver("o"));
    const rb = FIT.revenue_base.value,
      ob = FIT.opex_base.value,
      on_ = FIT.other_net.value;
    const f: [string, string][] = [
      ["revenue[t] = revenue_base × (1 + revenue_growth)<sup>t</sup>", `${fmt$(rb)} × (1 + <em>${pct(drv.g, 2)}</em>)<sup>12</sup> = ${fmt$(m12.rev)}`],
      ["cogs[t] = revenue[t] × (1 − gross_margin)", `${fmt$(m12.rev)} × (1 − <em>${pct(drv.m, 2)}</em>) = ${fmt$(m12.cogs)}`],
      ["gross_profit[t] = revenue[t] − cogs[t]", `${fmt$(m12.rev)} − ${fmt$(m12.cogs)} = ${fmt$(m12.gp)}`],
      ["opex[t] = opex_base × (1 + opex_growth)<sup>t</sup>", `${fmt$(ob)} × (1 + <em>${pct(drv.o, 2)}</em>)<sup>12</sup> = ${fmt$(m12.opex)}`],
      ["operating_income[t] = gross_profit[t] − opex[t]", `${fmt$(m12.gp)} − ${fmt$(m12.opex)} = ${fmt$(m12.oi)}`],
      ["net_income[t] = operating_income[t] + other_net", `${fmt$(m12.oi)} + ${fmt$(on_)} = ${fmt$(m12.ni)}`],
    ];
    formulasEl.innerHTML = f.map(([a, b]) => `<div class="f-line"><span class="sym">${a}</span><span class="sub">${b}</span></div>`).join("");
    const rows: [string, string, string, boolean][] = [
      ["revenue_base", fmt$(rb), FIT.revenue_base.method, false],
      ["revenue_growth", pct(drv.g, 2) + " / mo", isOver("g") ? "Scenario override" : FIT.revenue_growth.method, isOver("g")],
      ["gross_margin", pct(drv.m, 1), isOver("m") ? "Scenario override" : FIT.gross_margin.method, isOver("m")],
      ["opex_base", fmt$(ob), FIT.opex_base.method, false],
      ["opex_growth", pct(drv.o, 2) + " / mo", isOver("o") ? "Scenario override" : FIT.opex_growth.method, isOver("o")],
      ["other_net", fmt$(on_), FIT.other_net.method, false],
    ];
    driversEl.innerHTML = rows
      .map(([n, v, h, o]) => `<tr class="${o ? "over" : ""}"><td><span class="name">${n}</span><span class="how">${h}</span></td><td class="v">${v}</td></tr>`)
      .join("");
  }
  const update = () => {
    computeTarget();
    renderPanels();
    kick();
  };
  on(gIn, "input", () => {
    drv.g = +gIn.value / 100;
    touched = true;
    update();
  });
  on(mIn, "input", () => {
    drv.m = +mIn.value / 100;
    touched = true;
    update();
  });
  on(oIn, "input", () => {
    drv.o = +oIn.value / 100;
    touched = true;
    update();
  });
  on(q("reset"), "click", () => {
    Object.assign(drv, fitted);
    syncInputs();
    update();
  });

  // Drag the month-12 forecast bar, or use the arrow keys on it.
  const svgY = (e: PointerEvent) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse()).y;
  };
  let dragging = false;
  const setFromRev12 = (v: number) => {
    const g = Math.pow(Math.max(v, 1) / FIT.revenue_base.value, 1 / HORIZON) - 1;
    drv.g = Math.min(0.08, Math.max(-0.02, Math.round(g * 1000) / 1000));
    syncInputs();
    update();
  };
  on<PointerEvent>(handle, "pointerdown", (e) => {
    dragging = true;
    touched = true;
    handle.classList.add("dragging");
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  on<PointerEvent>(handle, "pointermove", (e) => {
    if (dragging) setFromRev12(((T + PH - svgY(e)) / PH) * yMax);
  });
  const endDrag = () => {
    dragging = false;
    handle.classList.remove("dragging");
  };
  on(handle, "pointerup", endDrag);
  on(handle, "pointercancel", endDrag);
  on<KeyboardEvent>(handle, "keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") drv.g = Math.min(0.08, drv.g + 0.001);
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") drv.g = Math.max(-0.02, drv.g - 0.001);
    else return;
    e.preventDefault();
    touched = true;
    syncInputs();
    update();
  });

  syncInputs();
  computeTarget();
  yMax = yMaxTarget;
  renderPanels();
  draw(performance.now());
  onVisible(svg, () => {
    started = true;
    introStart = null;
    kick();
  }, 0.25);

  /* ---------- formula band ---------- */
  {
    const F = [
      ["revenue[t]", "revenue_base × (1 + revenue_growth)^t"],
      ["cogs[t]", "revenue[t] × (1 − gross_margin)"],
      ["gross_profit[t]", "revenue[t] − cogs[t]"],
      ["opex[t]", "opex_base × (1 + opex_growth)^t"],
      ["operating_income[t]", "gross_profit[t] − opex[t]"],
      ["net_income[t]", "operating_income[t] + other_net"],
    ];
    const html = F.map(([a, b]) => `<span><b>${a}</b> = ${b}</span>`).join("");
    fill(q("track")).innerHTML = html + html;
  }

  /* ---------- upload visual ---------- */
  {
    const rowsEl = fill(q("csv-rows")),
      tot = q("totals");
    rowsEl.innerHTML =
      `<div class="h">account,category,amount</div>` +
      DEC.map(([a, c, v]) => `<div title="2025-12-01,${a},${c},${v.toFixed(2)}">${a},${c},${v.toFixed(2)}</div>`).join("");
    const cats = [
      ["revenue", "Revenue"],
      ["cogs", "Cost of sales"],
      ["opex", "Operating expenses"],
      ["other", "Other income"],
    ] as const;
    type Cat = (typeof cats)[number][0];
    const sums: Record<Cat, number> = { revenue: 0, cogs: 0, opex: 0, other: 0 };
    const cells = {} as Record<Cat, HTMLDivElement>;
    const added: HTMLElement[] = [];
    cats.forEach(([k, label]) => {
      const r = document.createElement("div");
      r.className = "row";
      r.innerHTML = `<span>${label}</span><span>$0</span>`;
      tot.appendChild(r);
      cells[k] = r;
      added.push(r);
    });
    const ni = document.createElement("div");
    ni.className = "row";
    ni.innerHTML = `<span>Net income</span><span>$0</span>`;
    tot.appendChild(ni);
    added.push(ni);
    cleanups.push(() => added.forEach((n) => n.remove()));
    const final: Record<Cat, number> = { revenue: 0, cogs: 0, opex: 0, other: 0 };
    DEC.forEach(([, c, v]) => (final[c] += v));
    const show = (s: Record<Cat, number>) => {
      cats.forEach(([k]) => (cells[k].lastChild!.textContent = fmt$(s[k])));
      ni.lastChild!.textContent = fmt$(s.revenue - s.cogs - s.opex + s.other);
    };
    if (reduce) show(final);
    else {
      const lines = [...rowsEl.children].slice(1);
      const clearHl = () => {
        lines.forEach((l) => l.classList.remove("hl"));
        Object.values(cells).forEach((c) => c.classList.remove("hl"));
      };
      show(sums);
      onVisible(q("upload-vis"), () => {
        lines.forEach((ln, i) =>
          timers.push(
            window.setTimeout(() => {
              clearHl();
              ln.classList.add("hl");
              const [, c, v] = DEC[i];
              cells[c].classList.add("hl");
              const from = sums[c],
                to = from + v,
                t0 = performance.now();
              const tick = (now: number) => {
                const p = Math.min((now - t0) / 450, 1);
                sums[c] = from + (to - from) * ease(p);
                show(sums);
                if (p < 1) raf(tick);
              };
              raf(tick);
              if (i === lines.length - 1) timers.push(window.setTimeout(clearHl, 900));
            }, i * 650),
          ),
        );
      }, 0.5);
    }
  }

  /* ---------- scenarios ---------- */
  {
    const S = [
      { name: "Base case", color: "#1B2433", d: { ...fitted }, note: "Fitted drivers" },
      { name: "Raise prices", color: "#D4A032", d: { ...fitted, g: 0.04 }, note: "Revenue growth 4.0% a month" },
      { name: "Hire faster", color: "#2F6B34", d: { ...fitted, o: 0.03 }, note: "Opex growth 3.0% a month" },
      { name: "Slower year", color: "#9A3324", d: { ...fitted, g: 0.015, m: 0.8 }, note: "Growth 1.5%, margin 80%" },
    ].map((s) => ({ ...s, p: project(s.d).map((r) => r.ni) }));
    const svgS = fill(q<SVGSVGElement>("scen"));
    const SM = innerWidth < 640,
      FS = SM ? 22 : 13,
      W2 = 640,
      H2 = SM ? 400 : 320,
      l = SM ? 84 : 58,
      r = SM ? 118 : 110,
      t = 16,
      b = SM ? 44 : 34;
    svgS.setAttribute("viewBox", `0 0 ${W2} ${H2}`);
    svgS.style.setProperty("--fs", FS + "px");
    const all = S.flatMap((s) => s.p),
      lo = Math.min(0, ...all),
      hi = niceMax(Math.max(...all));
    const x = (i: number) => l + (i * (W2 - l - r)) / (HORIZON - 1);
    const y = (v: number) => t + (H2 - t - b) * (1 - (v - lo) / (hi - lo));
    for (let i = 0; i <= 4; i++) {
      const v = lo + ((hi - lo) * i) / 4;
      el("line", { x1: l, x2: W2 - r, y1: y(v), y2: y(v), stroke: "#E2D9C7" }, svgS);
      el("text", { x: l - 8, y: y(v) + 4, "text-anchor": "end" }, svgS).textContent = fmtK(v);
    }
    const months = SM ? ["Jan", "Jun", "Dec"] : ["Jan", "Apr", "Jul", "Oct", "Dec"];
    const idx = SM ? [0, 5, 11] : [0, 3, 6, 9, 11];
    months.forEach((m, j) => {
      el("text", { x: x(idx[j]), y: H2 - 10, "text-anchor": "middle" }, svgS).textContent = m + (idx[j] === 0 ? " ’26" : "");
    });
    const paths = S.map((s) => {
      const p = el("path", { class: "s-line", stroke: s.color, d: s.p.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join("") }, svgS);
      const lab = el("text", { x: W2 - r + 10, y: y(s.p[HORIZON - 1]) + 4, style: `fill:${s.color};font-weight:650` }, svgS);
      lab.textContent = fmtK(s.p[HORIZON - 1]);
      return { p, lab };
    });
    // Nudge overlapping end labels apart.
    const order = paths.map((o, i) => ({ i, yv: +o.lab.getAttribute("y")! })).sort((a, b) => a.yv - b.yv);
    for (let k = 1; k < order.length; k++) {
      if (order[k].yv - order[k - 1].yv < FS + 3) {
        order[k].yv = order[k - 1].yv + FS + 3;
        paths[order[k].i].lab.setAttribute("y", String(order[k].yv));
      }
    }
    const chips = fill(q("chips")),
      foot = fill(q("scen-foot"));
    let sel: number | null = null;
    const render = () => {
      S.forEach((_, i) => {
        const lit = sel === null || sel === i;
        paths[i].p.classList.toggle("dim", !lit);
        paths[i].lab.classList.toggle("dim", !lit);
        paths[i].p.style.strokeWidth = sel === i ? "4.5" : "3";
      });
      [...chips.children].forEach((c, i) => c.setAttribute("aria-pressed", String(sel === i)));
      const s = S[sel ?? 0],
        v = s.p[HORIZON - 1],
        diff = v - S[0].p[HORIZON - 1];
      const vs = sel ? ` (${diff >= 0 ? "+" : "−"}${fmt$(Math.abs(diff))} vs base)` : "";
      foot.innerHTML = `<span>${s.name}: ${s.note}</span><span>Net income in month 12 <b>${fmt$(v)}</b>${vs}</span>`;
    };
    S.forEach((s, i) => {
      const c = document.createElement("button");
      c.className = "chip";
      c.type = "button";
      c.innerHTML = `<i style="background:${s.color}"></i>${s.name}`;
      on(c, "click", () => {
        sel = sel === i ? null : i;
        render();
      });
      chips.appendChild(c);
    });
    render();
    if (!reduce) {
      paths.forEach((o) => {
        const len = o.p.getTotalLength();
        o.p.style.strokeDasharray = String(len);
        o.p.style.strokeDashoffset = String(len);
        o.lab.style.opacity = "0";
      });
      onVisible(svgS, () => {
        paths.forEach((o, i) => {
          o.p.style.transition = `stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1) ${i * 0.25}s, opacity .3s, stroke-width .3s`;
          o.p.style.strokeDashoffset = "0";
          o.lab.style.transition = `opacity .4s ${1.2 + i * 0.25}s`;
          o.lab.style.opacity = "";
        });
      }, 0.4);
    }
  }

  /* ---------- flow diagram ---------- */
  {
    const f = fill(q<SVGSVGElement>("flow"));
    const left = [
      ["Accounting exports", "Monthly P&L as a CSV"],
      ["Spreadsheets", "One row per account per month"],
    ];
    const right = [
      ["Dashboards", "Your team's view"],
      ["Client portals", "What your clients see"],
      ["Reports", "Monthly packs and reviews"],
    ];
    const cx = 550,
      cy = 150,
      nw = 230,
      nh = 64;
    const wires: string[] = [];
    const node = (x0: number, yc: number, a: string, b2: string, tx: number) => {
      el("rect", { class: "node", x: x0, y: yc - nh / 2, width: nw, height: nh, rx: 14 }, f);
      el("text", { x: tx, y: yc - 4, "font-size": 17, "font-weight": 650 }, f).textContent = a;
      el("text", { class: "sub", x: tx, y: yc + 18 }, f).textContent = b2;
    };
    left.forEach(([a, b2], i) => {
      const yc = 80 + i * 140;
      node(20, yc, a, b2, 42);
      wires.push(`M${20 + nw} ${yc} C ${cx - 160} ${yc}, ${cx - 200} ${cy}, ${cx - 130} ${cy}`);
    });
    right.forEach(([a, b2], i) => {
      const yc = 50 + i * 100;
      node(1100 - 20 - nw, yc, a, b2, 1100 - nw);
      wires.push(`M${cx + 130} ${cy} C ${cx + 200} ${cy}, ${cx + 160} ${yc}, ${1100 - 20 - nw} ${yc}`);
    });
    const g = el("g", {}, f);
    f.insertBefore(g, f.firstChild);
    wires.forEach((d, i) => {
      el("path", { class: "wire", d, id: "fc-w" + i }, g);
      if (!reduce)
        for (let k = 0; k < 2; k++) {
          const c = el("circle", { class: "pulse", r: 4 }, g);
          const am = el("animateMotion", { dur: "2.8s", repeatCount: "indefinite", begin: k * 1.4 + i * 0.35 + "s" }, c);
          el("mpath", { href: "#fc-w" + i }, am);
        }
    });
    el("rect", { class: "core", x: cx - 130, y: cy - 58, width: 260, height: 116, rx: 20 }, f);
    el("text", { x: cx, y: cy - 6, "text-anchor": "middle", "font-size": 22, "font-weight": 750, style: "fill:#000815" }, f).textContent = "Forecast Engine";
    el("text", { x: cx, y: cy + 20, "text-anchor": "middle", "font-size": 15, style: "fill:#1B2433" }, f).textContent = "Fit drivers, project, explain";
  }

  return () => {
    ac.abort();
    frames.forEach((id) => cancelAnimationFrame(id));
    timers.forEach((id) => clearTimeout(id));
    observers.forEach((io) => io.disconnect());
    cleanups.forEach((fn) => fn());
    filled.forEach((e) => e.replaceChildren());
  };
}

