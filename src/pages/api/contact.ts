import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

interface Env {
    RESEND_API_KEY: string;
    EMAIL_FROM?: string;
    EMAIL_TO?: string;
}


const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");
const esc = (s: string) =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const POST: APIRoute = async ({ request }) => {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return json({ success: false, error: "Neplatný požadavek." }, 400);
    }

    // Honeypot: bot vyplní skryté pole, tváříme se, že vše proběhlo
    if (str(body.website)) return json({ success: true });

    const fullname = oneLine(str(body.fullname));
    const email = oneLine(str(body.email));
    const phone = oneLine(str(body.phone));
    const message = str(body.message);

    const errors: Record<string, string> = {};
    if (fullname.length < 2 || fullname.length > 100)
        errors.fullname = "Zadejte jméno (2 až 100 znaků).";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.email = "Zadejte platnou e-mailovou adresu.";
    if (phone.length < 9 || phone.length > 16)
        errors.phone = "Zadejte platné telefonní číslo.";
    if (message.length > 5000)
        errors.message = "Zpráva je příliš dlouhá (max 5000 znaků).";

    if (Object.keys(errors).length) return json({ success: false, errors }, 400);

    const text = [
        "Nová poptávka z webu Travas Stínění",
        "",
        `Jméno: ${fullname}`,
        `E-mail: ${email}`,
        `Telefon: ${phone}`,
        `Zpráva: ${message || "(prázdná)"}`,
    ].join("\n");

    const html = `
<div style="font-family:sans-serif;max-width:600px;line-height:1.6;color:#222">
  <h2 style="margin:0 0 16px">Nová poptávka</h2>
  <p><strong>Jméno:</strong> ${esc(fullname)}</p>
  <p><strong>E-mail:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
  <p><strong>Telefon:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>
  ${message ? `<p><strong>Zpráva:</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>` : ""}
</div>`.trim();

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: env.EMAIL_FROM || "Travas Stínění <noreply@travasstineni.cz>",
                to: [env.EMAIL_TO || "info@travasstineni.cz"],
                reply_to: email,
                subject: `Nová poptávka od ${fullname}`,
                html,
                text,
            }),
        });

        if (!res.ok) {
            console.error("Resend error:", res.status, await res.text());
            return json({ success: false, error: "Odeslání se nezdařilo. Zkuste to prosím později." }, 502);
        }

        return json({ success: true });
    } catch (err) {
        console.error("Contact form error:", err);
        return json({ success: false, error: "Došlo k chybě serveru." }, 500);
    }
};