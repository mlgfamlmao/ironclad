import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



const LabelWithInfo = ({ label, info }) => (
  <div className="flex items-center gap-2 mb-2 group relative">
    <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
      {label}
    </label>
    {info && (
      <>
        <div className="cursor-help text-zinc-500 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div className="absolute left-0 bottom-6 w-64 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl text-xs text-zinc-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
          {info}
        </div>
      </>
    )}
  </div>
);

const InputGroup = ({
  label,
  info,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
}) => (
  <div className="w-full">
    <LabelWithInfo label={label} info={info} />
    <div className="relative">
      <input
        type={type}
        value={value === null || value === undefined ? "" : value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full bg-zinc-950 border border-zinc-800
          text-white rounded-xl px-4 py-3
          outline-none transition
          focus:border-white/40 focus:ring-1 focus:ring-white/10
          placeholder-zinc-600
        "
      />
      {suffix && (
        <span className="absolute right-4 top-3 text-zinc-500 text-sm font-medium">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

/* ---------- MAIN ---------- */

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    primary_endurance: "",
    squat_max: "",
    deadlift_max: "",
    press_max: "",
    endurance_metric_type: "FTP",
    endurance_metric_value: "",
    bodyweight: "",
    height: "",
    weekly_hours: "",
    training_time_pref: "AM",
    preferred_rest_day: "Sunday",
    equipment_access: "Full Gym",
    cadence_pref: "",
    injury_history: "",
  });


  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("http://localhost:8000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profileData = await res.json();
          setData((prev) => ({ ...prev, ...profileData }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  const update = (k, v) => setData({ ...data, [k]: v });

 

  async function submit() {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) navigate("/dashboard");
      else alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
          <span className="text-zinc-500 text-xs uppercase tracking-widest">
            Loading Profile
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">

      <div className="absolute inset-0 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-900/60" />
      </div>

      <div className="relative z-10 py-12 px-4 md:px-6 flex justify-center">
        <div className="w-full max-w-2xl space-y-10">

          
          <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight italic">
                Edit <span className="text-zinc-400">Parameters</span>
              </h1>
              <p className="text-zinc-500 text-sm">
                Update metrics to recalibrate training logic.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-zinc-500 hover:text-white transition text-sm uppercase"
            >
              Cancel
            </button>
          </div>

       
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wide">
              Core Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Bodyweight"
                suffix="kg"
                type="number"
                value={data.bodyweight}
                onChange={(e) => update("bodyweight", e.target.value)}
              />
              <InputGroup
                label="Height"
                suffix="cm"
                type="number"
                info="Used for relative strength and BMI calculations."
                value={data.height}
                onChange={(e) => update("height", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup label="Squat" suffix="kg" type="number" value={data.squat_max} onChange={(e) => update("squat_max", e.target.value)} />
              <InputGroup label="Deadlift" suffix="kg" type="number" value={data.deadlift_max} onChange={(e) => update("deadlift_max", e.target.value)} />
              <InputGroup label="Press" suffix="kg" type="number" value={data.press_max} onChange={(e) => update("press_max", e.target.value)} />
            </div>
          </section>

         
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wide">
              Endurance Engine
            </h3>

            <InputGroup
              label="Primary Modality"
              value={data.primary_endurance}
              onChange={(e) => update("primary_endurance", e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <LabelWithInfo label="Metric Type" info="Primary endurance benchmark." />
                <select
                  value={data.endurance_metric_type}
                  onChange={(e) => update("endurance_metric_type", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-white/40"
                >
                  <option value="FTP">FTP (Watts)</option>
                  <option value="5K">5K Run</option>
                  <option value="2K Row">2K Row</option>
                  <option value="VO2 Max">VO2 Max</option>
                </select>
              </div>

              <InputGroup
                label="Metric Value"
                value={data.endurance_metric_value}
                onChange={(e) => update("endurance_metric_value", e.target.value)}
              />
            </div>
          </section>

          
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wide">
              Logistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <LabelWithInfo label="Preferred Rest Day" />
                <select
                  value={data.preferred_rest_day}
                  onChange={(e) => update("preferred_rest_day", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-white/40"
                >
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <InputGroup
                label="Weekly Training Hours"
                suffix="hrs"
                type="number"
                value={data.weekly_hours}
                onChange={(e) => update("weekly_hours", e.target.value)}
              />
            </div>

            <div>
              <LabelWithInfo label="Equipment Access" />
              <select
                value={data.equipment_access}
                onChange={(e) => update("equipment_access", e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-white/40"
              >
                <option value="Full Gym">Full Gym</option>
                <option value="Home Gym">Home Gym</option>
                <option value="Dumbbells">Dumbbells Only</option>
                <option value="Bodyweight">Bodyweight Only</option>
              </select>
            </div>
          </section>

          
          <div className="pt-6 pb-20">
            <button
              onClick={submit}
              disabled={saving}
              className="
                w-full bg-white text-black font-bold rounded-2xl
                py-4 text-lg uppercase tracking-wide
                hover:bg-zinc-200 transition
                disabled:opacity-50
              "
            >
              {saving ? "Updating…" : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
