export const prerender = false;

import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import { contactFormSchema } from "../../../schemas/contact-form-scheme";

// Rate limiting with Map (simple in-memory solution)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
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

function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
}

// Odesílání přes Seznam
function createEmailTransport() {
  return nodemailer.createTransport({
      host: 'smtp.seznam.cz',
      port: 465,
      secure: true,
      auth: {
          // V Astro k ENV přistupuješ přes import.meta.env místo process.env
          user: import.meta.env.SMTP_USER, 
          pass: import.meta.env.SMTP_PASS, 
      },
      tls: {
          rejectUnauthorized: false
      }
  });
}

// CORS headers
const corsHeaders = {
    // Stejně tak import.meta.env pro ALLOWED_ORIGINS
    'Access-Control-Allow-Origin': import.meta.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
};

// Pomocná funkce pro vracení JSON odpovědí
const jsonResponse = (body: any, status: number) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    });
};

export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        // Získání IP je v Astru mnohem snazší, nepotřebuješ funkci getClientIP
        const ip = clientAddress || 'unknown';
        
        // Rate limiting check
        if (!checkRateLimit(ip)) {
            return jsonResponse({ error: "Příliš mnoho požadavků. Zkuste to prosím později." }, 429);
        }

        // Validate Content-Type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return jsonResponse({ error: "Neplatný formát obsahu." }, 400);
        }

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ error: "Neplatný JSON formát." }, 400);
        }

        // Validate input
        const parsed = contactFormSchema.safeParse(body);
        if (!parsed.success) {
            return jsonResponse({ 
                error: "Chyba validace",
                details: parsed.error.format()
            }, 400);
        }

        const { fullname, email, phone, message, honeypot } = parsed.data;

        // Honeypot check (silent failure for bots)
        if (honeypot) {
            return jsonResponse({ success: true, message: "Zpráva byla úspěšně odeslána!" }, 200);
        }

        // Sanitize input
        const sanitizedData = {
            name: sanitizeInput(fullname),
            email: sanitizeInput(email),
            phone: sanitizeInput(phone),
            message: sanitizeInput(message.replace(/\n/g, '<br>')),
        };

        const transporter = createEmailTransport();

        // Verify connection
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error('SMTP verifikace spojení selhala:', verifyError);
            return jsonResponse({ error: "Chyba připojení k emailovému serveru." }, 500);
        }

        // Email options
        const mailOptions = {
            from: `"${sanitizedData.name}" <${import.meta.env.SMTP_USER}>`, 
            to: import.meta.env.SMTP_TO || 'info@travasstineni.cz', 
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
                        <p style="margin: 10px 0;"><strong>Čas odeslání:</strong> ${new Date().toLocaleString('cs-CZ')}</p>
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
                    Čas odeslání: ${new Date().toLocaleString('cs-CZ')}

                    Zpráva:
                    ${message}

                    ---
                    Tato zpráva byla odeslána z kontaktního formuláře na webu travasstineni.cz
            `.trim(),
        };

        // Send email
        await transporter.sendMail(mailOptions);


        return jsonResponse({ success: true, message: "Zpráva byla úspěšně odeslána!" }, 200);

    } catch (error) {
        console.error("Chyba při odesílání zprávy:", error);
        
        if (error && typeof error === 'object' && 'code' in error) {
            console.error("SMTP kód chyby:", error.code);
            console.error("SMTP chybová odpověď:", (error as unknown as { response: string }).response);
        }
        
        return jsonResponse({ error: "Nastala chyba při odesílání zprávy. Zkuste to prosím později." }, 500);
    }
};
