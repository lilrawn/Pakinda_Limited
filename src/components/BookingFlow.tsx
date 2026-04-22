import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { FleetCar } from "@/context/AppContext";

interface BookingFlowProps { car: FleetCar; onClose: () => void; }

const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];
function toKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function sameDay(a:Date,b:Date){return toKey(a)===toKey(b);}
function isBefore(a:Date,b:Date){return a<b&&!sameDay(a,b);}
function fmtDate(d:Date){return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;}
function toDateOnly(d:Date){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}

const BookingFlow=({car,onClose}:BookingFlowProps)=>{
  const {currentUser,createBooking,getBookedDates,updateUser}=useApp();
  const navigate=useNavigate();
  const today=toDateOnly(new Date());
  const bookedRanges=getBookedDates(car.id);

  const isBooked=(d:Date)=>{const k=toKey(d);return bookedRanges.some(r=>k>=r.start&&k<=r.end);};

  type Step="docs"|"calendar"|"review"|"success";
  // Always require docs step (per booking documents are mandatory)
  const needsDocs=!currentUser?.idImageUrl||!currentUser?.licenseImageUrl||!currentUser?.idNumber||!currentUser?.licenseNumber||!currentUser?.name||!currentUser?.phone;
  const [step,setStep]=useState<Step>(needsDocs?"docs":"calendar");

  // Docs step state
  const [docName,setDocName]=useState(currentUser?.name||"");
  const [docPhone,setDocPhone]=useState(currentUser?.phone||"");
  const [docEmail,setDocEmail]=useState(currentUser?.email||"");
  const [docIdNumber,setDocIdNumber]=useState(currentUser?.idNumber||"");
  const [docLicNumber,setDocLicNumber]=useState(currentUser?.licenseNumber||"");
  const [idPreview,setIdPreview]=useState(currentUser?.idImageUrl||"");
  const [licPreview,setLicPreview]=useState(currentUser?.licenseImageUrl||"");
  const [docErrors,setDocErrors]=useState<Record<string,string>>({});
  const [savingDocs,setSavingDocs]=useState(false);
  const idRef=useRef<HTMLInputElement>(null); const licRef=useRef<HTMLInputElement>(null);

  const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>,type:"id"|"lic")=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{const d=ev.target?.result as string; if(type==="id"){setIdPreview(d);}else{setLicPreview(d);}};
    r.readAsDataURL(f);
  };

  const handleSaveDocs=async()=>{
    const e:Record<string,string>={};
    if(!docName.trim()) e.name="Full name required";
    if(!docPhone.trim()) e.phone="Phone required";
    if(!docEmail.trim()) e.email="Email required";
    if(!docIdNumber.trim()) e.idNumber="National ID number required";
    if(!docLicNumber.trim()) e.licNumber="License number required";
    if(!idPreview) e.idFile="National ID photo required";
    if(!licPreview) e.licFile="Driver's license photo required";
    if(Object.keys(e).length>0){setDocErrors(e);return;}
    setSavingDocs(true);
    if(currentUser) await updateUser(currentUser.id,{name:docName,phone:docPhone,idNumber:docIdNumber,licenseNumber:docLicNumber,idImageUrl:idPreview,licenseImageUrl:licPreview});
    setSavingDocs(false); setStep("calendar");
  };

  // Calendar
  const [viewDate,setViewDate]=useState({year:today.getFullYear(),month:today.getMonth()});
  const [startDate,setStartDate]=useState<Date|null>(null);
  const [endDate,setEndDate]=useState<Date|null>(null);
  const [hoveredDate,setHoveredDate]=useState<Date|null>(null);
  const [pickupLocation,setPickupLocation]=useState("Nairobi CBD");

  const daysInMonth=new Date(viewDate.year,viewDate.month+1,0).getDate();
  const firstDay=new Date(viewDate.year,viewDate.month,1).getDay();

  const isInRange=(d:Date)=>{const end=endDate||hoveredDate; if(!startDate||!end) return false; const[lo,hi]=isBefore(end,startDate)?[end,startDate]:[startDate,end]; return!isBefore(d,lo)&&!isBefore(hi,d)&&!sameDay(d,lo)&&!sameDay(d,hi);};
  const handleDayClick=(d:Date)=>{
    if(isBefore(d,today)||isBooked(d)) return;
    if(!startDate||(startDate&&endDate)){setStartDate(d);setEndDate(null);}
    else{if(isBefore(d,startDate)){setStartDate(d);setEndDate(null);}else if(sameDay(d,startDate)){setStartDate(null);}else{setEndDate(d);}}
  };

  const numDays=startDate&&endDate?Math.round((endDate.getTime()-startDate.getTime())/86400000):0;
  const totalPrice=numDays*car.pricePerDay;

  const cells:(Date|null)[]=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let i=1;i<=daysInMonth;i++) cells.push(new Date(viewDate.year,viewDate.month,i));

  const [submitting,setSubmitting]=useState(false);
  const [bookingRef,setBookingRef]=useState("");

  const handleSubmitBooking=async()=>{
    if(!currentUser||!startDate||!endDate) return;
    setSubmitting(true);
    try{
      const booking=await createBooking({
        carId:car.id,carName:car.name,carSlug:car.slug,
        userId:currentUser.id,userName:currentUser.name||docName,
        userEmail:currentUser.email||docEmail,userPhone:currentUser.phone||docPhone,
        userIdNumber:currentUser.idNumber||docIdNumber,userLicenseNumber:currentUser.licenseNumber||docLicNumber,
        userIdImageUrl:currentUser.idImageUrl||idPreview,userLicenseImageUrl:currentUser.licenseImageUrl||licPreview,
        startDate:toKey(startDate),endDate:toKey(endDate),numDays,pricePerDay:car.pricePerDay,totalPrice,
        paymentMethod:null,paymentRef:null,status:"pending",pickupLocation,
        verificationStatus:"pending",verificationNotes:null,
      });
      setBookingRef(booking.id);
      setStep("success");
    } catch(err){ console.error(err); }
    finally{ setSubmitting(false); }
  };

  return(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
      <div className="relative w-full max-w-xl bg-[#0f0e0d] border border-white/10 rounded-2xl shadow-2xl" style={{maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#0f0e0d]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-0.5">
              {step==="docs"?"Step 1 · Your Details & Documents":step==="calendar"?"Step 2 · Select Dates":step==="review"?"Step 3 · Review & Submit":"Booking Submitted"}
            </p>
            <h2 className="font-display text-lg text-white">{car.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-2xl leading-none">×</button>
        </div>

        {/* ── STEP: Documents ── */}
        {step==="docs"&&(
          <div className="p-8">
            <div className="bg-[#c8a84b]/10 border border-[#c8a84b]/30 rounded-xl p-4 mb-6">
              <p className="text-[#c8a84b] text-sm font-medium mb-1">Documents Required</p>
              <p className="text-white/50 text-xs leading-relaxed">Kenyan law requires ID and driver's licence verification before any vehicle hire. Our admin reviews these documents and contacts you privately with payment instructions once approved.</p>
            </div>

            <div className="space-y-5 mb-6">
              <DF label="Full Name" value={docName} onChange={setDocName} placeholder="As on your ID" error={docErrors.name} required />
              <DF label="Phone / WhatsApp" value={docPhone} onChange={setDocPhone} placeholder="+254 7XX XXX XXX" error={docErrors.phone} required />
              <DF label="Email Address" value={docEmail} onChange={setDocEmail} placeholder="you@example.com" error={docErrors.email} required />
              <DF label="National ID Number" value={docIdNumber} onChange={setDocIdNumber} placeholder="e.g. 12345678" error={docErrors.idNumber} required />
              <DF label="Driver's License Number" value={docLicNumber} onChange={setDocLicNumber} placeholder="e.g. DL-KE-9876" error={docErrors.licNumber} required />
            </div>

            {/* ID Upload */}
            <div className="mb-5">
              <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-3">National ID — Photo <span className="text-red-400">*</span></label>
              <input ref={idRef} type="file" accept="image/*,.pdf" onChange={e=>handleFileChange(e,"id")} className="hidden"/>
              <button type="button" onClick={()=>idRef.current?.click()}
                className={`w-full border-2 border-dashed py-5 text-center rounded-xl transition-all ${idPreview?"border-[#c8a84b]/50 bg-[#c8a84b]/5":docErrors.idFile?"border-red-500/40":"border-white/10 hover:border-white/25"}`}>
                {idPreview
                  ? <div className="flex items-center justify-center gap-4 px-4"><img src={idPreview} alt="" className="h-12 w-20 object-cover rounded"/><span className="text-sm text-white/70">✓ National ID uploaded</span></div>
                  : <div><div className="text-2xl mb-1">🪪</div><p className="text-white/40 text-sm">Upload National ID (front)</p><p className="text-white/20 text-xs mt-0.5">Image or PDF</p></div>
                }
              </button>
              {docErrors.idFile&&<p className="text-red-400 text-[10px] mt-1">{docErrors.idFile}</p>}
            </div>

            {/* License Upload */}
            <div className="mb-8">
              <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-3">Driver's License — Photo <span className="text-red-400">*</span></label>
              <input ref={licRef} type="file" accept="image/*,.pdf" onChange={e=>handleFileChange(e,"lic")} className="hidden"/>
              <button type="button" onClick={()=>licRef.current?.click()}
                className={`w-full border-2 border-dashed py-5 text-center rounded-xl transition-all ${licPreview?"border-[#c8a84b]/50 bg-[#c8a84b]/5":docErrors.licFile?"border-red-500/40":"border-white/10 hover:border-white/25"}`}>
                {licPreview
                  ? <div className="flex items-center justify-center gap-4 px-4"><img src={licPreview} alt="" className="h-12 w-20 object-cover rounded"/><span className="text-sm text-white/70">✓ Driver's license uploaded</span></div>
                  : <div><div className="text-2xl mb-1">🪪</div><p className="text-white/40 text-sm">Upload Driver's License</p><p className="text-white/20 text-xs mt-0.5">Image or PDF</p></div>
                }
              </button>
              {docErrors.licFile&&<p className="text-red-400 text-[10px] mt-1">{docErrors.licFile}</p>}
            </div>

            <button onClick={handleSaveDocs} disabled={savingDocs} className="w-full py-4 text-black text-[11px] uppercase tracking-[0.25em] font-semibold disabled:opacity-40 transition-colors" style={{background:"#c8a84b"}}>
              {savingDocs?"Saving…":"Save & Continue to Dates →"}
            </button>
          </div>
        )}

        {/* ── STEP: Calendar ── */}
        {step==="calendar"&&(
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div><span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Per Day</span><p className="font-display text-2xl" style={{color:"#c8a84b"}}>KES {car.pricePerDay.toLocaleString()}</p></div>
              {numDays>0&&<div className="text-right"><span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{numDays} day{numDays>1?"s":""}</span><p className="font-display text-2xl text-white">KES {totalPrice.toLocaleString()}</p></div>}
            </div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={()=>setViewDate(v=>v.month===0?{year:v.year-1,month:11}:{...v,month:v.month-1})} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">‹</button>
              <span className="text-sm font-medium text-white">{MONTHS[viewDate.month]} {viewDate.year}</span>
              <button onClick={()=>setViewDate(v=>v.month===11?{year:v.year+1,month:0}:{...v,month:v.month+1})} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">{DAYS.map(d=><div key={d} className="text-center text-[10px] uppercase tracking-wider text-white/30 py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d,i)=>{
                if(!d) return <div key={`e${i}`}/>;
                const past=isBefore(d,today),booked=isBooked(d);
                const start=startDate&&sameDay(d,startDate),end=endDate&&sameDay(d,endDate);
                const inRange=isInRange(d),isT=sameDay(d,today),dis=past||booked;
                return(
                  <div key={toKey(d)} title={booked?"Already booked":""} onClick={()=>!dis&&handleDayClick(d)} onMouseEnter={()=>!dis&&startDate&&!endDate&&setHoveredDate(d)} onMouseLeave={()=>setHoveredDate(null)}
                    className={`relative flex items-center justify-center h-9 text-sm select-none transition-all duration-150 ${dis?"cursor-not-allowed":"cursor-pointer"} ${booked?"bg-red-900/20 text-red-400/50":""} ${past&&!booked?"text-white/15":""} ${inRange&&!booked?"bg-[#c8a84b]/15 text-white/80":""} ${start||end?"bg-[#c8a84b] text-black font-semibold rounded-lg":""} ${!start&&!end&&!inRange&&!dis?"text-white/70 hover:bg-white/5 rounded-lg":""} ${isT&&!start&&!end?"text-[#c8a84b]":""}`}>
                    {d.getDate()}
                    {booked&&<span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400/60 rounded-full"/>}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 text-[10px] text-white/30">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#c8a84b]"/>Selected</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400/50"/>Booked</div>
            </div>
            <div className="mt-6">
              <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">Delivery / Pickup Location</label>
              <select value={pickupLocation} onChange={e=>setPickupLocation(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-sm py-3 px-4 outline-none rounded-lg">
                {["Nairobi CBD","Westlands","Karen","Kilimani","Gigiri","JKIA Airport","Mombasa","Kisumu","Nakuru"].map(l=><option key={l} value={l} className="bg-[#0f0e0d]">{l}</option>)}
              </select>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-white/50">
                {!startDate&&"Select check-in date"}
                {startDate&&!endDate&&<span>From <span className="text-white">{fmtDate(startDate)}</span> — pick return</span>}
                {startDate&&endDate&&<span className="text-white">{fmtDate(startDate)} → {fmtDate(endDate)}</span>}
              </div>
              <button disabled={!startDate||!endDate} onClick={()=>setStep("review")} className="px-6 py-2.5 text-black text-[10px] uppercase tracking-[0.25em] font-semibold disabled:opacity-30 transition-colors rounded" style={{background:"#c8a84b"}}>Review →</button>
            </div>
          </div>
        )}

        {/* ── STEP: Review & Submit ── */}
        {step==="review"&&(
          <div className="p-8">
            <h3 className="font-display text-xl text-white mb-6">Review Your Booking</h3>
            <div className="space-y-4 mb-6">
              {[["Vehicle",car.name],["Check-in",startDate?fmtDate(startDate):""],["Return",endDate?fmtDate(endDate):""],["Duration",`${numDays} day${numDays>1?"s":""}`],["Delivery",pickupLocation]].map(([l,v])=>(
                <div key={l} className="flex justify-between"><span className="text-white/50 text-sm">{l}</span><span className="text-white text-sm font-medium">{v}</span></div>
              ))}
              <div className="h-px bg-white/10 my-2"/>
              <div className="flex justify-between"><span className="text-white/50 text-sm">Estimated Total</span><span className="font-display text-2xl" style={{color:"#c8a84b"}}>KES {totalPrice.toLocaleString()}</span></div>
            </div>
            <div className="bg-white/5 rounded-xl p-5 mb-6 text-sm space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">What happens next</p>
              <ol className="text-white/60 text-xs leading-relaxed space-y-2 list-decimal list-inside">
                <li>Your documents go to our admin for verification.</li>
                <li>Once approved, the admin contacts you on the booking chat with payment methods (M-Pesa, Bank, Card).</li>
                <li>You complete payment, share confirmation in the chat, and we deliver the vehicle.</li>
              </ol>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={()=>setStep("calendar")} className="text-white/40 hover:text-white text-[10px] uppercase tracking-[0.25em] transition-colors">← Edit dates</button>
              <button onClick={handleSubmitBooking} disabled={submitting} className="flex-1 py-4 text-black text-[11px] uppercase tracking-[0.25em] font-semibold disabled:opacity-50" style={{background:"#c8a84b"}}>
                {submitting?"Submitting…":"Submit Booking Request →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step==="success"&&(
          <div className="p-8 text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:"rgba(200,168,75,0.2)"}}><span className="text-3xl" style={{color:"#c8a84b"}}>✓</span></div>
            <h3 className="font-display text-2xl text-white mb-3">Request Submitted!</h3>
            <p className="text-white/40 text-sm mb-1">Ref: <span className="text-white font-mono">{bookingRef.slice(0,8).toUpperCase()}</span></p>
            <p className="text-white/40 text-sm mb-2">{car.name} · {startDate&&fmtDate(startDate)} → {endDate&&fmtDate(endDate)}</p>
            <p className="font-display text-xl mb-6" style={{color:"#c8a84b"}}>Estimated KES {totalPrice.toLocaleString()}</p>
            <div className="bg-white/5 rounded-xl p-5 mb-6 text-left text-sm">
              <p className="text-[#c8a84b] text-xs uppercase tracking-widest mb-2">Awaiting verification</p>
              <p className="text-white/60 text-xs leading-relaxed">Our admin is reviewing your documents. Once approved, they'll contact you privately on the booking chat with payment methods. You'll get a notification.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={()=>{onClose();navigate("/account/bookings");}} className="py-3 text-black text-[10px] uppercase tracking-[0.25em] font-semibold" style={{background:"#c8a84b"}}>View My Bookings</button>
              <button onClick={onClose} className="py-3 text-white/40 text-[10px] uppercase tracking-[0.25em] hover:text-white transition-colors">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DF=({label,value,onChange,placeholder,error,required}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;error?:string;required?:boolean})=>(
  <div><label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>
  <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent border-b outline-none py-3 text-white text-sm placeholder:text-white/20 transition-colors" style={{borderBottomColor:error?"rgba(239,68,68,0.6)":"rgba(255,255,255,0.15)"}}/>
  {error&&<p className="text-red-400 text-[10px] mt-1">{error}</p>}</div>
);

export default BookingFlow;