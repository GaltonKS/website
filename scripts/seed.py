"""Seed the local advisor-engine API with one example household for screenshots."""
import json, urllib.request

API = "http://localhost:8000"
H = {"X-Dev-User": "alice", "Content-Type": "application/json"}


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, headers=H,
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req) as r:
            t = r.read()
            return json.loads(t) if t else None
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {path} -> {e.code} {e.read()[:400]}")


# Before: a concentrated 22-holding portfolio. After: trimmed and diversified.
BEFORE = [
    ("AAPL", 620, 228.4, "Technology"), ("MSFT", 310, 431.2, "Technology"), ("NVDA", 900, 138.5, "Technology"),
    ("AVGO", 380, 171.9, "Technology"), ("ORCL", 420, 182.3, "Technology"), ("CRM", 210, 318.6, "Technology"),
    ("AMZN", 520, 201.7, "Consumer Discretionary"), ("TSLA", 190, 262.1, "Consumer Discretionary"),
    ("HD", 120, 402.5, "Consumer Discretionary"), ("GOOGL", 560, 176.3, "Communication Services"),
    ("META", 140, 589.0, "Communication Services"), ("JPM", 330, 238.4, "Financials"),
    ("V", 200, 309.8, "Financials"), ("BRK.B", 150, 471.2, "Financials"), ("UNH", 95, 548.3, "Health Care"),
    ("LLY", 70, 812.6, "Health Care"), ("JNJ", 210, 154.9, "Health Care"), ("XOM", 340, 116.2, "Energy"),
    ("PG", 200, 168.4, "Consumer Staples"), ("CAT", 80, 386.7, "Industrials"), ("NEE", 260, 74.8, "Utilities"),
    ("AGG", 300, 98.6, "Bonds"),
]
AFTER = BEFORE[:3] + [BEFORE[6], BEFORE[9], BEFORE[11], BEFORE[14], BEFORE[16], BEFORE[17], BEFORE[18], BEFORE[19], BEFORE[20]] + [
    ("AGG", 1600, 98.6, "Bonds"), ("TIP", 700, 109.4, "Bonds"), ("SGOV", 900, 100.4, "Cash"),
    ("VXUS", 1100, 63.2, "International"),
]


def rows(h):
    out = []
    for t, s, p, sec in h:
        ac = {"Bonds": "fixed income", "Cash": "cash"}.get(sec, "")
        if t == "TIP":
            ac = "inflation-protected"
        sector = {"Bonds": "Fixed Income", "Cash": "Cash"}.get(sec, sec)
        out.append({"ticker": t, "shares": s, "price": p, "sector": sector, "asset_class": ac})
    return out


client = call("POST", "/clients", {"name": "Whitfield household", "objective": "Retirement income in 9 years",
                                   "tone": "plain, reassuring"})
cid = client["id"]
p1 = call("POST", f"/clients/{cid}/portfolios/holdings", {"holdings": rows(BEFORE), "label": "Custodian export, Oct 31"})
p2 = call("POST", f"/clients/{cid}/portfolios/holdings", {"holdings": rows(AFTER), "label": "Rebalanced, Nov 8"})
pid1, pid2 = p1["id"], p2["id"]

# Household profile: two partners plus household answers.
qs = {q["id"]: q for q in (lambda d: d if isinstance(d, list) else d["questions"])(call("GET", "/profile/questions"))}
dan = call("POST", f"/clients/{cid}/people", {"name": "Dan Whitfield", "role": "primary"})
amy = call("POST", f"/clients/{cid}/people", {"name": "Amy Whitfield", "role": "partner"})


def ans(qid, answer, person=None):
    call("POST", f"/clients/{cid}/profile/inputs", {"question_id": qid, "person_id": person, "answer": answer})


def opt(qid, i):
    return qs[qid]["options"][i]["key"]


for q in qs.values():
    pid = None
    if q["id"].startswith("w_"):
        for who, idx in ((dan["id"], 3), (amy["id"], 1)):
            if q["kind"] == "choice":
                ans(q["id"], opt(q["id"], min(idx, len(q["options"]) - 1)), who)
            elif q["kind"] == "loss_limits":
                ans(q["id"], {"uncomfortable_pct": 0.15 if who == amy["id"] else 0.25,
                              "act_pct": 0.25 if who == amy["id"] else 0.35}, who)
            elif q["kind"] == "number":
                ans(q["id"], (q["min"] + q["max"]) / 2, who)
    else:
        if q["kind"] == "choice":
            ans(q["id"], opt(q["id"], len(q["options"]) // 2))
        elif q["kind"] == "number":
            ans(q["id"], {"a_horizon_years": 9, "n_required_return": 0.068}.get(q["id"], (q["min"] + q["max"]) / 2))
        elif q["kind"] == "loss_limits":
            ans(q["id"], {"uncomfortable_pct": 0.15, "act_pct": 0.25})

# Legacy questionnaire (suitability)
call("PUT", f"/clients/{cid}/questionnaire",
     {"answers": {"time_horizon": 2, "income_need": 2, "loss_reaction": 2, "max_loss": 3, "experience": 3, "liquidity": 3}})

# Galton conversation and an approved client explanation on the current portfolio.
call("POST", f"/portfolios/{pid2}/turns", {"message": "How concentrated is this portfolio?"})
t = call("POST", f"/portfolios/{pid2}/turns",
         {"message": "Please write a client-ready explanation of this portfolio's risk, for my review.", "draft": True})
drafts = call("GET", f"/portfolios/{pid2}/drafts")
d = (drafts if isinstance(drafts, list) else drafts.get("drafts", []))
if d:
    call("POST", f"/drafts/{d[-1]['id']}/approve", {"text": d[-1]["original"].replace("DRAFT for advisor review. Not yet sent to the client.\n\n", "")})

# Stress test
sc = call("GET", "/stress/scenarios")
scl = sc if isinstance(sc, list) else sc.get("scenarios", [])
if scl:
    call("POST", f"/portfolios/{pid2}/stress", {"scenario_id": scl[0]["id"]})

print(json.dumps({"client": cid, "before": pid1, "after": pid2,
                  "scenarios": [s.get("id") for s in scl][:6]}))
