import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp, SignupData } from "@/context/AppContext";
import carHero from "@/assets/car-hero.png";

type Mode = "signin" | "signup";

const AuthPage = () => {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string; carSlug?: string })?.returnTo || "/";
  const carSlug = (location.state as { carSlug?: string })?.carSlug;

  const [mode, setMode] = useState<Mode>((location.state as { mode?: Mode })?.mode || "signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    (async () => {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        navigate(carSlug ? `/fleet/${carSlug}` : returnTo, { replace: true });
      } else {
        setError(result.error || "Sign in failed.");
      }
    })();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Full name is required."); return; }
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) { setError("Valid email required."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (signupPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (signupPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const data: SignupData = {
      name, email: signupEmail, phone, password: signupPassword,
      idNumber: "", licenseNumber: "", idImageUrl: "", licenseImageUrl: "",
    };
    (async () => {
      const result = await signup(data);
      setLoading(false);
      if (result.success) {
        navigate(carSlug ? `/fleet/${carSlug}` : returnTo, { replace: true });
      } else {
        setError(result.error || "Sign up failed.");
      }
    })();
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
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-3 text-[10px] uppercase tracking-[0.25em] font-medium transition-all ${mode === "signin" ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground"}`}
            >Sign In</button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-3 text-[10px] uppercase tracking-[0.25em] font-medium transition-all ${mode === "signup" ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground"}`}
            >Create Account</button>
          </div>

          {mode === "signin" ? (
            <>
              <h1 className="font-display text-3xl mb-2">Welcome back.</h1>
              <p className="text-foreground/50 text-sm mb-8">Sign in to access the fleet and your bookings.</p>

              <form onSubmit={handleSignIn} className="space-y-5">
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-vault mt-2 disabled:opacity-40">
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
              </form>
              
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl mb-2">Create your account.</h1>
              <p className="text-foreground/50 text-sm mb-8">It only takes a minute. You'll upload ID & license documents later when you book your first vehicle.</p>

              <form onSubmit={handleSignUp} className="space-y-5">
                <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Grace Wanjiku" />
                <Field label="Email Address" type="email" value={signupEmail} onChange={setSignupEmail} placeholder="you@example.com" />
                <Field label="WhatsApp / Phone" value={phone} onChange={setPhone} placeholder="+254 7XX XXX XXX" />
                <Field label="Password" type="password" value={signupPassword} onChange={setSignupPassword} placeholder="Min. 6 characters" />
                <Field label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password" />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-vault mt-2 disabled:opacity-40">
                  {loading ? "Creating account…" : "Create Account →"}
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

export default AuthPage;
