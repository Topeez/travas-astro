# Cloudflare Pages Functions + Email Setup Guide

This guide explains how to set up the contact form with Cloudflare Pages Functions and email delivery.

## Overview

The form now submits to `/api/contact` (a Cloudflare Pages Function) which:
1. Validates the form data server-side
2. Verifies Cloudflare Turnstile (if configured)
3. Checks honeypot field
4. Sends email via your chosen provider (Resend, SendGrid, Mailgun, or Cloudflare Email Workers)
5. Returns JSON response

## Quick Setup Checklist

- [ ] Choose and configure email provider
- [ ] Set environment variables in Cloudflare Pages Dashboard
- [ ] (Optional) Set up Cloudflare Turnstile for spam protection
- [ ] Deploy and test

---

## 1. Email Provider Setup

### Option A: Resend (Recommended - Free tier generous)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (`travasstineni.cz`)
3. Create API key: Settings → API Keys → Create
4. Set in Cloudflare:
   ```
   EMAIL_PROVIDER=resend
   EMAIL_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@travasstineni.cz
   EMAIL_TO=info@travasstineni.cz
   ```

### Option B: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify sender identity
3. Create API key with Mail Send permissions
4. Set in Cloudflare:
   ```
   EMAIL_PROVIDER=sendgrid
   EMAIL_API_KEY=SG.xxxxxxxxxxxx
   EMAIL_FROM=noreply@travasstineni.cz
   EMAIL_TO=info@travasstineni.cz
   ```

### Option C: Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Add and verify domain
2. Create API key
4. Set in Cloudflare:
   ```
   EMAIL_PROVIDER=mailgun
   EMAIL_API_KEY=your_api_key
   EMAIL_DOMAIN=mg.travasstineni.cz
   EMAIL_FROM=noreply@travasstineni.cz
   EMAIL_TO=info@travasstineni.cz
   ```

### Option D: Cloudflare Email Workers (Advanced)

Requires setting up Cloudflare Email Routing:
1. In Cloudflare Dashboard → Email → Email Routing
2. Create custom address: `contact@travasstineni.cz`
3. Route to a Worker that forwards to your email
4. Set in Cloudflare:
   ```
   EMAIL_PROVIDER=cloudflare
   ```

> **Note**: The Cloudflare Email Workers implementation in the code is a placeholder. You'll need to implement the actual email forwarding logic based on your Email Routing setup.

---

## 2. Configure Environment Variables in Cloudflare

### Via Dashboard (Recommended for Production)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your Pages project (`travas-astro`)
3. Settings → Environment variables
4. Add each variable:
   - **Variable name**: `EMAIL_PROVIDER`, **Value**: `resend` (or your choice)
   - **Variable name**: `EMAIL_API_KEY`, **Value**: `re_xxxxx...` (mark as **Secret**)
   - **Variable name**: `EMAIL_FROM`, **Value**: `noreply@travasstineni.cz`
   - **Variable name**: `EMAIL_TO`, **Value**: `info@travasstineni.cz`
   - **Variable name**: `HONEYPOT_FIELD`, **Value**: `website`
   - **Variable name**: `TURNSTILE_SECRET_KEY`, **Value**: `0x4AAAAAAA...` (mark as **Secret**)

### Via Wrangler CLI (For Secrets)

```bash
# Set secrets (won't appear in dashboard)
wrangler pages secret put EMAIL_API_KEY --project-name=travas-astro
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=travas-astro

# Set plain variables
wrangler pages deployment create --project-name=travas-astro --var EMAIL_PROVIDER=resend --var EMAIL_FROM=noreply@travasstineni.cz --var EMAIL_TO=info@travasstineni.cz
```

---

## 3. Cloudflare Turnstile Setup (Optional but Recommended)

### Create Turnstile Widget

1. Go to [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click "Add Site"
3. Domain: `travasstineni.cz` (add `localhost` for dev)
4. Widget mode: **Managed** (invisible) or **Non-interactive**
5. Get **Site Key** (public) and **Secret Key** (private)

### Configure in Project

**Client-side (public):**
- Add to Cloudflare Pages env vars: `TURNSTILE_SITE_KEY=0x4AAAAAAA...`
- Or create `.env.local` for local dev:
  ```
  TURNSTILE_SITE_KEY=0x4AAAAAAA...
  ```

**Server-side (secret):**
- Add to Cloudflare Pages env vars as **Secret**: `TURNSTILE_SECRET_KEY=0x4AAAAAAA...`

The form will automatically:
- Load Turnstile script when site key is present
- Render invisible challenge
- Include token in form submission
- Verify token server-side

---

## 4. Local Development

### Test with Wrangler Pages Dev

```bash
# Build first
pnpm build

# Run local Pages dev server with functions
pnpm wrangler pages dev dist --compatibility-flag=nodejs_compat
```

### Local Environment Variables

Create `.env.local` (not committed):
```bash
cp .env.example .env.local
# Edit with your local test keys
```

> **Note**: Local dev won't have access to Cloudflare secrets. For testing email sending locally, you may need to temporarily use a test API key in `.env.local`.

---

## 5. Deployment

### Automatic (GitHub Integration)

Push to your production branch - Cloudflare will:
1. Run `pnpm build`
2. Deploy to Pages
3. Functions automatically deployed with the build

### Manual Deploy

```bash
pnpm build
wrangler pages deploy dist --project-name=travas-astro
```

---

## 6. Testing Checklist

After deployment, test:

- [ ] Form submits successfully
- [ ] Email received at `EMAIL_TO` address
- [ ] Validation errors display correctly (empty fields, invalid email, short phone)
- [ ] Success toast appears
- [ ] Form resets after success
- [ ] Turnstile works (if configured) - try submitting rapidly
- [ ] Honeypot works - use browser devtools to fill hidden `website` field and submit (should silently succeed but not send email)
- [ ] Rate limiting - submit multiple times quickly

---

## 7. Troubleshooting

### Form submits but no email received

1. Check Cloudflare Pages Function logs:
   - Dashboard → Pages → `travas-astro` → Functions → View logs
2. Check email provider dashboard for delivery status
3. Verify `EMAIL_FROM` is verified in your email provider
4. Check spam folder

### Turnstile not loading

1. Verify `TURNSTILE_SITE_KEY` is set in Pages env vars
2. Check browser console for errors
3. Ensure domain is added in Turnstile widget settings

### CORS errors

The function includes CORS headers. If testing from different origin locally, add:
```bash
# In .env.local for dev
ALLOWED_ORIGIN=http://localhost:4321
```

---

## 8. Security Notes

- **Never commit secrets** to git (`.env.local`, `.env` are gitignored)
- **Use Cloudflare secrets** for API keys and Turnstile secret
- **Honeypot field** provides basic bot protection even without Turnstile
- **Server-side validation** prevents bypassing client validation
- **Rate limiting** can be added via Cloudflare WAF rules

---

## 9. Costs

| Service | Free Tier |
|---------|-----------|
| Cloudflare Pages Functions | 100,000 requests/day |
| Resend | 3,000 emails/month |
| SendGrid | 100 emails/day |
| Mailgun | 5,000 emails/month (3 months) |
| Cloudflare Turnstile | 1,000,000 calls/month |

All well within free tiers for a contact form.

---

## Files Changed

- `src/functions/api/contact.ts` - Pages Function endpoint
- `src/components/contact-form.tsx` - Updated form with Turnstile
- `wrangler.jsonc` - Updated with vars and compatibility flags
- `.env.example` - Environment variables documentation
- `CLOUDFLARE_SETUP.md` - This guide