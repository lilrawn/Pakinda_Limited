import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, FleetCar, Booking, ServiceRecord, MarketListing } from "@/context/AppContext";
import BookingChat from "@/components/BookingChat";

type AdminTab = "overview" | "fleet" | "bookings" | "history" | "service" | "market" | "notifications";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtKES = (n: number) => `KES ${(n||0).toLocaleString()}`;
const fmtDT = (iso: string) => { if(!iso) return "—"; const d=new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${d.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})}`; };
const fmtDate = (iso: string) => { if(!iso) return "—"; const d=new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

// ─── Root Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { currentUser, logout, getRevenue, fleetCars, bookings, unreadCount } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [revPeriod, setRevPeriod] = useState<"week"|"month"|"year">("month");

  if (!currentUser || currentUser.role !== "admin") { navigate("/auth"); return null; }

  const NAV: { id: AdminTab; label: string; icon: string }[] = [
    { id:"overview",   label:"Overview",         icon:"◈" },
    { id:"fleet",      label:"Fleet Management", icon:"⊡" },
    { id:"bookings",   label:"Live Bookings",    icon:"◷" },
    { id:"history",    label:"Vehicle History",  icon:"◑" },
    { id:"service",    label:"Service Tracker",  icon:"⚙" },
    { id:"market",     label:"Car Market",       icon:"🏷" },
    { id:"notifications", label:"Notifications", icon:"🔔" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0908] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0e0d] border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/5">
          <a href="/" className="font-display text-xl tracking-[0.25em] uppercase block mb-1" style={{color:"#c8a84b"}}>Pakinda Limited</a>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 ${tab===t.id?"text-black font-medium":"text-white/50 hover:text-white hover:bg-white/5"}`}
              style={tab===t.id?{background:"#c8a84b"}:{}}>
              <span>{t.icon}</span>
              {t.label}
              {t.id==="notifications" && unreadCount > 0 && <span className="ml-auto text-[9px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <a href="/" target="_blank" className="w-full block text-center py-2 text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">View Site ↗</a>
          <a href="/market" target="_blank" className="w-full block text-center py-2 text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">Car Market ↗</a>
          <button onClick={()=>{logout();navigate("/");}} className="w-full py-2 text-[10px] uppercase tracking-[0.2em] text-red-400/60 hover:text-red-400 transition-colors">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {tab==="overview"    && <OverviewTab revPeriod={revPeriod} setRevPeriod={setRevPeriod} />}
          {tab==="fleet"       && <FleetTab />}
          {tab==="bookings"    && <BookingsTab />}
          {tab==="history"     && <HistoryTab />}
          {tab==="service"     && <ServiceTab />}
          {tab==="market"      && <MarketTab />}
          {tab==="notifications" && <NotificationsTab />}
        </div>
      </main>
    </div>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
const OverviewTab = ({revPeriod,setRevPeriod}:{revPeriod:"week"|"month"|"year";setRevPeriod:(p:"week"|"month"|"year")=>void}) => {
  const { fleetCars, bookings, getRevenue, getCarRevenue } = useApp();
  const total = getRevenue(revPeriod);
  const active = bookings.filter(b=>b.status==="active").length;
  const completed = bookings.filter(b=>b.status==="completed").length;
  const pending = bookings.filter(b=>b.status==="pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Dashboard Overview</h1>
          <p className="text-white/30 text-sm">Pakinda Limited · Nairobi Operations</p>
        </div>
        <div className="flex border border-white/10 rounded-lg overflow-hidden">
          {(["week","month","year"] as const).map(p=>(
            <button key={p} onClick={()=>setRevPeriod(p)} className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all ${revPeriod===p?"text-black":"text-white/40 hover:text-white"}`} style={revPeriod===p?{background:"#c8a84b"}:{}}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard label={`Revenue · ${revPeriod}`} value={fmtKES(total)} accent />
        <KpiCard label="Active" value={String(active)} />
        <KpiCard label="Pending" value={String(pending)} />
        <KpiCard label="Completed" value={String(completed)} />
      </div>

      {/* Per-car revenue */}
      <div className="bg-[#0f0e0d] border border-white/5 rounded-xl overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display text-lg">Revenue per Vehicle</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">This {revPeriod}</span>
        </div>
        <div className="divide-y divide-white/5">
          {fleetCars.map(car => {
            const rev = getCarRevenue(car.id, revPeriod);
            const trips = bookings.filter(b=>b.carId===car.id&&b.status!=="cancelled").length;
            return (
              <div key={car.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  {car.imageUrl||car.image
                    ? <img src={(car.imageUrl||car.image) as string} alt="" className="w-14 h-9 object-contain opacity-70 flex-shrink-0"/>
                    : <div className="w-14 h-9 bg-white/5 rounded flex-shrink-0 flex items-center justify-center text-white/20 text-xs">No img</div>
                  }
                  <div>
                    <p className="text-white text-sm font-medium">{car.name}</p>
                    <p className="text-white/30 text-xs">{car.category} · {trips} booking{trips!==1?"s":""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${car.available?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{car.available?"Available":"Unavailable"}</span>
                  <div className="text-right">
                    <p className="font-display text-lg" style={{color:rev>0?"#c8a84b":"rgba(255,255,255,0.2)"}}>{fmtKES(rev)}</p>
                    <p className="text-white/30 text-xs">{fmtKES(car.pricePerDay)}/day</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-[#0f0e0d] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5"><h2 className="font-display text-lg">Recent Bookings</h2></div>
        <div className="divide-y divide-white/5">
          {bookings.slice(0,5).map(b=>(
            <div key={b.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-white text-sm">{b.userName} — {b.carName}</p>
                <p className="text-white/30 text-xs">{fmtDate(b.startDate)} → {fmtDate(b.endDate)} · {b.pickupLocation}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status}/>
                <span className="font-display text-sm" style={{color:"#c8a84b"}}>{fmtKES(b.totalPrice)}</span>
              </div>
            </div>
          ))}
          {bookings.length===0 && <p className="text-center text-white/20 py-8 text-sm">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Fleet Management ─────────────────────────────────────────────────────────
const FleetTab = () => {
  const { fleetCars, addCar, updateCar, removeCar } = useApp();
  const [editingId, setEditingId] = useState<string|null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string|null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Fleet Management</h1>
        <button onClick={()=>setShowAdd(true)} className="px-5 py-2.5 text-black text-[10px] uppercase tracking-[0.2em] font-semibold rounded" style={{background:"#c8a84b"}}>+ Add Vehicle</button>
      </div>

      {showAdd && <AddCarForm onClose={()=>setShowAdd(false)} onAdd={addCar}/>}

      <div className="space-y-4">
        {fleetCars.map(car =>
          editingId===car.id
            ? <EditCarForm key={car.id} car={car} onSave={d=>{ updateCar(car.id,d.car,d.imageFile); setEditingId(null); }} onCancel={()=>setEditingId(null)}/>
            : (
              <div key={car.id} className="bg-[#0f0e0d] border border-white/5 rounded-xl p-5 flex items-center gap-5">
                {/* Car photo */}
                <div className="w-24 h-16 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                  {car.imageUrl||car.image
                    ? <img src={(car.imageUrl||car.image) as string} alt={car.name} className="w-full h-full object-contain"/>
                    : <span className="text-white/20 text-xs">No photo</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-medium">{car.name}</p>
                    <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${car.available?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{car.available?"Available":"Unavailable"}</span>
                  </div>
                  <p className="text-white/40 text-xs">{car.category} · {car.series}</p>
                  <p className="text-white/50 text-xs mt-1 truncate">{car.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-lg" style={{color:"#c8a84b"}}>{fmtKES(car.pricePerDay)}<span className="text-white/30 text-xs">/day</span></p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Btn onClick={()=>setEditingId(car.id)}>Edit</Btn>
                  <Btn onClick={()=>updateCar(car.id,{available:!car.available})} color={car.available?"red":"green"}>{car.available?"Disable":"Enable"}</Btn>
                  <Btn onClick={()=>setConfirmRemove(car.id)} color="red">Remove</Btn>
                </div>
              </div>
            )
        )}
      </div>

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f0e0d] border border-white/10 rounded-xl p-8 max-w-sm w-full mx-4">
            <h3 className="font-display text-xl text-white mb-3">Remove Vehicle?</h3>
            <p className="text-white/50 text-sm mb-6">This permanently removes the vehicle from the fleet. Booking history is preserved.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmRemove(null)} className="flex-1 py-3 border border-white/10 text-white/50 text-[10px] uppercase tracking-[0.2em] hover:text-white">Cancel</button>
              <button onClick={()=>{removeCar(confirmRemove!);setConfirmRemove(null);}} className="flex-1 py-3 bg-red-600 text-white text-[10px] uppercase tracking-[0.2em]">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Add Car Form ─────────────────────────────────────────────────────────────
const AddCarForm = ({onClose,onAdd}:{onClose:()=>void;onAdd:(c:Omit<FleetCar,"id"|"slug">,img?:File)=>Promise<void>}) => {
  const [name,setName]=useState(""); const [series,setSeries]=useState(""); const [category,setCategory]=useState<FleetCar["category"]>("Luxury");
  const [price,setPrice]=useState(""); const [desc,setDesc]=useState("");
  const [hp,setHp]=useState(""); const [top,setTop]=useState(""); const [zero,setZero]=useState("");
  const [features,setFeatures]=useState("");
  const [imgFile,setImgFile]=useState<File|null>(null); const [imgPreview,setImgPreview]=useState("");
  const [saving,setSaving]=useState(false);
  const imgRef=useRef<HTMLInputElement>(null);

  const handleImg=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return;
    setImgFile(f); const r=new FileReader(); r.onload=ev=>setImgPreview(ev.target?.result as string); r.readAsDataURL(f);
  };

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); setSaving(true);
    await onAdd({name,series,category,pricePerDay:parseInt(price.replace(/,/g,""))||0,price:`KES ${parseInt(price.replace(/,/g,"")).toLocaleString()}`,description:desc,spec:{hp,top,zero},features:features.split("\n").map(f=>f.trim()).filter(Boolean),image:imgPreview||"",imageUrl:imgPreview||"",available:true},imgFile||undefined);
    setSaving(false); onClose();
  };

  return (
    <div className="bg-[#0f0e0d] border border-[#c8a84b]/30 rounded-xl p-6 mb-6">
      <h3 className="font-display text-xl mb-6">Add New Vehicle</h3>
      <form onSubmit={handleSubmit}>
        {/* Photo upload */}
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-3">Vehicle Photo <span className="text-red-400">*</span></label>
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden"/>
          <button type="button" onClick={()=>imgRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${imgPreview?"border-[#c8a84b]/40":"border-white/10 hover:border-white/25"}`}>
            {imgPreview
              ? <div className="flex items-center justify-center gap-4"><img src={imgPreview} alt="" className="h-20 w-32 object-contain rounded"/><span className="text-sm text-white/70">✓ Photo selected — click to change</span></div>
              : <div><div className="text-3xl mb-1">📷</div><p className="text-white/40 text-sm">Click to upload vehicle photo</p><p className="text-white/20 text-xs">This photo is shown to clients</p></div>
            }
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <AF label="Vehicle Name *" value={name} onChange={setName} placeholder="e.g. Mercedes-Benz S 580"/>
          <AF label="Series" value={series} onChange={setSeries} placeholder="e.g. S-Class · W223"/>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value as FleetCar["category"])} className="w-full bg-white/5 border-b border-white/15 text-white text-sm py-3 px-2 outline-none">
              {["Luxury","SUV","Sports","Executive"].map(c=><option key={c} className="bg-[#0f0e0d]">{c}</option>)}
            </select>
          </div>
          <AF label="Price Per Day (KES) *" value={price} onChange={setPrice} placeholder="e.g. 45000"/>
          <AF label="Power" value={hp} onChange={setHp} placeholder="e.g. 496 hp"/>
          <AF label="Top Speed" value={top} onChange={setTop} placeholder="e.g. 250 km/h"/>
          <AF label="0–100 km/h" value={zero} onChange={setZero} placeholder="e.g. 4.4 s"/>
          <div className="col-span-2"><AF label="Description" value={desc} onChange={setDesc} placeholder="Vehicle description for the fleet page…"/></div>
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Features (one per line)</label>
            <textarea value={features} onChange={e=>setFeatures(e.target.value)} rows={3} placeholder={"Chauffeur available\nFull insurance included\nNairobi CBD delivery"} className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-3 text-white text-sm placeholder:text-white/20 resize-none transition-colors"/>
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 text-white/50 text-[10px] uppercase tracking-[0.2em]">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 text-black text-[10px] uppercase tracking-[0.2em] font-semibold disabled:opacity-50" style={{background:"#c8a84b"}}>{saving?"Uploading…":"Add Vehicle"}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ─── Edit Car Form ────────────────────────────────────────────────────────────
const EditCarForm = ({car,onSave,onCancel}:{car:FleetCar;onSave:(d:{car:Partial<FleetCar>;imageFile?:File})=>void;onCancel:()=>void}) => {
  const [name,setName]=useState(car.name); const [series,setSeries]=useState(car.series); const [desc,setDesc]=useState(car.description);
  const [price,setPrice]=useState(String(car.pricePerDay)); const [hp,setHp]=useState(car.spec.hp); const [top,setTop]=useState(car.spec.top); const [zero,setZero]=useState(car.spec.zero);
  const [features,setFeatures]=useState(car.features.join("\n"));
  const [imgFile,setImgFile]=useState<File|null>(null); const [imgPreview,setImgPreview]=useState((car.imageUrl||car.image) as string||"");
  const imgRef=useRef<HTMLInputElement>(null);

  const handleImg=(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f) return; setImgFile(f); const r=new FileReader(); r.onload=ev=>setImgPreview(ev.target?.result as string); r.readAsDataURL(f); };

  return (
    <div className="bg-[#0f0e0d] border border-[#c8a84b]/30 rounded-xl p-6">
      <h3 className="font-display text-lg mb-5">Editing · {car.name}</h3>

      {/* Photo */}
      <div className="mb-5">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-3">Vehicle Photo</label>
        <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden"/>
        <button type="button" onClick={()=>imgRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl py-4 text-center transition-all ${imgPreview?"border-[#c8a84b]/40":"border-white/10 hover:border-white/25"}`}>
          {imgPreview
            ? <div className="flex items-center justify-center gap-4 px-4"><img src={imgPreview} alt="" className="h-12 w-20 object-contain rounded"/><span className="text-xs text-white/50">Click to change photo</span></div>
            : <span className="text-white/30 text-sm">Click to upload photo</span>
          }
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <AF label="Name" value={name} onChange={setName}/> <AF label="Series" value={series} onChange={setSeries}/>
        <AF label="Price/Day (KES)" value={price} onChange={setPrice}/> <AF label="Power" value={hp} onChange={setHp}/>
        <AF label="Top Speed" value={top} onChange={setTop}/> <AF label="0–100" value={zero} onChange={setZero}/>
        <div className="col-span-2"><AF label="Description" value={desc} onChange={setDesc}/></div>
        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Features (one per line)</label>
          <textarea value={features} onChange={e=>setFeatures(e.target.value)} rows={3} className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-3 text-white text-sm resize-none transition-colors"/>
        </div>
        <div className="col-span-2 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-white/10 text-white/50 text-[10px] uppercase tracking-[0.2em]">Cancel</button>
          <button onClick={()=>onSave({car:{name,series,description:desc,pricePerDay:parseInt(price)||car.pricePerDay,price:`KES ${parseInt(price).toLocaleString()}`,spec:{hp,top,zero},features:features.split("\n").map(f=>f.trim()).filter(Boolean),imageUrl:imgPreview,image:imgPreview},imageFile:imgFile||undefined})} className="flex-1 py-3 text-black text-[10px] uppercase tracking-[0.2em] font-semibold" style={{background:"#c8a84b"}}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ─── Live Bookings ────────────────────────────────────────────────────────────
const BookingsTab = () => {
  const { bookings, updateBooking } = useApp();
  const active = bookings.filter(b=>b.status==="active"||b.status==="pending");
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Live Bookings</h1>
      {active.length===0
        ? <div className="text-center py-20 text-white/20 font-display text-xl">No active bookings.</div>
        : <div className="space-y-4">{active.map(b=><BookingCard key={b.id} booking={b} onUpdate={updateBooking}/>)}</div>
      }
    </div>
  );
};

const BookingCard = ({booking:b,onUpdate}:{booking:Booking;onUpdate:(id:string,d:Partial<Booking>)=>Promise<void>}) => {
  const [expanded,setExpanded]=useState(false);
  return (
    <div className="bg-[#0f0e0d] border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02]" onClick={()=>setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${b.status==="active"?"bg-green-400":"bg-amber-400"}`}/>
          <div><p className="text-white font-medium">{b.carName}</p><p className="text-white/40 text-xs">{b.userName} · {fmtDate(b.startDate)} → {fmtDate(b.endDate)}</p></div>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={b.status}/>
          <span className="font-display text-lg" style={{color:"#c8a84b"}}>{fmtKES(b.totalPrice)}</span>
          <span className="text-white/30 text-sm">{expanded?"▲":"▼"}</span>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <IR label="Client" value={b.userName}/> <IR label="Email" value={b.userEmail}/>
            <IR label="Phone" value={b.userPhone}/> <IR label="National ID" value={b.userIdNumber}/>
            <IR label="License No." value={b.userLicenseNumber}/> <IR label="Payment" value={(b.paymentMethod||"—").replace("_"," ").toUpperCase()}/>
            <IR label="Ref" value={b.paymentRef||"—"}/> <IR label="Pickup" value={b.pickupLocation}/>
            <IR label="Booked" value={fmtDT(b.createdAt)}/>
          </div>
          {/* Doc previews */}
          {(b.userIdImageUrl||b.userLicenseImageUrl) && (
            <div className="flex gap-4 mt-2">
              {b.userIdImageUrl&&<div><p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">National ID</p><img src={b.userIdImageUrl} alt="ID" className="h-16 w-auto rounded border border-white/10 object-cover"/></div>}
              {b.userLicenseImageUrl&&<div><p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Driver's License</p><img src={b.userLicenseImageUrl} alt="Lic" className="h-16 w-auto rounded border border-white/10 object-cover"/></div>}
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <button onClick={()=>onUpdate(b.id,{status:"completed",returnedAt:new Date().toISOString()})} className="px-4 py-2 text-black text-[10px] uppercase tracking-[0.2em] font-semibold rounded" style={{background:"#c8a84b"}}>Mark Returned</button>
            <button onClick={()=>onUpdate(b.id,{status:"cancelled"})} className="px-4 py-2 border border-red-500/30 text-red-400/60 text-[10px] uppercase tracking-[0.2em] hover:text-red-400 transition-colors rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── History Tab ──────────────────────────────────────────────────────────────
const HistoryTab = () => {
  const { bookings, fleetCars, updateBooking } = useApp();
  const [carFilter, setCarFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [editingReturn, setEditingReturn] = useState<string|null>(null);

  const filtered = bookings
    .filter(b => carFilter==="all"||b.carId===carFilter)
    .filter(b => statusFilter==="all"||b.status===statusFilter)
    .sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl">Vehicle History</h1>
        <div className="flex gap-3">
          <select value={carFilter} onChange={e=>setCarFilter(e.target.value)} className="bg-[#0f0e0d] border border-white/10 text-white text-sm py-2 px-4 rounded-lg outline-none">
            <option value="all" className="bg-[#0f0e0d]">All Vehicles</option>
            {fleetCars.map(c=><option key={c.id} value={c.id} className="bg-[#0f0e0d]">{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-[#0f0e0d] border border-white/10 text-white text-sm py-2 px-4 rounded-lg outline-none">
            {["all","pending","active","completed","cancelled"].map(s=><option key={s} value={s} className="bg-[#0f0e0d]">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {filtered.length===0
        ? <div className="text-center py-20 text-white/20 font-display text-xl">No history found.</div>
        : (
          <div className="space-y-3">
            {filtered.map(b=>(
              <div key={b.id} className="bg-[#0f0e0d] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02]" onClick={()=>setExpandedId(expandedId===b.id?null:b.id)}>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={b.status}/>
                    <div><p className="text-white font-medium">{b.carName}</p><p className="text-white/40 text-xs">{b.userName} · {fmtDate(b.startDate)} → {fmtDate(b.endDate)}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display" style={{color:"#c8a84b"}}>{fmtKES(b.totalPrice)}</span>
                    <span className="text-white/30 text-xs hidden md:block">{fmtDT(b.createdAt)}</span>
                  </div>
                </div>

                {expandedId===b.id && (
                  <div className="border-t border-white/5 p-5 space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <IR label="Full Name" value={b.userName}/> <IR label="Email" value={b.userEmail}/>
                      <IR label="Phone" value={b.userPhone}/> <IR label="National ID" value={b.userIdNumber}/>
                      <IR label="License No." value={b.userLicenseNumber}/> <IR label="Pickup Location" value={b.pickupLocation}/>
                      <IR label="Payment Method" value={(b.paymentMethod||"—").replace("_"," ").toUpperCase()}/> <IR label="Payment Ref" value={b.paymentRef||"—"}/>
                      <IR label="Booking Date" value={fmtDT(b.createdAt)}/>
                    </div>

                    {/* Doc images */}
                    {(b.userIdImageUrl||b.userLicenseImageUrl) && (
                      <div className="flex gap-6">
                        {b.userIdImageUrl&&<div><p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">National ID</p><img src={b.userIdImageUrl} alt="ID" className="h-20 w-auto rounded-lg border border-white/10 object-cover"/></div>}
                        {b.userLicenseImageUrl&&<div><p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Driver's License</p><img src={b.userLicenseImageUrl} alt="Lic" className="h-20 w-auto rounded-lg border border-white/10 object-cover"/></div>}
                      </div>
                    )}

                    {/* Return info */}
                    {b.returnedAt ? (
                      <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-5">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-green-400/60 mb-3">Vehicle Returned</p>
                        <div className="grid grid-cols-2 gap-4">
                          <IR label="Returned At" value={fmtDT(b.returnedAt)}/>
                          {b.returnCondition&&<IR label="Condition" value={b.returnCondition}/>}
                          {b.returnNotes&&<div className="col-span-2"><IR label="Notes" value={b.returnNotes}/></div>}
                        </div>
                      </div>
                    ) : (b.status==="completed"||b.status==="active") ? (
                      editingReturn===b.id
                        ? <ReturnForm bookingId={b.id} onSave={updateBooking} onCancel={()=>setEditingReturn(null)}/>
                        : <button onClick={()=>setEditingReturn(b.id)} className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all rounded">+ Log Vehicle Return</button>
                    ) : null}

                    <AdminNotesField bookingId={b.id} current={b.adminNotes} onSave={updateBooking}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

const ReturnForm = ({bookingId,onSave,onCancel}:{bookingId:string;onSave:(id:string,d:Partial<Booking>)=>Promise<void>;onCancel:()=>void}) => {
  const [condition,setCondition]=useState("Good — no damage noted");
  const [notes,setNotes]=useState("");
  const [returnedAt,setReturnedAt]=useState(()=>new Date().toISOString().slice(0,16));
  const [saving,setSaving]=useState(false);
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Log Vehicle Return</p>
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Return Date & Time</label>
        <input type="datetime-local" value={returnedAt} onChange={e=>setReturnedAt(e.target.value)} className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-2 text-white text-sm transition-colors"/>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Vehicle Condition</label>
        <select value={condition} onChange={e=>setCondition(e.target.value)} className="w-full bg-white/5 border-b border-white/15 text-white text-sm py-2 px-2 outline-none">
          {["Good — no damage noted","Minor scuffs — documented","Body damage — assessment required","Interior damage","Mechanical issue reported","Missing items","Fuel below agreed level"].map(c=><option key={c} value={c} className="bg-[#0f0e0d]">{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Notes</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Damage details, missing items, fuel level, client remarks…" className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-2 text-white text-sm placeholder:text-white/20 resize-none transition-colors"/>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.2em]">Cancel</button>
        <button disabled={saving} onClick={async()=>{setSaving(true);await onSave(bookingId,{status:"completed",returnedAt:new Date(returnedAt).toISOString(),returnCondition:condition,returnNotes:notes});setSaving(false);onCancel();}} className="flex-1 py-2.5 text-black text-[10px] uppercase tracking-[0.2em] font-semibold disabled:opacity-50" style={{background:"#c8a84b"}}>{saving?"Saving…":"Save Return Log"}</button>
      </div>
    </div>
  );
};

const AdminNotesField = ({bookingId,current,onSave}:{bookingId:string;current?:string;onSave:(id:string,d:Partial<Booking>)=>Promise<void>}) => {
  const [notes,setNotes]=useState(current||""); const [saved,setSaved]=useState(false);
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Admin Notes (private)</label>
      <textarea value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}} rows={2} placeholder="Internal notes…" className="w-full bg-transparent border-b border-white/10 focus:border-white/30 outline-none py-2 text-white/60 text-sm placeholder:text-white/15 resize-none transition-colors"/>
      <button onClick={async()=>{await onSave(bookingId,{adminNotes:notes});setSaved(true);}} className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">{saved?"✓ Saved":"Save Notes"}</button>
    </div>
  );
};

// ─── Service Tracker ──────────────────────────────────────────────────────────
const ServiceTab = () => {
  const { fleetCars, updateServiceRecord } = useApp();
  const [editingId, setEditingId] = useState<string|null>(null);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Service Tracker</h1>
      <p className="text-white/30 text-sm mb-8">Vehicles whose next service date has passed are automatically marked unavailable on the client side.</p>
      <div className="space-y-4">
        {fleetCars.map(car => {
          const sr=car.serviceRecord;
          const overdue=sr?.nextServiceDate&&sr.nextServiceDate<=today;
          const soon=sr?.nextServiceDate&&sr.nextServiceDate>today&&sr.nextServiceDate<=new Date(Date.now()+7*86400000).toISOString().split("T")[0];
          return (
            <div key={car.id} className="bg-[#0f0e0d] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 bg-white/5 rounded overflow-hidden flex-shrink-0">
                    {(car.imageUrl||car.image)&&<img src={(car.imageUrl||car.image) as string} alt="" className="w-full h-full object-contain opacity-70"/>}
                  </div>
                  <div><p className="text-white font-medium">{car.name}</p><p className="text-white/40 text-xs">{car.category}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  {overdue&&<span className="text-[9px] uppercase tracking-[0.2em] px-2 py-1 bg-red-500/20 text-red-400 rounded-full">Service Overdue</span>}
                  {soon&&!overdue&&<span className="text-[9px] uppercase tracking-[0.2em] px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">Due This Week</span>}
                  <Btn onClick={()=>setEditingId(editingId===car.id?null:car.id)}>{editingId===car.id?"Close":"Update"}</Btn>
                </div>
              </div>
              {sr
                ? <div className="grid grid-cols-3 gap-4 text-sm"><IR label="Last Service" value={fmtDate(sr.lastServiceDate)}/><IR label="Next Service" value={fmtDate(sr.nextServiceDate)}/>{sr.serviceNotes&&<IR label="Notes" value={sr.serviceNotes}/>}</div>
                : <p className="text-white/20 text-sm">No service record yet.</p>
              }
              {editingId===car.id&&<ServiceForm car={car} onSave={r=>{updateServiceRecord(car.id,r);setEditingId(null);}}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ServiceForm = ({car,onSave}:{car:FleetCar;onSave:(r:ServiceRecord)=>void}) => {
  const [last,setLast]=useState(car.serviceRecord?.lastServiceDate||new Date().toISOString().split("T")[0]);
  const [next,setNext]=useState(car.serviceRecord?.nextServiceDate||"");
  const [notes,setNotes]=useState(car.serviceRecord?.serviceNotes||"");
  return (
    <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Last Service Date</label><input type="date" value={last} onChange={e=>setLast(e.target.value)} className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-2 text-white text-sm transition-colors"/></div>
        <div><label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Next Service Date</label><input type="date" value={next} onChange={e=>setNext(e.target.value)} className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-2 text-white text-sm transition-colors"/></div>
      </div>
      <div><label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Service Notes</label><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Oil change, tyre rotation, brake check…" className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-2 text-white text-sm placeholder:text-white/20 transition-colors"/></div>
      <button onClick={()=>onSave({carId:car.id,lastServiceDate:last,nextServiceDate:next,serviceNotes:notes})} className="px-6 py-2.5 text-black text-[10px] uppercase tracking-[0.2em] font-semibold rounded" style={{background:"#c8a84b"}}>Save Service Record</button>
    </div>
  );
};

// ─── Car Market Tab ───────────────────────────────────────────────────────────
const MarketTab = () => {
  const { marketListings, updateMarketListing } = useApp();
  const [filter, setFilter] = useState<"all"|"pending"|"approved"|"rejected"|"sold">("all");
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [adminNote, setAdminNote] = useState("");

  const filtered = filter==="all" ? marketListings : marketListings.filter(l=>l.status===filter);
  const pendingCount = marketListings.filter(l=>l.status==="pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl">Car Market Listings</h1>
          {pendingCount>0&&<p className="text-amber-400 text-sm mt-1">{pendingCount} listing{pendingCount>1?"s":""} awaiting review</p>}
        </div>
        <div className="flex gap-2">
          {(["all","pending","approved","rejected","sold"] as const).map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border rounded transition-all ${filter===s?"text-black border-[#c8a84b]":"text-white/40 border-white/10 hover:text-white"}`} style={filter===s?{background:"#c8a84b"}:{}}>{s}</button>
          ))}
        </div>
      </div>

      {filtered.length===0
        ? <div className="text-center py-20 text-white/20 font-display text-xl">No listings found.</div>
        : (
          <div className="space-y-4">
            {filtered.map(listing=>(
              <div key={listing.id} className="bg-[#0f0e0d] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02]" onClick={()=>{setExpandedId(expandedId===listing.id?null:listing.id);setPhotoIdx(0);setAdminNote(listing.adminNotes||"");}}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                      {listing.imageUrls[0]
                        ? <img src={listing.imageUrls[0]} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No photo</div>
                      }
                    </div>
                    <div>
                      <p className="text-white font-medium">{listing.year} {listing.make} {listing.model}</p>
                      <p className="text-white/40 text-xs">{listing.sellerName} · {listing.sellerPhone} · {listing.mileage} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MarketBadge status={listing.status}/>
                    <span className="font-display text-lg" style={{color:"#c8a84b"}}>{fmtKES(listing.askingPrice)}</span>
                  </div>
                </div>

                {expandedId===listing.id && (
                  <div className="border-t border-white/5 p-5 space-y-5">
                    {/* Photos carousel */}
                    {listing.imageUrls.length>0&&(
                      <div>
                        <div className="aspect-[16/8] bg-black/30 rounded-xl overflow-hidden mb-2">
                          <img src={listing.imageUrls[photoIdx]} alt="" className="w-full h-full object-contain"/>
                        </div>
                        {listing.imageUrls.length>1&&(
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {listing.imageUrls.map((u,i)=>(
                              <button key={i} onClick={()=>setPhotoIdx(i)} className={`w-16 h-10 flex-shrink-0 rounded border-2 overflow-hidden transition-all ${i===photoIdx?"border-[#c8a84b]":"border-transparent opacity-50"}`}>
                                <img src={u} alt="" className="w-full h-full object-cover"/>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <IR label="Seller" value={listing.sellerName}/> <IR label="Email" value={listing.sellerEmail}/>
                      <IR label="Phone" value={listing.sellerPhone}/> <IR label="Make" value={listing.make}/>
                      <IR label="Model" value={listing.model}/> <IR label="Year" value={listing.year}/>
                      <IR label="Mileage" value={`${listing.mileage} km`}/> <IR label="Asking Price" value={fmtKES(listing.askingPrice)}/>
                      <IR label="Submitted" value={fmtDT(listing.createdAt)}/>
                    </div>

                    {listing.description&&(
                      <div><p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Description</p><p className="text-white/60 text-sm leading-relaxed">{listing.description}</p></div>
                    )}

                    {/* Admin note */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-2">Admin Note (sent to seller on rejection)</label>
                      <textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)} rows={2} placeholder="Reason for rejection or additional feedback…" className="w-full bg-transparent border-b border-white/10 focus:border-white/30 outline-none py-2 text-white/60 text-sm placeholder:text-white/15 resize-none transition-colors"/>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      {listing.status!=="approved"&&<button onClick={()=>updateMarketListing(listing.id,{status:"approved",adminNotes:adminNote})} className="px-5 py-2.5 text-black text-[10px] uppercase tracking-[0.2em] font-semibold rounded" style={{background:"#c8a84b"}}>✓ Approve & Publish</button>}
                      {listing.status!=="rejected"&&<button onClick={()=>updateMarketListing(listing.id,{status:"rejected",adminNotes:adminNote})} className="px-5 py-2.5 border border-red-500/30 text-red-400/70 text-[10px] uppercase tracking-[0.2em] hover:text-red-400 rounded transition-colors">✗ Reject</button>}
                      {listing.status==="approved"&&<button onClick={()=>updateMarketListing(listing.id,{status:"sold"})} className="px-5 py-2.5 border border-green-500/30 text-green-400/70 text-[10px] uppercase tracking-[0.2em] hover:text-green-400 rounded transition-colors">Mark as Sold</button>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

// ─── Notifications Tab ────────────────────────────────────────────────────────
const NotificationsTab = () => {
  const { notifications, markNotificationRead } = useApp();
  const unread = notifications.filter(n=>!n.read);
  const read = notifications.filter(n=>n.read);

  const typeIcon = (t: string) => ({booking:"🚗",document:"🪪",approval:"✅",return:"🔄",system:"📣"}[t]||"📣");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Notifications</h1>
        {unread.length>0&&<span className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-red-500/20 text-red-400 rounded-full">{unread.length} unread</span>}
      </div>

      {unread.length>0&&(
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Unread</p>
          <div className="space-y-3">
            {unread.map(n=>(
              <div key={n.id} className="bg-[#c8a84b]/5 border border-[#c8a84b]/20 rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:bg-[#c8a84b]/10 transition-colors" onClick={()=>markNotificationRead(n.id)}>
                <span className="text-xl flex-shrink-0">{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{n.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed mt-0.5">{n.message}</p>
                  <p className="text-white/25 text-[10px] mt-1">{new Date(n.createdAt).toLocaleString("en-KE")}</p>
                </div>
                <button className="text-white/30 hover:text-white text-xs flex-shrink-0">Mark read</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {read.length>0&&(
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Earlier</p>
          <div className="space-y-2">
            {read.slice(0,20).map(n=>(
              <div key={n.id} className="bg-[#0f0e0d] border border-white/5 rounded-xl p-4 flex items-start gap-4">
                <span className="text-lg flex-shrink-0 opacity-50">{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-sm">{n.title}</p>
                  <p className="text-white/30 text-xs leading-relaxed mt-0.5">{n.message}</p>
                  <p className="text-white/15 text-[10px] mt-1">{new Date(n.createdAt).toLocaleString("en-KE")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length===0&&<div className="text-center py-20 text-white/20 font-display text-xl">No notifications yet.</div>}
    </div>
  );
};

// ─── Shared tiny components ───────────────────────────────────────────────────
const KpiCard = ({label,value,accent}:{label:string;value:string;accent?:boolean}) => (
  <div className="bg-[#0f0e0d] border border-white/5 rounded-xl p-6">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">{label}</p>
    <p className="font-display text-3xl" style={accent?{color:"#c8a84b"}:{color:"white"}}>{value}</p>
  </div>
);
const IR = ({label,value}:{label:string;value:string}) => (
  <div><p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">{label}</p><p className="text-white/80 text-sm break-all">{value||"—"}</p></div>
);
const Btn = ({onClick,children,color}:{onClick:()=>void;children:React.ReactNode;color?:"red"|"green"}) => (
  <button onClick={onClick} className={`px-3 py-1.5 border text-[10px] uppercase tracking-[0.2em] transition-all rounded ${color==="red"?"border-red-500/30 text-red-400/60 hover:text-red-400 hover:border-red-500/50":color==="green"?"border-green-500/30 text-green-400/60 hover:text-green-400":"border-white/10 text-white/50 hover:text-white hover:border-white/30"}`}>{children}</button>
);
const StatusBadge = ({status}:{status:Booking["status"]}) => {
  const m={active:"bg-green-500/20 text-green-400",pending:"bg-amber-500/20 text-amber-400",completed:"bg-blue-500/20 text-blue-400",cancelled:"bg-red-500/20 text-red-400"};
  return <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full ${m[status]}`}>{status}</span>;
};
const MarketBadge = ({status}:{status:MarketListing["status"]}) => {
  const m={pending:"bg-amber-500/20 text-amber-400",approved:"bg-green-500/20 text-green-400",rejected:"bg-red-500/20 text-red-400",sold:"bg-blue-500/20 text-blue-400"};
  return <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full ${m[status]}`}>{status}</span>;
};
const AF = ({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}) => (
  <div><label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">{label}</label><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-2 text-white text-sm placeholder:text-white/20 transition-colors"/></div>
);

export default AdminDashboard;
