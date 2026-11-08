import { validateContact, type ContactRequest } from "@/lib/contact";

// Receives meeting requests from the contact form.
//
// Delivery: if RESEND_API_KEY and CONTACT_TO_EMAIL are set, the request is emailed via
// Resend (https://resend.com). Otherwise it is only written to the server log, which is
// enough to try the form locally. Swap in your CRM or another email service here.

export async function POST(request: Request) {
  let data: Partial<ContactRequest>;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "Send the form as JSON." }, { status: 400 });
  }

  // Bots fill every field, including the hidden one. Pretend it worked.
  if (data.website) return Response.json({ ok: true });

  const errors = validateContact(data);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "Some fields need attention.", fields: errors }, { status: 422 });
  }

  const clean = {
    name: data.name!.trim(),
    email: data.email!.trim(),
    firm: data.firm!.trim(),
    role: (data.role ?? "").trim(),
    aum: (data.aum ?? "").trim(),
    message: (data.message ?? "").trim(),
  };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    console.log("[contact] meeting request (email delivery not configured):", clean);
    return Response.json({ ok: true });
  }

  const text = [
    `Name: ${clean.name}`,
    `Email: ${clean.email}`,
    `Firm: ${clean.firm}`,
    `Role: ${clean.role || "not given"}`,
    `AUM: ${clean.aum || "not given"}`,
    "",
    clean.message || "(no message)",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "GaltonKS website <onboarding@resend.dev>",
      to: [to],
      reply_to: clean.email,
      subject: `Meeting request: ${clean.name}, ${clean.firm}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[contact] email delivery failed:", res.status, await res.text().catch(() => ""));
    return Response.json(
      { error: "We couldn't send your request. Try again, or email us directly." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
