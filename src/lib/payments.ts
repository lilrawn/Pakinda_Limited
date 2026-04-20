// ============================================================
//  Drive Harambee · Payment API Integrations
//  src/lib/payments.ts
// ============================================================
//
//  THREE PAYMENT PROVIDERS:
//  1. M-Pesa (Safaricom Daraja API) — primary for Kenya
//  2. Bank Transfer (Equity Bank / KCB API or manual)
//  3. Card Payments (Flutterwave — best card coverage in Kenya)
//
//  SETUP:
//  Add these to your .env file:
//    VITE_MPESA_CONSUMER_KEY=...
//    VITE_MPESA_CONSUMER_SECRET=...
//    VITE_MPESA_SHORTCODE=...         (Your Paybill or Till number)
//    VITE_MPESA_PASSKEY=...           (From Safaricom Daraja portal)
//    VITE_FLUTTERWAVE_PUBLIC_KEY=...  (From Flutterwave dashboard)
//    VITE_APP_URL=https://driveharambee.co.ke
//
//  NOTE: M-Pesa STK Push MUST be initiated server-side (to protect credentials).
//  Use a Supabase Edge Function or your own backend.
//  See supabase/functions/mpesa/index.ts below.
// ============================================================

export type PaymentResult = {
  success: boolean;
  reference: string;
  message: string;
  providerRef?: string;
};

// ─── 1. M-PESA STK PUSH ──────────────────────────────────────────────────────
// Call your Supabase Edge Function which proxies to Safaricom Daraja API

export async function initiateMpesaSTKPush({
  phone,
  amount,
  bookingRef,
}: {
  phone: string;
  amount: number;
  bookingRef: string;
}): Promise<PaymentResult> {
  try {
    const { supabase } = await import("./supabase");

    // Normalize phone: remove spaces, ensure +254 format
    const normalized = phone.replace(/\s+/g, "").replace(/^0/, "+254");

    const { data, error } = await supabase.functions.invoke("mpesa-stk", {
      body: {
        phone: normalized,
        amount: Math.round(amount),
        account_ref: bookingRef,
        description: `Drive Harambee · ${bookingRef}`,
      },
    });

    if (error) throw error;

    return {
      success: true,
      reference: bookingRef,
      message: `STK push sent to ${normalized}. Enter your M-Pesa PIN to complete payment.`,
      providerRef: data?.CheckoutRequestID,
    };
  } catch (err) {
    console.error("[M-Pesa]", err);
    return { success: false, reference: bookingRef, message: "M-Pesa request failed. Please try again." };
  }
}

// ─── 2. FLUTTERWAVE (Card & Bank payments) ───────────────────────────────────
// Flutterwave handles Visa, Mastercard, and bank transfers for Kenya

export async function initFlutterwavePayment({
  amount,
  email,
  name,
  phone,
  bookingRef,
  currency = "KES",
}: {
  amount: number;
  email: string;
  name: string;
  phone: string;
  bookingRef: string;
  currency?: string;
}): Promise<PaymentResult> {
  const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
  const redirectUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/booking/confirm`;

  if (!publicKey) {
    console.warn("[Flutterwave] Public key not set. Add VITE_FLUTTERWAVE_PUBLIC_KEY to .env");
    return {
      success: false,
      reference: bookingRef,
      message: "Payment gateway not configured. Contact admin.",
    };
  }

  return new Promise((resolve) => {
    // Load Flutterwave inline SDK dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => {
      // @ts-ignore — Flutterwave SDK
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: bookingRef,
        amount,
        currency,
        payment_options: "card,mpesa,bank_transfer",
        customer: { email, phone_number: phone, name },
        customizations: {
          title: "Drive Harambee",
          description: `Vehicle hire · ${bookingRef}`,
          logo: `${window.location.origin}/favicon.ico`,
        },
        callback: (response: { status: string; tx_ref: string; transaction_id: string }) => {
          if (response.status === "successful") {
            resolve({
              success: true,
              reference: response.tx_ref,
              message: "Payment successful!",
              providerRef: String(response.transaction_id),
            });
          } else {
            resolve({ success: false, reference: bookingRef, message: "Payment was not completed." });
          }
        },
        onclose: () => resolve({ success: false, reference: bookingRef, message: "Payment window closed." }),
      });
    };
    document.head.appendChild(script);
  });
}

// ─── 3. BANK TRANSFER (Manual / Equity Bank API) ─────────────────────────────
// For bank transfers, generate a unique reference and instruct the customer.
// Confirm payment manually in admin dashboard, or integrate Equity Bank API.

export function generateBankTransferInstructions(bookingRef: string, amount: number) {
  return {
    bankName: "Equity Bank Kenya",
    accountName: "Pakinda Limited",
    accountNumber: "0123456789012",
    branch: "Upper Hill, Nairobi",
    swiftCode: "EQBLKENA",
    amount: `KES ${amount.toLocaleString()}`,
    reference: bookingRef,
    instructions: [
      `Transfer exactly KES ${amount.toLocaleString()} to the account above.`,
      `Use reference code ${bookingRef} as your payment reference.`,
      "Send proof of payment to: payments@driveharambee.co.ke",
      "Your booking will be confirmed within 2 hours of payment.",
    ],
  };
}

// ─── M-PESA EDGE FUNCTION ────────────────────────────────────────────────────
// supabase/functions/mpesa-stk/index.ts — deploy with: supabase functions deploy mpesa-stk
//
// Required secrets:
//   MPESA_CONSUMER_KEY
//   MPESA_CONSUMER_SECRET
//   MPESA_SHORTCODE
//   MPESA_PASSKEY
//   MPESA_CALLBACK_URL   (e.g. https://your-project.supabase.co/functions/v1/mpesa-callback)
//
// The function below goes in supabase/functions/mpesa-stk/index.ts:

export const MPESA_EDGE_FUNCTION_CODE = `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getMpesaToken(): Promise<string> {
  const key = Deno.env.get("MPESA_CONSUMER_KEY")!;
  const secret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
  const encoded = btoa(\`\${key}:\${secret}\`);
  const res = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: \`Basic \${encoded}\` } }
  );
  const { access_token } = await res.json();
  return access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { phone, amount, account_ref, description } = await req.json();
  const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
  const passkey = Deno.env.get("MPESA_PASSKEY")!;
  const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL")!;

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,14);
  const password = btoa(\`\${shortcode}\${passkey}\${timestamp}\`);
  const token = await getMpesaToken();

  const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
    method: "POST",
    headers: { Authorization: \`Bearer \${token}\`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone.replace("+",""),
      PartyB: shortcode,
      PhoneNumber: phone.replace("+",""),
      CallBackURL: callbackUrl,
      AccountReference: account_ref,
      TransactionDesc: description,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
`;
