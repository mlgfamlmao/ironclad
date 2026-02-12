import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginVideo from "../assets/Login.mp4";

export default function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function calculateAge(dateString) {
    if (!dateString) return 0;
    const today = new Date();
    const dob = new Date(dateString);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  async function handleSignup() {
    if (loading) return; 
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst || !cleanLast || !birthdate || !cleanEmail || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (calculateAge(birthdate) < 15) {
      setError("You must be at least 15 years old");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          first_name: cleanFirst,
          last_name: cleanLast,
          birthdate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      
      localStorage.removeItem("token");

      
      localStorage.setItem("pending_verification_email", cleanEmail);

      
      navigate("/verify-email", { replace: true, state: { email: cleanEmail } });

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-lg text-white placeholder-zinc-500 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition";

  const labelClass =
    "block text-left text-xs text-zinc-400 mb-1 ml-1 tracking-wide";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950">
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={LoginVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/70 to-zinc-950/95" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-14">
            
            <h1 className="text-5xl font-bold text-white mb-3">Create Account</h1>
            <p className="text-zinc-400 mb-10">Initialize your Ironclad identity</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
              </div>
            </div>

            {error && (
              <div className="mt-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-sm text-rose-500">{error}</p>
              </div>
            )}

            <button onClick={handleSignup} disabled={loading} className="mt-14 w-full rounded-full bg-white py-4 font-bold text-black text-lg hover:bg-zinc-200 active:scale-95 transition disabled:opacity-50">
              {loading ? "Creating account…" : "Create Account"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}