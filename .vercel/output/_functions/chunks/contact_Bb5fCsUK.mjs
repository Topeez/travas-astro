import nodemailer from 'nodemailer';
import { z } from 'zod';

const contactFormSchema = z.object({
  fullname: z.string().min(2, "Jméno musí mít alespoň 2 znaky").max(50, "Jméno nesmí překročit 50 znaků").trim(),
  email: z.string().email("Neplatná emailová adresa").max(100, "Email nesmí překročit 100 znaků").toLowerCase().trim(),
  phone: z.string().min(10, "Telefonní číslo musí mít alespoň 10 znaků").max(16, "Telefonní číslo je příliš dlouhé"),
  message: z.string().min(10, "Zpráva musí mít alespoň 10 znaků").max(1e3, "Zpráva nesmí překročit 1000 znaků").trim(),
  honeypot: z.string().optional()
});

const prerender = false;
const rateLimitMap = /* @__PURE__ */ new Map();
function checkRateLimit(ip, limit = 5, windowMs = 6e4) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (userLimit.count >= limit) {
    return false;
  }
  userLimit.count++;
  return true;
}
function sanitizeInput(input) {
  return input.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").trim();
}
function createEmailTransport() {
  return nodemailer.createTransport({
    host: "smtp.seznam.cz",
    port: 465,
    secure: true,
    auth: {
      // V Astro k ENV přistupuješ přes import.meta.env místo process.env
      user: "travas-formular-bot@seznam.cz",
      pass: "a+j~-NAqbu6nxX."
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
const corsHeaders = {
  // Stejně tak import.meta.env pro ALLOWED_ORIGINS
  "Access-Control-Allow-Origin": "http://localhost:4321",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};
const jsonResponse = (body, status) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
};
const POST = async ({ request, clientAddress }) => {
  try {
    const ip = clientAddress || "unknown";
    if (!checkRateLimit(ip)) {
      return jsonResponse({ error: "Příliš mnoho požadavků. Zkuste to prosím později." }, 429);
    }
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return jsonResponse({ error: "Neplatný formát obsahu." }, 400);
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Neplatný JSON formát." }, 400);
    }
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse({
        error: "Chyba validace",
        details: parsed.error.format()
      }, 400);
    }
    const { fullname, email, phone, message, honeypot } = parsed.data;
    if (honeypot) {
      return jsonResponse({ success: true, message: "Zpráva byla úspěšně odeslána!" }, 200);
    }
    const sanitizedData = {
      name: sanitizeInput(fullname),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      message: sanitizeInput(message.replace(/\n/g, "<br>"))
    };
    const transporter = createEmailTransport();
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verifikace spojení selhala:", verifyError);
      return jsonResponse({ error: "Chyba připojení k emailovému serveru." }, 500);
    }
    const mailOptions = {
      from: `"${sanitizedData.name}" <${"travas-formular-bot@seznam.cz"}>`,
      to: "info@travasstineni.cz",
      replyTo: sanitizedData.email,
      subject: `Nová zpráva z webu od ${sanitizedData.name}`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5ca437; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        Nová zpráva z kontaktního formuláře
                    </h2>
                    <div style="background: transparent; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Jméno:</strong> ${sanitizedData.name}</p>
                        <p style="margin: 10px 0;"><strong>Email:</strong> 
                            <a href="mailto:${sanitizedData.email}" style="color: #2563eb;">
                                ${sanitizedData.email}
                            </a>
                        </p>
                        <p style="margin: 10px 0;"><strong>Telefon:</strong> ${sanitizedData.phone}</p>
                        <p style="margin: 10px 0;"><strong>Čas odeslání:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("cs-CZ")}</p>
                    </div>
                    <div style="background: transparent; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h3 style="color: #374151; margin-top: 0;">Zpráva:</h3>
                        <p style="line-height: 1.6; color: #4b5563;">${sanitizedData.message}</p>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        Tato zpráva byla odeslána z kontaktního formuláře na webu travasstineni.cz
                    </p>
                </div>
            `,
      text: `
                    Nová zpráva z kontaktního formuláře

                    Jméno: ${sanitizedData.name}
                    Email: ${sanitizedData.email}
                    Telefon: ${sanitizedData.phone}
                    Čas odeslání: ${(/* @__PURE__ */ new Date()).toLocaleString("cs-CZ")}

                    Zpráva:
                    ${message}

                    ---
                    Tato zpráva byla odeslána z kontaktního formuláře na webu travasstineni.cz
            `.trim()
    };
    await transporter.sendMail(mailOptions);
    return jsonResponse({ success: true, message: "Zpráva byla úspěšně odeslána!" }, 200);
  } catch (error) {
    console.error("Chyba při odesílání zprávy:", error);
    if (error && typeof error === "object" && "code" in error) {
      console.error("SMTP kód chyby:", error.code);
      console.error("SMTP chybová odpověď:", error.response);
    }
    return jsonResponse({ error: "Nastala chyba při odesílání zprávy. Zkuste to prosím později." }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    OPTIONS,
    POST,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
