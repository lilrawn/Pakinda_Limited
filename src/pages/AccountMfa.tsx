import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

/**
 * TOTP MFA enrollment + verification.
 * Admin RLS requires aal2 — every admin must enroll a TOTP factor and verify on each session.
 */
const AccountMfa = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [aal, setAal] = useState<string | null>(null);
  const [factors, setFactors] = useState<{ id: string; status: string; friendly_name?: string | null }[]>([]);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!currentUser) navigate("/auth", { replace: true });
  }, [currentUser, navigate]);

  const refresh = async () => {
    setLoading(true);
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setAal(aalData?.currentLevel ?? null);
    const { data: f } = await supabase.auth.mfa.listFactors();
    setFactors(
      (f?.totp ?? []).map((x) => ({ id: x.id, status: x.status, friendly_name: x.friendly_name }))
    );
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) refresh();
  }, [currentUser]);

  const beginEnroll = async () => {
    setWorking(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Pakinda ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;
      setEnrollData({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: data.id });
      if (chErr) throw chErr;
      setChallengeId(ch.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start enrollment");
    } finally {
      setWorking(false);
    }
  };

  const verifyEnroll = async () => {
    if (!enrollData || !challengeId) return;
    setWorking(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId,
        code: code.trim(),
      });
      if (error) throw error;
      toast.success("MFA enabled. You are now at AAL2.");
      setEnrollData(null);
      setChallengeId(null);
      setCode("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setWorking(false);
    }
  };

  const stepUp = async (factorId: string) => {
    setWorking(true);
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr) throw chErr;
      setChallengeId(ch.id);
      setEnrollData({ factorId, qr: "", secret: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start challenge");
    } finally {
      setWorking(false);
    }
  };

  const verifyStepUp = async () => {
    if (!enrollData || !challengeId) return;
    setWorking(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId,
        code: code.trim(),
      });
      if (error) throw error;
      toast.success("Verified. You are now at AAL2.");
      setEnrollData(null);
      setChallengeId(null);
      setCode("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setWorking(false);
    }
  };

  const unenroll = async (factorId: string) => {
    if (!confirm("Remove this MFA factor? You will lose AAL2 access.")) return;
    setWorking(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("Factor removed");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove factor");
    } finally {
      setWorking(false);
    }
  };

  if (!currentUser) return null;

  const verifiedFactor = factors.find((f) => f.status === "verified");
  const unverifiedFactor = factors.find((f) => f.status === "unverified");
  const isStepUp = enrollData && !enrollData.qr;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3">Account Security</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Two-Factor Authentication</h1>
        <p className="text-sm text-foreground/60 mb-8">
          Required for admin access. Use Google Authenticator, 1Password, Authy, or any TOTP app.
        </p>

        <div className="border border-foreground/10 rounded-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">Current level</p>
            <p className="font-display text-2xl">{aal ?? "—"}</p>
          </div>
          <span
            className={`text-[10px] uppercase tracking-[0.25em] px-3 py-1 rounded-full ${
              aal === "aal2"
                ? "bg-green-500/15 text-green-500"
                : "bg-amber-500/15 text-amber-500"
            }`}
          >
            {aal === "aal2" ? "Secure" : "Step-up required"}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-foreground/40">Loading…</p>
        ) : enrollData ? (
          <div className="border border-foreground/10 rounded-lg p-6 space-y-5">
            {!isStepUp && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/40 mb-2">
                    1. Scan with your authenticator app
                  </p>
                  <div className="bg-white p-4 inline-block rounded">
                    <img src={enrollData.qr} alt="MFA QR code" className="w-48 h-48" />
                  </div>
                  <p className="text-xs text-foreground/50 mt-3">
                    Or enter manually:{" "}
                    <code className="bg-foreground/10 px-2 py-1 rounded text-xs">{enrollData.secret}</code>
                  </p>
                </div>
                <div className="border-t border-foreground/10 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/40 mb-2">
                    2. Enter the 6-digit code
                  </p>
                </div>
              </>
            )}
            {isStepUp && (
              <p className="text-sm text-foreground/70">Enter your 6-digit code to step up to AAL2.</p>
            )}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full bg-transparent border border-foreground/20 rounded px-4 py-3 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:border-foreground/50"
            />
            <div className="flex gap-3">
              <button
                onClick={isStepUp ? verifyStepUp : verifyEnroll}
                disabled={working || code.length !== 6}
                className="flex-1 bg-foreground text-background py-3 text-[10px] uppercase tracking-[0.25em] font-medium rounded disabled:opacity-40"
              >
                {working ? "Verifying…" : "Verify"}
              </button>
              <button
                onClick={() => {
                  setEnrollData(null);
                  setChallengeId(null);
                  setCode("");
                }}
                className="px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-foreground/60 border border-foreground/20 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {factors.length === 0 && (
              <div className="border border-foreground/10 rounded-lg p-6">
                <p className="text-sm text-foreground/70 mb-4">
                  No authenticator enrolled. Set one up to unlock admin features.
                </p>
                <button
                  onClick={beginEnroll}
                  disabled={working}
                  className="bg-foreground text-background px-5 py-3 text-[10px] uppercase tracking-[0.25em] font-medium rounded disabled:opacity-40"
                >
                  {working ? "Starting…" : "Enroll Authenticator"}
                </button>
              </div>
            )}

            {unverifiedFactor && (
              <div className="border border-amber-500/40 bg-amber-500/5 rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Pending enrollment</p>
                  <p className="text-xs text-foreground/50 mt-1">Finish verifying or remove it.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => stepUp(unverifiedFactor.id)}
                    className="text-[10px] uppercase tracking-[0.25em] px-3 py-2 border border-foreground/20 rounded"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => unenroll(unverifiedFactor.id)}
                    className="text-[10px] uppercase tracking-[0.25em] px-3 py-2 text-red-500 border border-red-500/40 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {verifiedFactor && (
              <div className="border border-foreground/10 rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{verifiedFactor.friendly_name || "Authenticator"}</p>
                  <p className="text-xs text-foreground/50 mt-1">Verified TOTP factor</p>
                </div>
                <div className="flex gap-2">
                  {aal !== "aal2" && (
                    <button
                      onClick={() => stepUp(verifiedFactor.id)}
                      className="text-[10px] uppercase tracking-[0.25em] px-3 py-2 bg-foreground text-background rounded"
                    >
                      Step Up to AAL2
                    </button>
                  )}
                  <button
                    onClick={() => unenroll(verifiedFactor.id)}
                    className="text-[10px] uppercase tracking-[0.25em] px-3 py-2 text-red-500 border border-red-500/40 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {currentUser.role === "admin" && aal === "aal2" && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full bg-foreground text-background py-3 text-[10px] uppercase tracking-[0.25em] font-medium rounded"
              >
                Go to Admin Dashboard →
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountMfa;