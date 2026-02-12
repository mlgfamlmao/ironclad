import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const emailRef = useRef(
    location.state?.email || localStorage.getItem("pending_verification_email")
  );
  const email = emailRef.current;

  const [code, setCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiryTimer, setExpiryTimer] = useState(0);

  
  const isNavigatingRef = useRef(false);

  const inputs = useRef([]);

  const RESEND_KEY = `otp_resend_${email}`;
  const EXPIRY_KEY = `otp_expiry_${email}`;

  useEffect(() => {
    
    if (isNavigatingRef.current) {
      return;
    }

    
    if (!email) {
      console.log("No email found, redirecting to signup");
      navigate("/signup", { replace: true });
      return;
    }

    console.log("Email found:", email);

    const now = Date.now();

    if (!localStorage.getItem(RESEND_KEY)) {
      localStorage.setItem(RESEND_KEY, now + 60000);
    }

    if (!localStorage.getItem(EXPIRY_KEY)) {
      localStorage.setItem(EXPIRY_KEY, now + 300000);
    }

    const interval = setInterval(() => {
      const resendTarget = parseInt(localStorage.getItem(RESEND_KEY) || 0, 10);
      const expiryTarget = parseInt(localStorage.getItem(EXPIRY_KEY) || 0, 10);

      setResendTimer(Math.max(0, Math.floor((resendTarget - Date.now()) / 1000)));
      setExpiryTimer(Math.max(0, Math.floor((expiryTarget - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate, RESEND_KEY, EXPIRY_KEY]);

  const handleChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...code];
    next[i] = value;
    setCode(next);

    if (value && i < 5) inputs.current[i + 1]?.focus();

    if (next.every(d => d !== "")) {
      submit(next.join(""));
    }
  };

  const submit = async (otp) => {
    setError("");
    setIsVerifying(true);

    try {
      console.log("Submitting verification code...");
      
      const res = await fetch("http://localhost:8000/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      console.log("Verification successful!");

      
      isNavigatingRef.current = true;

      
      localStorage.setItem("token", data.access_token);
      console.log("Token stored");

      
      localStorage.removeItem("pending_verification_email");
      localStorage.removeItem(RESEND_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      console.log("Cleaned up verification data");

      
      setTimeout(() => {
        console.log();
        navigate("/profile", { replace: true });
      }, 100);

    } catch (err) {
      console.error("Verification failed:", err);
      setError(err.message || "Invalid code");
      setCode(Array(6).fill(""));
      inputs.current[0]?.focus();
      isNavigatingRef.current = false;
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    try {
      const res = await fetch("http://localhost:8000/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      const now = Date.now();
      localStorage.setItem(RESEND_KEY, now + 60000);
      localStorage.setItem(EXPIRY_KEY, now + 300000);

    } catch (err) {
      setError(err.message || "Unable to resend");
    }
  };

 
  if (!email) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 px-6">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950" />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
          <p className="text-zinc-400 mb-6 text-sm">Code sent to {email}</p>

          <div className="flex justify-center gap-3 mb-6">
            {code.map((v, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                value={v}
                onChange={(e) => handleChange(i, e.target.value)}
                maxLength={1}
                className="w-12 h-14 text-center text-xl rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:ring-2 focus:ring-white/30"
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-rose-500 text-sm">{error}</p>
            </div>
          )}

          <p className="text-zinc-400 text-sm mb-3">
            Expires in {Math.floor(expiryTimer / 60)}:
            {String(expiryTimer % 60).padStart(2, "0")}
          </p>

          <button
            onClick={resendOtp}
            disabled={resendTimer > 0}
            className="text-sm text-white hover:underline disabled:opacity-50"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
          </button>

          {isVerifying && <p className="text-zinc-500 text-sm mt-4">Verifying…</p>}
        </div>
      </div>
    </div>
  );
}