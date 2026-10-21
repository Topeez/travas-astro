import type { APIContext } from "astro";

// Email provider types
type EmailProvider = "resend" | "sendgrid" | "mailgun" | "cloudflare";

interface ContactFormData {
  fullname: string;
  email: string;
  phone: string;
  message?: string;
}

interface Env {
  // Email provider configuration
  EMAIL_PROVIDER?: EmailProvider;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_TO?: string;
  EMAIL_DOMAIN?: string; // For Mailgun

  // Optional: Turnstile secret for spam protection
  TURNSTILE_SECRET?: string;

  // Honeypot field name (optional)
  HONEYPOT_FIELD?: string;
}

const VALIDATION_SCHEMA = {
  fullname: { min: 2, max: 100 },
  email: { min: 5, max: 254 },
  phone: { min: 10, max: 16 },
  message: { max: 5000 },
};

function validateFormData(data: ContactFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.fullname || data.fullname.length < VALIDATION_SCHEMA.fullname.min) {
    errors.fullname = `Jméno musí mít alespoň ${VALIDATION_SCHEMA.fullname.min} znaky.`;
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Zadejte platnou emailovou adresu.";
  }

  if (!data.phone || data.phone.length < VALIDATION_SCHEMA.phone.min) {
    errors.phone = `Telefonní číslo musí mít alespoň ${VALIDATION_SCHEMA.phone.min} znaků.`;
  }

  if (data.message && data.message.length > VALIDATION_SCHEMA.message.max) {
    errors.message = `Zpráva je příliš dlouhá (max ${VALIDATION_SCHEMA.message.max} znaků).`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });
    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

async function sendEmailResend(apiKey: string, from: string, to: string, subject: string, html: string, text: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendEmailSendGrid(apiKey: string, from: string, to: string, subject: string, html: string, text: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], subject }],
        from: { email: from },
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendEmailMailgun(apiKey: string, domain: string, from: string, to: string, subject: string, html: string, text: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("from", from);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("text", text);
    formData.append("html", html);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`api:${apiKey}`)}`,
      },
      body: formData,
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendEmailCloudflare(env: Env, from: string, to: string, subject: string, html: string, text: string): Promise<boolean> {
  // This would use Cloudflare Email Workers / Email Routing
  // Requires setting up Email Routing in Cloudflare dashboard
  // and a Worker that receives and forwards emails
  // For now, we'll use a webhook approach or fallback
  console.warn("Cloudflare Email Workers not fully configured, falling back to console log");
  console.log("Would send email:", { from, to, subject, text });
  return true; // Placeholder - implement based on your Email Routing setup
}

function generateEmailContent(data: ContactFormData): { html: string; text: string; subject: string } {
  const subject = `Nová poptávka od ${data.fullname} - Travas Stínění`;

  const text = `
Nová kontaktní poptávka z webu Travas Stínění

Jméno: ${data.fullname}
Email: ${data.email}
Telefon: ${data.phone}
${data.message ? `Zpráva:\n${data.message}` : "Zpráva: (prázdná)"}

