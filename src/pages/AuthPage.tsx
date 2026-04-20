import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp, SignupData } from "@/context/AppContext";
import carHero from "@/assets/car-hero.png";

type Mode = "signin" | "signup";

const AuthPage = () => {
  const { login, loginWithGoogle, signup } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string; carSlug?: string })?.returnTo || "/";
  const carSlug = (location.state as { carSlug?: string })?.carSlug;

  const [mode, setMode] = useState<Mode>((location.state as { mode?: Mode })?.mode || "signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // step 2 = upload docs

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [idImageUrl, setIdImageUrl] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");
  const [idFileName, setIdFileName] = useState("");
  const [licenseFileName, setLicenseFileName] = useState("");

  const idRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "id" | "license") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "id") { setIdImageUrl(result); setIdFileName(file.name); }
      else { setLicenseImageUrl(result); setLicenseFileName(file.name); }
    };
    reader.readAsDataURL(file);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        navigate(carSlug ? `/fleet/${carSlug}` : returnTo, { replace: true });
      } else {
        setError(result.error || "Sign in failed.");
      }
    }, 600);
  };

  const handleSignUpStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Full name is required."); return; }
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) { setError("Valid email required."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (signupPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (signupPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setStep(2);
  };

  const handleSignUpStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!idNumber.trim()) { setError("National ID number is required."); return; }
    if (!licenseNumber.trim()) { setError("Driver's license number is required."); return; }
    if (!idImageUrl) { setError("Please upload your National ID."); return; }
    if (!licenseImageUrl) { setError("Please upload your driver's license."); return; }

    setLoading(true);
    const data: SignupData = {
      name, email: signupEmail, phone, password: signupPassword,
      idNumber, licenseNumber, idImageUrl, licenseImageUrl,
    };
    setTimeout(() => {
      const result = signup(data);
      setLoading(false);
      if (result.success) {
        navigate(carSlug ? `/fleet/${carSlug}` : returnTo, { replace: true });
      } else {
        setError(result.error || "Sign up failed.");
        setStep(1);
      }
    }, 800);
  };

  const handleGoogle = () => {
    loginWithGoogle();
    navigate(carSlug ? `/fleet/${carSlug}` : returnTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-[#0f0e0d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(#c8a84b 1px, transparent 1px), linear-gradient(90deg, #c8a84b 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <a href="/" className="font-display text-2xl tracking-[0.35em] uppercase text-white relative z-10">
          Pakinda Limited
        </a>
        <div className="relative z-10">
          <img src={carHero} alt="" className="w-full max-w-xl mx-auto drop-shadow-2xl mb-12 opacity-90" />
          <p className="font-display text-3xl text-white leading-tight mb-4">
            Kenya's roads deserve<br />
            <span className="italic" style={{ color: "#c8a84b" }}>extraordinary machines.</span>
          </p>
          <p className="text-white/40 text-sm">Nairobi</p>
        </div>
        <p className="text-white/20 text-xs tracking-widest uppercase relative z-10">Pakinda Limited — Let us pull together</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <a href="/" className="font-display text-xl tracking-[0.3em] uppercase text-foreground block mb-10 lg:hidden text-center">
            Pakinda Limited
          </a>

          {/* Tab switcher */}
          <div className="flex border border-foreground/10 mb-10">
            <button
              onClick={() => { setMode("signin"); setError(""); setStep(1); }}
              className={`flex-1 py-3 text-[10px] uppercase tracking-[0.25em] font-medium transition-all ${mode === "signin" ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground"}`}
            >Sign In</button>
            <button
              onClick={() => { setMode("signup"); setError(""); setStep(1); }}
              className={`flex-1 py-3 text-[10px] uppercase tracking-[0.25em] font-medium transition-all ${mode === "signup" ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground"}`}
            >Create Account</button>
          </div>

          {mode === "signin" ? (
            <>
              <h1 className="font-display text-3xl mb-2">Welcome back.</h1>
              <p className="text-foreground/50 text-sm mb-8">Sign in to access the fleet and your bookings.</p>

              {/* Google */}
              <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-foreground/15 py-3.5 mb-6 text-sm text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-all duration-300">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-foreground/10" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/30">or</span>
                <div className="flex-1 h-px bg-foreground/10" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-5">
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-vault mt-2 disabled:opacity-40">
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
              </form>
              <p className="text-center text-xs text-foreground/30 mt-6">
                Admin? Use <span className="font-mono">admin@driveharambee.co.ke</span> / <span className="font-mono">admin123</span>
              </p>
            </>
          ) : step === 1 ? (
            <>
              <h1 className="font-display text-3xl mb-2">Create your account.</h1>
              <p className="text-foreground/50 text-sm mb-8">Step 1 of 2 — Personal details</p>

              <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-foreground/15 py-3.5 mb-6 text-sm text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-all duration-300">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-foreground/10" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/30">or</span>
                <div className="flex-1 h-px bg-foreground/10" />
              </div>

              <form onSubmit={handleSignUpStep1} className="space-y-5">
                <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Grace Wanjiku" />
                <Field label="Email Address" type="email" value={signupEmail} onChange={setSignupEmail} placeholder="you@example.com" />
                <Field label="WhatsApp / Phone" value={phone} onChange={setPhone} placeholder="+254 7XX XXX XXX" />
                <Field label="Password" type="password" value={signupPassword} onChange={setSignupPassword} placeholder="Min. 6 characters" />
                <Field label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password" />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" className="w-full btn-vault mt-2">Continue → Upload Documents</button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="text-foreground/40 hover:text-foreground transition-colors text-sm">← Back</button>
                <span className="text-foreground/20 text-sm">|</span>
                <h1 className="font-display text-2xl">Documents</h1>
              </div>
              <p className="text-foreground/50 text-sm mb-8">
                Step 2 of 2 — Required for all vehicle hires. Kept securely and confidentially.
              </p>

              <form onSubmit={handleSignUpStep2} className="space-y-6">
                <Field label="National ID Number" value={idNumber} onChange={setIdNumber} placeholder="e.g. 12345678" />
                <Field label="Driver's License Number" value={licenseNumber} onChange={setLicenseNumber} placeholder="e.g. DL-KE-9876" />

                {/* ID Upload */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 block mb-3">National ID · Photo Upload</label>
                  <input ref={idRef} type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, "id")} className="hidden" />
                  <button type="button" onClick={() => idRef.current?.click()}
                    className={`w-full border-2 border-dashed py-6 text-center transition-all duration-300 ${idImageUrl ? "border-[#c8a84b]/60 bg-[#c8a84b]/5" : "border-foreground/15 hover:border-foreground/30"}`}>
                    {idImageUrl ? (
                      <span className="text-sm text-foreground/70">✓ {idFileName}</span>
                    ) : (
                      <span className="text-sm text-foreground/40">Click to upload National ID (image or PDF)</span>
                    )}
                  </button>
                </div>

                {/* License Upload */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 block mb-3">Driver's License · Photo Upload</label>
                  <input ref={licenseRef} type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, "license")} className="hidden" />
                  <button type="button" onClick={() => licenseRef.current?.click()}
                    className={`w-full border-2 border-dashed py-6 text-center transition-all duration-300 ${licenseImageUrl ? "border-[#c8a84b]/60 bg-[#c8a84b]/5" : "border-foreground/15 hover:border-foreground/30"}`}>
                    {licenseImageUrl ? (
                      <span className="text-sm text-foreground/70">✓ {licenseFileName}</span>
                    ) : (
                      <span className="text-sm text-foreground/40">Click to upload Driver's License (image or PDF)</span>
                    )}
                  </button>
                </div>

                {error && <p className="text-red-500 text-xs">{error}</p>}
                <p className="text-xs text-foreground/30 leading-relaxed">
                  Your documents are stored securely and only accessible to Pakinda Limited staff for verification purposes.
                </p>
                <button type="submit" disabled={loading} className="w-full btn-vault disabled:opacity-40">
                  {loading ? "Creating account…" : "Create Account & Continue →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 block mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-foreground/20 focus:border-foreground outline-none py-3 text-base font-light placeholder:text-foreground/25 transition-colors"
    />
  </div>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default AuthPage;
