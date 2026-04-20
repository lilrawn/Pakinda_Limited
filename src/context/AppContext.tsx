import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Car, fleet as initialFleet } from "@/data/fleet";
import { supabase, uploadFile, uploadBase64, sendNotification, createInAppNotification } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string; name: string; email: string; phone: string;
  idNumber: string; licenseNumber: string;
  idImageUrl: string; licenseImageUrl: string;
  role: "client" | "admin"; createdAt: string;
}
export type PaymentMethod = "mpesa" | "bank_transfer" | "card";
export type BookingStatus = "pending" | "active" | "completed" | "cancelled";
export type ListingStatus = "pending" | "approved" | "rejected" | "sold";

export interface Booking {
  id: string; carId: string; carName: string; carSlug: string;
  userId: string; userName: string; userEmail: string; userPhone: string;
  userIdNumber: string; userLicenseNumber: string;
  userIdImageUrl: string; userLicenseImageUrl: string;
  startDate: string; endDate: string; numDays: number;
  pricePerDay: number; totalPrice: number;
  paymentMethod: PaymentMethod; paymentRef: string;
  status: BookingStatus; createdAt: string;
  returnedAt?: string; returnCondition?: string; returnNotes?: string; adminNotes?: string;
  pickupLocation: string;
}
export interface ServiceRecord {
  carId: string; lastServiceDate: string; nextServiceDate: string; serviceNotes: string;
}
export interface FleetCar extends Car {
  available: boolean; serviceRecord?: ServiceRecord; imageUrl?: string;
}
export interface MarketListing {
  id: string; sellerId?: string; sellerName: string; sellerEmail: string; sellerPhone: string;
  make: string; model: string; year: string; mileage: string;
  askingPrice: number; description: string; imageUrls: string[];
  status: ListingStatus; adminNotes?: string; createdAt: string;
}
export interface AppNotification {
  id: string; userId: string; type: string;
  title: string; message: string; read: boolean; createdAt: string;
}
export interface SignupData {
  name: string; email: string; phone: string; password: string;
  idNumber: string; licenseNumber: string;
  idImageFile?: File; licenseImageFile?: File;
  idImageUrl?: string; licenseImageUrl?: string;
}