---
Odesláno z kontaktního formuláře na travasstineni.cz
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 16px; }
    .label { font-weight: bold; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { margin-top: 4px; }
    .message { background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #1a1a1a; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">Nová poptávka</h1>
    <p style="margin: 8px 0 0; opacity: 0.8;">Travas Stínění - kontaktní formulář</p>
  </div>
  <div class="content">
    <div class="field">
      <div class="label">Jméno</div>
      <div class="value">${sanitizeInput(data.fullname)}</div>
    </div>
    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${sanitizeInput(data.email)}">${sanitizeInput(data.email)}</a></div>
    </div>
    <div class="field">
      <div class="label">Telefon</div>
      <div class="value"><a href="tel:${sanitizeInput(data.phone)}">${sanitizeInput(data.phone)}</a></div>
    </div>
    ${data.message ? `
    <div class="field">
      <div class="label">Zpráva</div>
      <div class="value message">${sanitizeInput(data.message).replace(/\n/g, "<br>")}</div>
    </div>
    ` : ""}
    <div class="footer">
      Odesláno z kontaktního formuláře na <a href="https://travasstineni.cz">travasstineni.cz</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { html, text, subject };
}

export async function onRequestPost(context: APIContext): Promise<Response> {
  const { request, env } = context;
  const envTyped = env as unknown as Env;

  try {
    // Parse form data
    const contentType = request.headers.get("content-type") || "";
    let formData: ContactFormData;
    let turnstileToken: string | undefined;

    if (contentType.includes("application/json")) {
      const json = await request.json();
      formData = {
        fullname: json.fullname || "",
        email: json.email || "",
        phone: json.phone || "",
        message: json.message || "",
      };
      turnstileToken = json["cf-turnstile-response"] || json.turnstileToken;
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const fd = await request.formData();
      formData = {
        fullname: fd.get("fullname")?.toString() || "",
        email: fd.get("email")?.toString() || "",
        phone: fd.get("phone")?.toString() || "",
        message: fd.get("message")?.toString() || "",
      };
      turnstileToken = fd.get("cf-turnstile-response")?.toString() || fd.get("turnstileToken")?.toString();

      // Check honeypot field
      const honeypotField = envTyped.HONEYPOT_FIELD || "website";
      if (fd.get(honeypotField)) {
        // Honeypot filled - likely bot, silently succeed but don't send email
        console.log("Honeypot triggered, ignoring submission");
        return new Response(JSON.stringify({ success: true, message: "Formulář byl odeslán." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ success: false, error: "Neplatný content-type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sanitize inputs
    formData.fullname = sanitizeInput(formData.fullname);
    formData.email = sanitizeInput(formData.email);
    formData.phone = sanitizeInput(formData.phone);
    if (formData.message) {
      formData.message = sanitizeInput(formData.message);
    }

    // Validate
    const { valid, errors } = validateFormData(formData);
    if (!valid) {
      return new Response(JSON.stringify({ success: false, errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify Turnstile if configured
    if (envTyped.TURNSTILE_SECRET && turnstileToken) {
      const isValid = await verifyTurnstile(turnstileToken, envTyped.TURNSTILE_SECRET);
      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: "Ověření selhalo. Zkuste to prosím znovu." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (envTyped.TURNSTILE_SECRET && !turnstileToken) {
      return new Response(JSON.stringify({ success: false, error: "Chybí ověřovací token." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate email content
    const { html, text, subject } = generateEmailContent(formData);

    // Send email based on configured provider
    const provider = envTyped.EMAIL_PROVIDER || "resend";
    const from = envTyped.EMAIL_FROM || "noreply@travasstineni.cz";
    const to = envTyped.EMAIL_TO || "info@travasstineni.cz";
    let sent = false;

    switch (provider) {
      case "resend":
        if (envTyped.EMAIL_API_KEY) {
          sent = await sendEmailResend(envTyped.EMAIL_API_KEY, from, to, subject, html, text);
        }
        break;
      case "sendgrid":
        if (envTyped.EMAIL_API_KEY) {
          sent = await sendEmailSendGrid(envTyped.EMAIL_API_KEY, from, to, subject, html, text);
        }
        break;
      case "mailgun":
        if (envTyped.EMAIL_API_KEY && envTyped.EMAIL_DOMAIN) {
          sent = await sendEmailMailgun(envTyped.EMAIL_API_KEY, envTyped.EMAIL_DOMAIN, from, to, subject, html, text);
        }
        break;
      case "cloudflare":
        sent = await sendEmailCloudflare(envTyped, from, to, subject, html, text);
        break;
      default:
        console.warn(`Unknown email provider: ${provider}`);
    }

    if (!sent) {
      console.error("Failed to send email via provider:", provider);
      return new Response(JSON.stringify({ success: false, error: "Odeslání emailu se nezdařilo. Zkuste to prosím později." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Vaše zpráva byla úspěšně odeslána." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ success: false, error: "Došlo k chybě serveru. Zkuste to prosím později." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}