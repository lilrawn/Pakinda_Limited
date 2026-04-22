
-- 1. Booking verification fields
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Make payment fields fully optional (already nullable per schema, but ensure default 'pending' status remains useful)
-- No structural change needed; payment_method already nullable.

-- 2. Messages table (per-booking chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('client','admin')),
  body text NOT NULL,
  read_by_recipient boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking_created ON public.messages(booking_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Read: client (booking owner) and admin
CREATE POLICY "Booking participants read messages"
ON public.messages FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  )
);

-- Insert: client only into own bookings as 'client'; admin into any as 'admin'
CREATE POLICY "Client sends own booking messages"
ON public.messages FOR INSERT
WITH CHECK (
  sender_role = 'client'
  AND auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Admin sends booking messages"
ON public.messages FOR INSERT
WITH CHECK (
  sender_role = 'admin'
  AND auth.uid() = sender_id
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Update (mark read): only the recipient side (anyone in the thread, scoped by select policy)
CREATE POLICY "Participants mark messages read"
ON public.messages FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  )
)
WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