interface AppContextType {
  currentUser: User | null; users: User[];
  login(e: string, p: string): Promise<{ success: boolean; error?: string }>;
  loginWithGoogle(): Promise<{ success: boolean; error?: string }>;
  signup(d: SignupData): Promise<{ success: boolean; error?: string }>;
  logout(): Promise<void>;
  updateUser(id: string, d: Partial<User>): Promise<void>;
  fleetCars: FleetCar[];
  addCar(car: Omit<FleetCar, "id"|"slug">, img?: File): Promise<void>;
  updateCar(id: string, d: Partial<FleetCar>, img?: File): Promise<void>;
  removeCar(id: string): Promise<void>;
  getBookedDates(carId: string): { start: string; end: string }[];
  bookings: Booking[];
  createBooking(b: Omit<Booking, "id"|"createdAt">): Promise<Booking>;
  updateBooking(id: string, d: Partial<Booking>): Promise<void>;
  getCarBookings(carId: string): Booking[];
  getUserBookings(userId: string): Booking[];
  updateServiceRecord(carId: string, r: ServiceRecord): Promise<void>;
  getRevenue(p: "week"|"month"|"year"): number;
  getCarRevenue(carId: string, p: "week"|"month"|"year"): number;
  marketListings: MarketListing[];
  submitMarketListing(l: Omit<MarketListing,"id"|"createdAt"|"status">, imgs: File[]): Promise<void>;
  updateMarketListing(id: string, d: Partial<MarketListing>): Promise<void>;
  notifications: AppNotification[];
  markNotificationRead(id: string): Promise<void>;
  unreadCount: number;
  supabaseReady: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function save(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function load<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function inPeriod(ds: string, p: "week"|"month"|"year") {
  const d = new Date(ds), n = new Date();
  if (p === "week") { const w = new Date(n); w.setDate(n.getDate()-7); return d >= w; }
  if (p === "month") return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();
  return d.getFullYear()===n.getFullYear();
}

const ADMIN: User = { id:"admin-001", name:"Admin", email:"admin@driveharambee.co.ke", phone:"+254700000000", idNumber:"ADMIN", licenseNumber:"ADMIN", idImageUrl:"", licenseImageUrl:"", role:"admin", createdAt:new Date().toISOString() };

const Ctx = createContext<AppContextType>(null!);
export const useApp = () => useContext(Ctx);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User|null>(()=>load("dh_user",null));
  const [users, setUsers] = useState<User[]>(()=>load("dh_users",[ADMIN]));
  const [fleetCars, setFleet] = useState<FleetCar[]>(()=>load("dh_fleet", initialFleet.map(c=>({...c,available:true}))));
  const [bookings, setBookings] = useState<Booking[]>(()=>load("dh_bookings",[]));
  const [marketListings, setMarket] = useState<MarketListing[]>(()=>load("dh_market",[]));
  const [notifications, setNotifs] = useState<AppNotification[]>(()=>load("dh_notifs",[]));

  useEffect(()=>{ save("dh_user",currentUser); },[currentUser]);
  useEffect(()=>{ save("dh_fleet",fleetCars); },[fleetCars]);
  useEffect(()=>{ save("dh_bookings",bookings); },[bookings]);
  useEffect(()=>{ save("dh_market",marketListings); },[marketListings]);
  useEffect(()=>{ save("dh_notifs",notifications); },[notifications]);

  // Check Supabase
  useEffect(()=>{
    supabase.from("fleet_cars").select("id").limit(1)
      .then(({error})=>{ if(!error) setReady(true); }).catch(()=>{});
  },[]);

  // Load from Supabase
  useEffect(()=>{
    if(!ready) return;
    supabase.from("fleet_cars").select("*").then(({data})=>{ if(data) setFleet(data.map(mapCar)); });
    supabase.from("market_listings").select("*").then(({data})=>{ if(data) setMarket(data.map(mapListing)); });
  },[ready]);

  useEffect(()=>{
    if(!ready||!currentUser) return;
    const q = currentUser.role==="admin"
      ? supabase.from("bookings").select("*").order("created_at",{ascending:false})
      : supabase.from("bookings").select("*").eq("user_id",currentUser.id);
    q.then(({data})=>{ if(data) setBookings(data.map(mapBooking)); });
    supabase.from("notifications").select("*").eq("user_id",currentUser.id).order("created_at",{ascending:false})
      .then(({data})=>{ if(data) setNotifs(data as AppNotification[]); });
  },[ready,currentUser]);

  // Realtime
  useEffect(()=>{
    if(!ready||!currentUser) return;
    const ch = supabase.channel("notifs")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:`user_id=eq.${currentUser.id}`},
        p=>setNotifs(prev=>[p.new as AppNotification,...prev]))
      .subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  },[ready,currentUser]);

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const login = useCallback(async(email:string,password:string)=>{
    if(email.toLowerCase()==="admin@driveharambee.co.ke"&&password==="admin123"){ setCurrentUser(ADMIN); return {success:true}; }
    if(ready){
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error) return {success:false,error:error.message};
      if(data.user){
        const {data:p}=await supabase.from("users").select("*").eq("id",data.user.id).single();
        if(p){ setCurrentUser(mapUser(p)); return {success:true}; }
      }
    }
    const u=users.find(u=>u.email.toLowerCase()===email.toLowerCase());
    if(!u) return {success:false,error:"No account found with that email."};
    const pws=load<Record<string,string>>("dh_pw",{});
    if(pws[u.id]===password){ setCurrentUser(u); return {success:true}; }
    return {success:false,error:"Incorrect password."};
  },[users,ready]);

  const loginWithGoogle = useCallback(async()=>{
    if(ready){
      const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${window.location.origin}/auth/callback`}});
      if(error) return {success:false,error:error.message};
      return {success:true};
    }
    const m:User={id:uid(),name:"Google User",email:`g.${Date.now()}@gmail.com`,phone:"",idNumber:"",licenseNumber:"",idImageUrl:"",licenseImageUrl:"",role:"client",createdAt:new Date().toISOString()};
    setCurrentUser(m); setUsers(p=>[...p,m]); return {success:true};
  },[ready]);

  const signup = useCallback(async(data:SignupData)=>{
    let idUrl=data.idImageUrl||"", licUrl=data.licenseImageUrl||"";
    const tmpId=uid();
    // Upload docs
    if(data.idImageFile){ try{ idUrl=await uploadFile("documents",`${tmpId}/id`,data.idImageFile); }catch{} }
    else if(data.idImageUrl?.startsWith("data:")){ try{ idUrl=await uploadBase64("documents",`${tmpId}/id`,data.idImageUrl); }catch{} }
    if(data.licenseImageFile){ try{ licUrl=await uploadFile("documents",`${tmpId}/license`,data.licenseImageFile); }catch{} }
    else if(data.licenseImageUrl?.startsWith("data:")){ try{ licUrl=await uploadBase64("documents",`${tmpId}/license`,data.licenseImageUrl); }catch{} }

    if(ready){
      const {data:auth,error}=await supabase.auth.signUp({email:data.email,password:data.password,options:{data:{name:data.name}}});
      if(error) return {success:false,error:error.message};
      if(auth.user){
        await supabase.from("users").upsert({id:auth.user.id,name:data.name,email:data.email,phone:data.phone,id_number:data.idNumber,license_number:data.licenseNumber,id_image_url:idUrl,license_image_url:licUrl,role:"client"});
        const nu:User={id:auth.user.id,name:data.name,email:data.email,phone:data.phone,idNumber:data.idNumber,licenseNumber:data.licenseNumber,idImageUrl:idUrl,licenseImageUrl:licUrl,role:"client",createdAt:new Date().toISOString()};
        setCurrentUser(nu);
        // Notify admin
        await createInAppNotification("Pakinda","New Registration",`${data.name} registered and uploaded documents.`,"document");
        await sendNotification({type:"email",to:"pakindalimited@gmail.com",subject:"New Client Registration",message:`${data.name} (${data.email}) has registered.\nPhone: ${data.phone}\nID: ${data.idNumber}\nLicense: ${data.licenseNumber}`});
        await sendNotification({type:"sms",to:"+254706504698",message:`Pakinda Limited: New client ${data.name} registered with documents.`});
        await sendNotification({type:"whatsapp",to:"+254706504698",message:`👤 *New Registration*\n${data.name}\n${data.email}\n${data.phone}`});
        return {success:true};
      }
    }
    if(users.find(u=>u.email.toLowerCase()===data.email.toLowerCase())) return {success:false,error:"Account already exists."};
    const nu:User={id:tmpId,name:data.name,email:data.email,phone:data.phone,idNumber:data.idNumber,licenseNumber:data.licenseNumber,idImageUrl:idUrl,licenseImageUrl:licUrl,role:"client",createdAt:new Date().toISOString()};
    const pws=load<Record<string,string>>("dh_pw",{}); pws[nu.id]=data.password; save("dh_pw",pws);
    setUsers(p=>[...p,nu]); setCurrentUser(nu); return {success:true};
  },[users,ready]);

  const logout = useCallback(async()=>{ if(ready) await supabase.auth.signOut(); setCurrentUser(null); },[ready]);
  const updateUser = useCallback(async(id:string,d:Partial<User>)=>{
    if(ready) await supabase.from("users").update({name:d.name,phone:d.phone}).eq("id",id);
    setUsers(p=>p.map(u=>u.id===id?{...u,...d}:u)); setCurrentUser(p=>p?.id===id?{...p,...d} as User:p);
  },[ready]);

  // ── Fleet ────────────────────────────────────────────────────────────────────
  const addCar = useCallback(async(car:Omit<FleetCar,"id"|"slug">,img?:File)=>{
    const id=uid(), slug=(car.name as string).toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+id.slice(0,4);
    let imageUrl=(car as FleetCar).imageUrl||"";
    if(img){ try{ imageUrl=await uploadFile("car-images",`fleet/${slug}`,img); }catch{} }
    const nc:FleetCar={...car,id,slug,imageUrl,image:imageUrl||car.image} as FleetCar;
    if(ready){
      const {data}=await supabase.from("fleet_cars").insert({id,slug,name:car.name,series:car.series,category:car.category,image_url:imageUrl,spec_hp:car.spec.hp,spec_top:car.spec.top,spec_zero:car.spec.zero,price_per_day:car.pricePerDay,description:car.description,features:car.features,available:true}).select().single();
      if(data){ setFleet(p=>[...p,mapCar(data)]); return; }
    }
    setFleet(p=>[...p,nc]);
  },[ready]);

  const updateCar = useCallback(async(id:string,d:Partial<FleetCar>,img?:File)=>{
    let imageUrl=d.imageUrl;
    if(img){ try{ imageUrl=await uploadFile("car-images",`fleet/${id}`,img); }catch{} }
    const upd={...d,...(imageUrl?{imageUrl,image:imageUrl}:{})};
    if(ready) await supabase.from("fleet_cars").update({name:d.name,series:d.series,description:d.description,price_per_day:d.pricePerDay,features:d.features,available:d.available,spec_hp:d.spec?.hp,spec_top:d.spec?.top,spec_zero:d.spec?.zero,...(imageUrl?{image_url:imageUrl}:{})}).eq("id",id);
    setFleet(p=>p.map(c=>c.id===id?{...c,...upd}:c));
  },[ready]);

  const removeCar = useCallback(async(id:string)=>{
    if(ready) await supabase.from("fleet_cars").delete().eq("id",id);
    setFleet(p=>p.filter(c=>c.id!==id));
  },[ready]);

  const getBookedDates = useCallback((carId:string)=>
    bookings.filter(b=>b.carId===carId&&(b.status==="active"||b.status==="pending")).map(b=>({start:b.startDate,end:b.endDate}))
  ,[bookings]);

  // ── Bookings ─────────────────────────────────────────────────────────────────
  const createBooking = useCallback(async(b:Omit<Booking,"id"|"createdAt">)=>{
    const booking:Booking={...b,id:uid(),createdAt:new Date().toISOString()};
    if(ready){
      const {data}=await supabase.from("bookings").insert({car_id:b.carId,car_name:b.carName,car_slug:b.carSlug,user_id:b.userId,user_name:b.userName,user_email:b.userEmail,user_phone:b.userPhone,user_id_number:b.userIdNumber,user_license_number:b.userLicenseNumber,user_id_image_url:b.userIdImageUrl,user_license_image_url:b.userLicenseImageUrl,start_date:b.startDate,end_date:b.endDate,num_days:b.numDays,price_per_day:b.pricePerDay,total_price:b.totalPrice,payment_method:b.paymentMethod,payment_ref:b.paymentRef,status:b.status,pickup_location:b.pickupLocation}).select().single();
      if(data){
        const saved=mapBooking(data); setBookings(p=>[saved,...p]);
        await createInAppNotification("Pakinda","New Booking",`${b.userName} booked ${b.carName} · KES ${b.totalPrice.toLocaleString()}·${b.startDate}→${b.endDate}`,"booking");
        await sendNotification({type:"email",to:"pakindalimited@gmail.com",subject:`New Booking: ${b.carName}`,message:`Client: ${b.userName}\nCar: ${b.carName}\nDates: ${b.startDate}→${b.endDate}\nAmount: KES ${b.totalPrice.toLocaleString()}\nPayment: ${b.paymentMethod}\nPickup: ${b.pickupLocation}\nID: ${b.userIdNumber}\nLicense: ${b.userLicenseNumber}`});
        await sendNotification({type:"sms",to:"+254706504698",message:`New booking: ${b.userName} · ${b.carName} · ${b.startDate}→${b.endDate} · KES ${b.totalPrice.toLocaleString()}`});
        await sendNotification({type:"whatsapp",to:"+254706504698",message:`🚗 *New Booking*\n${b.userName}\n${b.carName}\n${b.startDate}→${b.endDate}\nKES ${b.totalPrice.toLocaleString()}`});
        await sendNotification({type:"email",to:b.userEmail,subject:"Booking Confirmed · Pakinda Limited",message:`Dear ${b.userName},\n\nYour booking for ${b.carName} is confirmed.\n\nDates: ${b.startDate}→${b.endDate}\nTotal: KES ${b.totalPrice.toLocaleString()}\nRef: ${saved.id.slice(0,8).toUpperCase()}\n\nWe'll contact you within 2 hours.`});
        return saved;
      }
    }
    setBookings(p=>[booking,...p]); return booking;
  },[ready]);

  const updateBooking = useCallback(async(id:string,d:Partial<Booking>)=>{
    if(ready) await supabase.from("bookings").update({status:d.status,returned_at:d.returnedAt,return_condition:d.returnCondition,return_notes:d.returnNotes,admin_notes:d.adminNotes}).eq("id",id);
    setBookings(p=>p.map(b=>b.id===id?{...b,...d}:b));
  },[ready]);

  const getCarBookings = useCallback((carId:string)=>bookings.filter(b=>b.carId===carId),[bookings]);
  const getUserBookings = useCallback((userId:string)=>bookings.filter(b=>b.userId===userId),[bookings]);

  // ── Service ───────────────────────────────────────────────────────────────────
  const updateServiceRecord = useCallback(async(carId:string,r:ServiceRecord)=>{
    if(ready){ await supabase.from("service_records").upsert({car_id:carId,last_service_date:r.lastServiceDate,next_service_date:r.nextServiceDate,service_notes:r.serviceNotes,updated_at:new Date().toISOString()}); const t=new Date().toISOString().split("T")[0]; if(r.nextServiceDate<=t) await supabase.from("fleet_cars").update({available:false}).eq("id",carId); }
    setFleet(p=>p.map(c=>{ if(c.id!==carId) return c; const t=new Date().toISOString().split("T")[0]; return {...c,serviceRecord:r,available:r.nextServiceDate<=t?false:c.available}; }));
  },[ready]);

  const getRevenue = useCallback((p:"week"|"month"|"year")=>bookings.filter(b=>b.status!=="cancelled"&&inPeriod(b.createdAt,p)).reduce((s,b)=>s+b.totalPrice,0),[bookings]);
  const getCarRevenue = useCallback((carId:string,p:"week"|"month"|"year")=>bookings.filter(b=>b.carId===carId&&b.status!=="cancelled"&&inPeriod(b.createdAt,p)).reduce((s,b)=>s+b.totalPrice,0),[bookings]);

  // ── Market ────────────────────────────────────────────────────────────────────
  const submitMarketListing = useCallback(async(listing:Omit<MarketListing,"id"|"createdAt"|"status">,imgs:File[])=>{
    const id=uid(); const imageUrls:string[]=[];
    for(let i=0;i<imgs.length;i++){ try{ const u=await uploadFile("market-photos",`${id}/photo-${i}`,imgs[i]); imageUrls.push(u); }catch{} }
    const nl:MarketListing={...listing,id,imageUrls,status:"pending",createdAt:new Date().toISOString()};
    if(ready) await supabase.from("market_listings").insert({id,seller_id:currentUser?.id,seller_name:listing.sellerName,seller_email:listing.sellerEmail,seller_phone:listing.sellerPhone,make:listing.make,model:listing.model,year:listing.year,mileage:listing.mileage,asking_price:listing.askingPrice,description:listing.description,image_urls:imageUrls,status:"pending"});
    setMarket(p=>[nl,...p]);
    await createInAppNotification("Pakinda","New Car Listing",`${listing.sellerName} submitted ${listing.year} ${listing.make} ${listing.model} for KES ${listing.askingPrice?.toLocaleString()}`,"approval");
    await sendNotification({type:"email",to:"pakindalimited@gmail.com",subject:"New Car Listing",message:`${listing.sellerName} submitted:\n${listing.year} ${listing.make} ${listing.model}\nKES ${listing.askingPrice?.toLocaleString()}\nMileage: ${listing.mileage}\nPhone: ${listing.sellerPhone}`});
    await sendNotification({type:"whatsapp",to:"+254706504698",message:`🚗 *New Listing*\n${listing.year} ${listing.make} ${listing.model}\n${listing.sellerName} · KES ${listing.askingPrice?.toLocaleString()}`});
  },[ready,currentUser]);

  const updateMarketListing = useCallback(async(id:string,d:Partial<MarketListing>)=>{
    if(ready) await supabase.from("market_listings").update({status:d.status,admin_notes:d.adminNotes}).eq("id",id);
    setMarket(p=>p.map(l=>l.id===id?{...l,...d}:l));
    if(d.status==="approved"){ const l=marketListings.find(x=>x.id===id); if(l) await sendNotification({type:"email",to:l.sellerEmail,subject:"Your listing is live · Pakinda Limited",message:`Your ${l.year} ${l.make} ${l.model} has been approved and is now live on Pakinda Limited Car Market.`}); }
  },[ready,marketListings]);

  const markNotificationRead = useCallback(async(id:string)=>{
    if(ready) await supabase.from("notifications").update({read:true}).eq("id",id);
    setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  },[ready]);

  const unreadCount=notifications.filter(n=>!n.read).length;

  return (
    <Ctx.Provider value={{currentUser,users,login,loginWithGoogle,signup,logout,updateUser,fleetCars,addCar,updateCar,removeCar,getBookedDates,bookings,createBooking,updateBooking,getCarBookings,getUserBookings,updateServiceRecord,getRevenue,getCarRevenue,marketListings,submitMarketListing,updateMarketListing,notifications,markNotificationRead,unreadCount,supabaseReady:ready}}>
      {children}
    </Ctx.Provider>
  );
};

