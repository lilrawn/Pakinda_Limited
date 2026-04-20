// supabase/functions/notify/index.ts
// Deploy with: supabase functions deploy notify
//
// Required secrets (set via: supabase secrets set KEY=value):
//   RESEND_API_KEY          - https://resend.com  (email)
//   AFRICASTALKING_API_KEY  - https://africastalking.com  (SMS Kenya)
//   AFRICASTALKING_USERNAME - Your Africa's Talking username
//   TWILIO_ACCOUNT_SID      - https://twilio.com  (WhatsApp via Twilio)
//   TWILIO_AUTH_TOKEN
//   TWILIO_WHATSAPP_FROM    - e.g. whatsapp:+14155238886
//   ADMIN_EMAIL             - admin@driveharambee.co.ke
//   ADMIN_PHONE             - +254700000000

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { type, to, subject, message, metadata } = await req.json();

  const results: Record<string, unknown> = {};

  try {
    // ── Email via Resend ──────────────────────────────────────────
    if (type === "email" || type === "all") {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Pakinda Limited <noreply@pakindalimited@gmail.com>",
            to: [to],
            subject: subject || "Pakinda Limited Notification",
            html: `
              <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#faf9f7;padding:40px">
                <h1 style="font-size:24px;color:#1a1815;margin-bottom:8px">Pakinda Limited</h1>
                <p style="color:#9a8f7a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px">Nairobi · Kenya</p>
                <div style="background:#fff;border:1px solid #e8e4dd;padding:32px;border-radius:8px">
                  <p style="color:#1a1815;font-size:16px;line-height:1.6">${message}</p>
                  ${metadata ? `<pre style="background:#f5f4f2;padding:16px;font-size:12px;color:#666;margin-top:16px;border-radius:4px">${JSON.stringify(metadata, null, 2)}</pre>` : ""}
                </div>
                <p style="color:#bbb;font-size:11px;margin-top:24px;text-align:center">Pakinda Limited · pakindalimited@gmail.com · +254 706504698</p>
              </div>
            `,
          }),
        });
        results.email = await emailRes.json();
      }
    }

    // ── SMS via Africa's Talking ──────────────────────────────────
    if (type === "sms" || type === "all") {
      const atKey = Deno.env.get("AFRICASTALKING_API_KEY");
      const atUser = Deno.env.get("AFRICASTALKING_USERNAME");
      if (atKey && atUser) {
        const smsRes = await fetch("https://api.africastalking.com/version1/messaging", {
          method: "POST",
          headers: {
            apiKey: atKey,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: atUser,
            to,
            message: message.slice(0, 160),
            from: "DriveHarambee",
          }).toString(),
        });
        results.sms = await smsRes.json();
      }
    }

    // ── WhatsApp via Twilio ───────────────────────────────────────
    if (type === "whatsapp" || type === "all") {
      const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const token = Deno.env.get("TWILIO_AUTH_TOKEN");
      const from = Deno.env.get("TWILIO_WHATSAPP_FROM");
      if (sid && token && from) {
        const waRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: from,
            To: `whatsapp:${to}`,
            Body: `*Pakinda Limited*\n\n${message}`,
          }).toString(),
        });
        results.whatsapp = await waRes.json();
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
