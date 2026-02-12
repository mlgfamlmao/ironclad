import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginVideo from "../assets/Login.mp4";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid credentials");

      
      localStorage.setItem("token", data.access_token);

      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-lg text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

  const labelClass =
    "block text-left text-xs text-zinc-400 mb-1 ml-1 tracking-wide";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-900">

      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={LoginVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-800/60 to-zinc-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-transparent to-zinc-900/50" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl">

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-14">

            <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
              Welcome back
            </h1>

            <p className="text-zinc-400 mb-12 text-base">
              Sign in to continue your training
            </p>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="mt-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-sm text-rose-500 font-medium">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-14 w-full rounded-full bg-white py-4 font-bold text-black text-lg transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-white hover:text-zinc-200 cursor-pointer font-medium underline-offset-4 hover:underline"
              >
                Create one
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
