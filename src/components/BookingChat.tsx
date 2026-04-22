import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

interface Props { bookingId: string; onClose: () => void; otherPartyName: string; }

const BookingChat = ({ bookingId, onClose, otherPartyName }: Props) => {
  const { currentUser, getBookingMessages, loadBookingMessages, sendMessage, subscribeBookingMessages, markBookingMessagesRead } = useApp();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgs = getBookingMessages(bookingId);

  useEffect(() => {
    loadBookingMessages(bookingId).then(() => markBookingMessagesRead(bookingId));
    const unsub = subscribeBookingMessages(bookingId);
    return unsub;
  }, [bookingId, loadBookingMessages, subscribeBookingMessages, markBookingMessagesRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    if (msgs.length > 0) markBookingMessagesRead(bookingId);
  }, [msgs.length, bookingId, markBookingMessagesRead]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(bookingId, text);
    setText(""); setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg h-[600px] bg-[#0f0e0d] border border-white/10 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Booking Chat</p>
            <h2 className="font-display text-base text-white">{otherPartyName}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
          {msgs.length === 0 && <p className="text-center text-white/30 text-sm py-12">No messages yet. Start the conversation.</p>}
          {msgs.map(m => {
            const mine = m.senderId === currentUser?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${mine ? "bg-[#c8a84b] text-black rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[9px] mt-1 ${mine ? "text-black/50" : "text-white/40"}`}>{new Date(m.createdAt).toLocaleString("en-KE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-white/10 p-4 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message…"
            className="flex-1 bg-white/5 border border-white/10 text-white text-sm py-3 px-4 rounded-lg outline-none placeholder:text-white/25"
          />
          <button onClick={handleSend} disabled={sending || !text.trim()} className="px-5 py-3 text-black text-[10px] uppercase tracking-[0.2em] font-semibold rounded-lg disabled:opacity-40" style={{ background: "#c8a84b" }}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default BookingChat;