// ─── Mappers ──────────────────────────────────────────────────────────────────
function mapUser(u:Record<string,unknown>):User{ return {id:u.id as string,name:u.name as string,email:u.email as string,phone:(u.phone as string)||"",idNumber:(u.id_number as string)||"",licenseNumber:(u.license_number as string)||"",idImageUrl:(u.id_image_url as string)||"",licenseImageUrl:(u.license_image_url as string)||"",role:(u.role as "client"|"admin")||"client",createdAt:u.created_at as string}; }
function mapCar(c:Record<string,unknown>):FleetCar{ return {id:c.id as string,slug:c.slug as string,name:c.name as string,series:(c.series as string)||"",category:c.category as FleetCar["category"],image:(c.image_url as string)||"",imageUrl:(c.image_url as string)||"",spec:{hp:(c.spec_hp as string)||"",top:(c.spec_top as string)||"",zero:(c.spec_zero as string)||""},pricePerDay:c.price_per_day as number,price:`KES ${(c.price_per_day as number)?.toLocaleString()}`,description:(c.description as string)||"",features:(c.features as string[])||[],available:c.available as boolean}; }
function mapBooking(b:Record<string,unknown>):Booking{ return {id:b.id as string,carId:b.car_id as string,carName:b.car_name as string,carSlug:b.car_slug as string,userId:b.user_id as string,userName:b.user_name as string,userEmail:b.user_email as string,userPhone:b.user_phone as string,userIdNumber:b.user_id_number as string,userLicenseNumber:b.user_license_number as string,userIdImageUrl:b.user_id_image_url as string,userLicenseImageUrl:b.user_license_image_url as string,startDate:b.start_date as string,endDate:b.end_date as string,numDays:b.num_days as number,pricePerDay:b.price_per_day as number,totalPrice:b.total_price as number,paymentMethod:b.payment_method as PaymentMethod,paymentRef:b.payment_ref as string,status:b.status as BookingStatus,createdAt:b.created_at as string,returnedAt:(b.returned_at as string)||undefined,returnCondition:(b.return_condition as string)||undefined,returnNotes:(b.return_notes as string)||undefined,adminNotes:(b.admin_notes as string)||undefined,pickupLocation:b.pickup_location as string}; }
function mapListing(l:Record<string,unknown>):MarketListing{ return {id:l.id as string,sellerId:l.seller_id as string,sellerName:l.seller_name as string,sellerEmail:l.seller_email as string,sellerPhone:l.seller_phone as string,make:l.make as string,model:l.model as string,year:l.year as string,mileage:l.mileage as string,askingPrice:l.asking_price as number,description:l.description as string,imageUrls:(l.image_urls as string[])||[],status:l.status as ListingStatus,adminNotes:(l.admin_notes as string)||undefined,createdAt:l.created_at as string}; }
