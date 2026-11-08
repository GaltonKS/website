export type ContactRequest = {
  name: string;
  email: string;
  firm: string;
  role: string;
  aum: string;
  message: string;
  website: string; // honeypot: real people leave it empty
};

export const ROLES = [
  "Independent advisor",
  "RIA owner or principal",
  "Part of a wealth team",
  "Compliance or operations",
  "Other",
];

export const AUM = ["Under $50M", "$50M to $250M", "$250M to $1B", "Over $1B"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Field errors, keyed by field name. Empty object means the request is valid.
 *  Shared by the form and the API route so both apply the same rules. */
export function validateContact(d: Partial<ContactRequest>): Partial<Record<keyof ContactRequest, string>> {
  const e: Partial<Record<keyof ContactRequest, string>> = {};
  if (!d.name?.trim()) e.name = "Enter your name.";
  if (!d.email?.trim()) e.email = "Enter your work email.";
  else if (!EMAIL.test(d.email.trim())) e.email = "Enter an email address like name@firm.com.";
  if (!d.firm?.trim()) e.firm = "Enter your firm's name.";
  if ((d.message ?? "").length > 2000) e.message = "Keep the message under 2,000 characters.";
  return e;
}

/** Sends the request to /api/contact. With NEXT_PUBLIC_CONTACT_DEMO=1 (the static
 *  preview, which has no server) it only simulates a successful send. */
export async function submitContact(d: ContactRequest): Promise<void> {
  if (process.env.NEXT_PUBLIC_CONTACT_DEMO === "1") {
    await new Promise((r) => setTimeout(r, 900));
    return;
  }
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "The request didn't go through.");
  }
}
