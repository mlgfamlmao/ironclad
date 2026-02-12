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

  function getAge(birthdateString) {
    if (!birthdateString) return 0;
    const today = new Date();
    const dob = new Date(birthdateString);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  async function handleSignup() {
    setError("");

    if (!firstName || !lastName || !birthdate || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (getAge(birthdate) < 15) {
      setError("You must be at least 15 years old to sign up");
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
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          birthdate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");

      navigate("/verify-email", { state: { email, reset: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-lg text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600";

  const labelClass =
    "block text-left text-xs text-zinc-400 mb-1 ml-1 tracking-wide";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-900">

      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={LoginVideo} type="video/mp4" />
      </video>

   
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-800/60 to-zinc-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-transparent to-zinc-900/50" />

      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl">

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-14">

           
            <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
              Create account
            </h1>
            <p className="text-zinc-400 mb-12 text-base">
              Establish your Ironclad identity
            </p>

           
            <div className="space-y-6">

             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

           
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>

          
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            
            {error && (
              <div className="mt-8 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                <p className="text-sm text-zinc-300 font-medium">
                  {error}
                </p>
              </div>
            )}

            
            <button
              onClick={handleSignup}
              disabled={loading}
              className="mt-14 w-full rounded-full bg-white py-4 font-bold text-black text-lg transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            
            <p className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-white hover:text-zinc-200 cursor-pointer font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
