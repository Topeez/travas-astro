import type { APIContext } from "astro";

interface ContactFormData {
  fullname: string;
  email: string;
  phone: string;
  message?: string;
}

interface Env {
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  EMAIL_TO: string;
}

const VALIDATION = {
  fullname: { min: 2, max: 100 },
  email: { min: 5, max: 254 },
  phone: { min: 10, max: 16 },
  message: { max: 5000 },
};

function validate(data: ContactFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.fullname || data.fullname.length < VALIDATION.fullname.min) {
    errors.fullname = `Jméno musí mít alespoň ${VALIDATION.fullname.min} znaky.`;
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Zadejte platnou emailovou adresu.";
  }

  if (!data.phone || data.phone.length < VALIDATION.phone.min) {
    errors.phone = `Telefon musí mít alespoň ${VALIDATION.phone.min} znaků.`;
  }

  if (data.message && data.message.length > VALIDATION.message.max) {
    errors.message = `Zpráva je příliš dlouhá (max ${VALIDATION.message.max} znaků).`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function sanitize(input: string): string {
  return input.replace(/[<>]/g, "").replace(/javascript:/gi, "").trim();
}

function emailContent(data: ContactFormData) {
  const subject = `Nová poptávka od ${data.fullname} - Travas Stínění`;
  const text = `Nová poptávka z webu Travas Stínění

Jméno: ${data.fullname}
Email: ${data.email}
Telefon: ${data.phone}
${data.message ? `Zpráva:\n${data.message}` : "Zpráva: (prázdná)"}

---
Odesláno z kontaktního formuláře na travasstineni.cz`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}
.header{background:#1a1a1a;color:#fff;padding:20px;border-radius:8px 8px 0 0}
.content{background:#f9f9f9;padding:20px;border-radius:0 0 8px 8px}
.field{margin-bottom:16px}
.label{font-weight:bold;color:#666;font-size:14px;text-transform:uppercase;letter-spacing:.5px}
.value{margin-top:4px}
.message{background:#fff;padding:16px;border-radius:6px;border-left:4px solid #1a1a1a}
.footer{margin-top:20px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#999;text-align:center}
</style></head><body>
<div class="header"><h1 style="margin:0;font-size:24px">Nová poptávka</h1><p style="margin:8px 0 0;opacity:.8">Travas Stínění - kontaktní formulář</p></div>
<div class="content">
  <div class="field"><div class="label">Jméno</div><div class="value">${sanitize(data.fullname)}</div></div>
  <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${sanitize(data.email)}">${sanitize(data.email)}</a></div></div>
  <div class="field"><div class="label">Telefon</div><div class="value"><a href="tel:${sanitize(data.phone)}">${sanitize(data.phone)}</a></div></div>
  ${data.message ? `<div class="field"><div class="label">Zpráva</div><div class="value message">${sanitize(data.message).replace(/\n/g, "<br>")}</div></div>` : ""}
  <div class="footer">Odesláno z <a href="https://travasstineni.cz">travasstineni.cz</a></div>
</div></body></html>`;

  return { subject, text, html };
}

async function sendViaResend(env: Env, subject: string, html: string, text: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [env.EMAIL_TO], subject, html, text }),
  });
  return res.ok;
}

export async function onRequestPost(context: APIContext): Promise<Response> {
  const { request, env } = context;
  const envTyped = env as unknown as Env;

  try {
    let data: ContactFormData;
    const ct = request.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const j = await request.json();
      data = { fullname: j.fullname || "", email: j.email || "", phone: j.phone || "", message: j.message || "" };
    } else {
      const fd = await request.formData();
      data = { fullname: fd.get("fullname")?.toString() || "", email: fd.get("email")?.toString() || "", phone: fd.get("phone")?.toString() || "", message: fd.get("message")?.toString() || "" };
    }

    data.fullname = sanitize(data.fullname);
    data.email = sanitize(data.email);
    data.phone = sanitize(data.phone);
    if (data.message) data.message = sanitize(data.message);

    const { valid, errors } = validate(data);
    if (!valid) {
      return new Response(JSON.stringify({ success: false, errors }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { subject, html, text } = emailContent(data);
    const sent = await sendViaResend(envTyped, subject, html, text);

    if (!sent) {
      return new Response(JSON.stringify({ success: false, error: "Odeslání emailu se nezdařilo. Zkuste to prosím později." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, message: "Vaše zpráva byla úspěšně odeslána." }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Contact form error:", e);
    return new Response(JSON.stringify({ success: false, error: "Došlo k chybě serveru. Zkuste to prosím později." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}