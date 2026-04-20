import { createClient } from "@supabase/supabase-js";

// ─── Environment variables ────────────────────────────────────────────────────
// Create a .env file in the project root with these values:
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Pakinda Limited] Supabase env vars not set. " +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file. " +
    "The app will run in local-storage-only mode until then."
  );
}

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder"
);

// ─── Database types (mirrors Supabase schema) ─────────────────────────────────
export type DB_User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number: string;
  license_number: string;
  id_image_url: string;
  license_image_url: string;
  role: "client" | "admin";
  created_at: string;
};

export type DB_FleetCar = {
  id: string;
  slug: string;
  name: string;
  series: string;
  category: string;
  image_url: string;
  spec_hp: string;
  spec_top: string;
  spec_zero: string;
  price_per_day: number;
  description: string;
  features: string[];
  available: boolean;
  created_at: string;
};

export type DB_Booking = {
  id: string;
  car_id: string;
  car_name: string;
  car_slug: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_id_number: string;
  user_license_number: string;
  user_id_image_url: string;
  user_license_image_url: string;
  start_date: string;
  end_date: string;
  num_days: number;
  price_per_day: number;
  total_price: number;
  payment_method: string;
  payment_ref: string;
  status: string;
  pickup_location: string;
  returned_at: string | null;
  return_condition: string | null;
  return_notes: string | null;
  admin_notes: string | null;
  created_at: string;
};

export type DB_ServiceRecord = {
  id: string;
  car_id: string;
  last_service_date: string;
  next_service_date: string;
  service_notes: string;
  updated_at: string;
};

export type DB_MarketListing = {
  id: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  asking_price: number;
  description: string;
  image_urls: string[];
  status: "pending" | "approved" | "rejected" | "sold";
  admin_notes: string | null;
  created_at: string;
};

export type DB_Notification = {
  id: string;
  user_id: string;
  type: "booking" | "document" | "approval" | "return" | "system";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

/** Upload a base64 data-URL to Supabase Storage and return the public URL */
export async function uploadBase64(
  bucket: string,
  path: string,
  dataUrl: string
): Promise<string> {
  // Convert base64 to blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] || "jpg";
  const fullPath = `${path}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, blob, { upsert: true, contentType: blob.type });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  return data.publicUrl;
}

/** Upload a File object to Supabase Storage and return the public URL */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const fullPath = `${path}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  return data.publicUrl;
}

// ─── Notification senders ────────────────────────────────────────────────────

/**
 * Send a notification via Supabase Edge Function.
 * The edge function handles email (Resend), SMS (Africa's Talking), and WhatsApp (Twilio/360dialog).
 * See: supabase/functions/notify/index.ts
 */
export async function sendNotification(payload: {
  type: "email" | "sms" | "whatsapp" | "in_app";
  to: string;           // email address or phone number (+254...)
  subject?: string;     // for email
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.functions.invoke("notify", { body: payload });
  } catch (err) {
    console.warn("[Notify] Failed to send notification:", err);
  }
}

/** Create an in-app notification record */
export async function createInAppNotification(userId: string, title: string, message: string, type: DB_Notification["type"] = "system") {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    read: false,
  });
}
