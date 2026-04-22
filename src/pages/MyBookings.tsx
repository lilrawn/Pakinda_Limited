import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import BookingChat from "@/components/BookingChat";
import Navbar from "@/components/Navbar";

const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate=(iso:string)=>{if(!iso)return"—";const d=new Date(iso);return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;};

const MyBookings = () => {
  const { currentUser, getUserBookings, unreadMessagesByBooking } = useApp();
  const [chatId,setChatId]=useState<string|null>(null);
  if (!currentUser) return <Navigate to="/auth" replace />;
  const myBookings = getUserBookings(currentUser.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar/>
      {chatId && <BookingChat bookingId={chatId} otherPartyName="Pakinda Limited Admin" onClose={()=>setChatId(null)}/>}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <h1 className="font-display text-4xl mb-2">My Bookings</h1>
        <p className="text-foreground/50 text-sm mb-10">Track verification, chat with the admin, and manage your hires.</p>
        {myBookings.length===0 ? (
          <div className="text-center py-20 border border-foreground/10 rounded-xl">
            <p className="text-foreground/40 mb-4">You haven't booked any vehicles yet.</p>
            <Link to="/" className="text-[#c8a84b] text-sm uppercase tracking-widest">Browse the fleet →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map(b=>{
              const unread = unreadMessagesByBooking[b.id]||0;
              const vs = b.verificationStatus||"pending";
              return (
                <div key={b.id} className="bg-[#0f0e0d] border border-white/10 rounded-xl p-6 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-display text-xl">{b.carName}</p>
                      <p className="text-white/40 text-xs mt-1">{fmtDate(b.startDate)} → {fmtDate(b.endDate)} · {b.numDays} day(s) · {b.pickupLocation}</p>
                      <p className="text-white/40 text-xs mt-1">Ref: <span className="font-mono">{b.id.slice(0,8).toUpperCase()}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl" style={{color:"#c8a84b"}}>KES {b.totalPrice.toLocaleString()}</p>
                      <span className={`inline-block mt-2 text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full ${vs==="approved"?"bg-green-500/20 text-green-400":vs==="rejected"?"bg-red-500/20 text-red-400":"bg-amber-500/20 text-amber-400"}`}>Docs {vs}</span>
                    </div>
                  </div>

                  {vs==="pending" && <p className="text-white/50 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">Our admin is verifying your documents. You'll be notified and contacted on chat with payment instructions once approved.</p>}
                  {vs==="approved" && <p className="text-white/70 text-xs bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">✓ Documents approved. Check the chat for payment instructions from the admin.</p>}
                  {vs==="rejected" && <div className="text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3"><p className="text-red-400 mb-1">Documents rejected.</p>{b.verificationNotes && <p className="text-white/60">Reason: {b.verificationNotes}</p>}</div>}

                  <button onClick={()=>setChatId(b.id)} className="px-4 py-2 border border-[#c8a84b]/40 text-[#c8a84b] text-[10px] uppercase tracking-[0.2em] rounded relative">
                    💬 Chat with Admin
                    {unread>0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{unread}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;