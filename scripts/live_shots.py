"""Capture 'live' product shots: a base frame of the app plus a crop of one card to float over it.

Hidden for the shots: dev-only header badges (dev sign-in, mock-mode badge, test email) and the
workspace tab bar (its assistant tab is still labelled with the old name). Nothing else is altered.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

CID, P_BEFORE, P_AFTER = sys.argv[1:4]
OUT = "live-raw/"
os.makedirs(OUT, exist_ok=True)

HIDE = """
(() => {
  for (const el of document.querySelectorAll('header span, header button')) {
    const t = el.textContent || '';
    if (/Galton AI:|Dev sign-in|@dev\\.local|Install app/.test(t)) el.style.display = 'none';
  }
  for (const nav of document.querySelectorAll('nav.no-print')) {
    if ((nav.textContent || '').includes('Audit trail')) nav.style.display = 'none';
  }
})()
"""

# The card around a heading: the nearest ancestor with a visible border or its own background.
CARD = """
(text) => {
  const all = [...document.querySelectorAll('h1,h2,h3,h4,div,span,p')];
  const h = all.find(e => e.children.length === 0 && e.textContent.trim() === text)
         || all.find(e => e.textContent.trim().startsWith(text) && e.children.length < 3);
  if (!h) return null;
  let el = h.parentElement;
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    const bordered = parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderLeftWidth) > 0;
    if (bordered && el.getBoundingClientRect().width > 200) break;
    el = el.parentElement;
  }
  const r = el.getBoundingClientRect();
  return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
}
"""

SHOTS = [
    # name, portfolio, tab, card heading, scroll for base frame, max card height (css px)
    ("overview", P_BEFORE, "overview", "Where the risk comes from", 0, None),
    ("household", P_AFTER, "household", "Profile", 0, 448),
    ("stress", P_AFTER, "stress", "Largest losses by position", 0, None),
    ("review", P_AFTER, "review", "What changed", 0, None),
]


async def main():
    found = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        for name, pid, tab, heading, scroll, maxh in SHOTS:
            await pg.goto(f"http://localhost:5173/clients/{CID}?tab={tab}&p={pid}", wait_until="networkidle")
            await pg.wait_for_timeout(2500)
            await pg.evaluate(HIDE)
            await pg.evaluate(f"window.scrollTo(0, {scroll})")
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"{OUT}{name}-base.png")
            box = await pg.evaluate(CARD, heading)
            if box and maxh:
                box["height"] = min(box["height"], maxh)
            found[name] = box
            if box:
                await pg.evaluate("window.scrollTo(0,0)")
                await pg.screenshot(path=f"{OUT}{name}-card.png", clip=box, full_page=True)
        await b.close()
    print(json.dumps(found, indent=1))

asyncio.run(main())
