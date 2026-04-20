import { useState } from "react";
import { Car } from "@/data/fleet";

interface BookingModalProps {
  car: Car;
  onClose: () => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBefore(a: Date, b: Date) {
  return a < b && !sameDay(a, b);
}

const BookingModal = ({ car, onClose }: BookingModalProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [step, setStep] = useState<"calendar" | "details" | "confirm">("calendar");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);

  const handlePrevMonth = () => {
    setViewDate((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: v.month - 1 };
    });
  };
  const handleNextMonth = () => {
    setViewDate((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: v.month + 1 };
    });
  };

  const handleDayClick = (d: Date) => {
    if (isBefore(d, today)) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
    } else {
      if (isBefore(d, startDate)) {
        setStartDate(d);
        setEndDate(null);
      } else if (sameDay(d, startDate)) {
        setStartDate(null);
      } else {
        setEndDate(d);
      }
    }
  };

  const isInRange = (d: Date) => {
    const end = endDate || hoveredDate;
    if (!startDate || !end) return false;
    const [lo, hi] = isBefore(end, startDate) ? [end, startDate] : [startDate, end];
    return !isBefore(d, lo) && !isBefore(hi, d) && !sameDay(d, lo) && !sameDay(d, hi);
  };
  const isStart = (d: Date) => !!startDate && sameDay(d, startDate);
  const isEnd = (d: Date) => !!endDate && sameDay(d, endDate);
  const isPast = (d: Date) => isBefore(d, today);

  const numDays = (() => {
    if (!startDate || !endDate) return 0;
    return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
  })();
  const totalPrice = numDays * car.pricePerDay;

  const formatDate = (d: Date) =>
    `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  const handleConfirm = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  // Build grid cells
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(viewDate.year, viewDate.month, i));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl bg-[#0f0e0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">Reserve · Drive Harambee</p>
            <h2 className="font-display text-xl text-white">{car.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-2xl leading-none">×</button>
        </div>

        {submitted ? (
          // Success screen
          <div className="px-8 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#c8a84b]/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-[#c8a84b] text-2xl">✓</span>
            </div>
            <h3 className="font-display text-2xl text-white mb-3">Reservation Submitted</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto mb-2">
              Thank you, {name.split(" ")[0]}. Our team will confirm your booking within 2 hours via WhatsApp and email.
            </p>
            <p className="text-[#c8a84b] text-sm font-medium mb-8">
              {startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)} · KES ${totalPrice.toLocaleString()}` : ""}
            </p>
            <button onClick={onClose} className="px-8 py-3 bg-[#c8a84b] text-black text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-[#d4b95e] transition-colors">
              Close
            </button>
          </div>
        ) : step === "calendar" ? (
          <div className="p-8">
            {/* Price strip */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Per Day</span>
                <p className="font-display text-2xl text-[#c8a84b]">KES {car.pricePerDay.toLocaleString()}</p>
              </div>
              {numDays > 0 && (
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{numDays} {numDays === 1 ? "Day" : "Days"} Total</span>
                  <p className="font-display text-2xl text-white">KES {totalPrice.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Calendar nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">‹</button>
              <span className="text-sm font-medium text-white tracking-wide">
                {MONTHS[viewDate.month]} {viewDate.year}
              </span>
              <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">›</button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] uppercase tracking-wider text-white/30 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} />;
                const past = isPast(d);
                const start = isStart(d);
                const end = isEnd(d);
                const inRange = isInRange(d);
                const isToday = sameDay(d, today);

                return (
                  <div
                    key={toKey(d)}
                    className={`relative flex items-center justify-center h-9 text-sm cursor-pointer select-none transition-all duration-150
                      ${past ? "text-white/15 cursor-not-allowed" : "hover:text-white"}
                      ${inRange ? "bg-[#c8a84b]/15 text-white/80" : ""}
                      ${start || end ? "bg-[#c8a84b] text-black font-semibold rounded-lg" : ""}
                      ${!start && !end && !inRange && !past ? "text-white/70 hover:bg-white/5 rounded-lg" : ""}
                      ${isToday && !start && !end ? "text-[#c8a84b]" : ""}
                    `}
                    onClick={() => !past && handleDayClick(d)}
                    onMouseEnter={() => !past && startDate && !endDate && setHoveredDate(d)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Selection summary */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-white/50">
                {!startDate && "Select check-in date"}
                {startDate && !endDate && (
                  <span>From <span className="text-white">{formatDate(startDate)}</span> — select return date</span>
                )}
                {startDate && endDate && (
                  <span>
                    <span className="text-white">{formatDate(startDate)}</span>
                    <span className="text-white/30 mx-2">→</span>
                    <span className="text-white">{formatDate(endDate)}</span>
                  </span>
                )}
              </div>
              <button
                disabled={!startDate || !endDate}
                onClick={() => setStep("details")}
                className="px-6 py-2.5 bg-[#c8a84b] text-black text-[10px] uppercase tracking-[0.25em] font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#d4b95e] transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        ) : step === "details" ? (
          <div className="p-8">
            {/* Booking summary */}
            <div className="bg-white/5 rounded-xl p-5 mb-6 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Your Dates</p>
                <p className="text-white text-sm">{startDate && formatDate(startDate)} → {endDate && formatDate(endDate)}</p>
                <p className="text-white/50 text-xs mt-1">{numDays} {numDays === 1 ? "day" : "days"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Total</p>
                <p className="font-display text-2xl text-[#c8a84b]">KES {totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. James Kamau"
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#c8a84b] outline-none py-3 text-white text-sm placeholder:text-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">WhatsApp / Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#c8a84b] outline-none py-3 text-white text-sm placeholder:text-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">Email Address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#c8a84b] outline-none py-3 text-white text-sm placeholder:text-white/20 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button onClick={() => setStep("calendar")} className="text-white/40 hover:text-white text-[10px] uppercase tracking-[0.25em] transition-colors">
                ← Back
              </button>
              <button
                disabled={!name.trim() || !phone.trim() || !email.trim()}
                onClick={handleConfirm}
                className="flex-1 py-4 bg-[#c8a84b] text-black text-[11px] uppercase tracking-[0.25em] font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#d4b95e] transition-colors"
              >
                Confirm Reservation · KES {totalPrice.toLocaleString()}
              </button>
            </div>
            <p className="text-white/25 text-xs text-center mt-4">No payment required now. Our team will contact you within 2 hours.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookingModal;
