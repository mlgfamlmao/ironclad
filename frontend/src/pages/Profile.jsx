import { useState } from "react";
import { useNavigate } from "react-router-dom";



const InputGroup = ({ label, value, onChange, type = "text", suffix }) => (
  <div>
    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 tracking-wider">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-white outline-none font-mono text-lg focus:border-white/40 transition"
      />
      {suffix && (
        <span className="absolute right-4 top-4 text-zinc-500 text-sm">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const SelectGroup = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 tracking-wider">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-white outline-none font-mono text-lg focus:border-white/40 transition"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);



export default function ProfileSetup() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    goal: "",
    bodyweight: "",
    height: "",
    primary_endurance: "",
    weekly_hours: "",
    preferred_rest_day: "Sunday",
    training_time_pref: "AM",
    squat_max: "",
    deadlift_max: "",
    bench_max: "",
    press_max: "",
    endurance_metric_type: "FTP",
    endurance_metric_value: "",
    equipment_access: "Full Gym",
    cadence_pref: "",
    injury_history: "",
  });

  const update = (k, v) => setData({ ...data, [k]: v });

  async function submit() {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          bodyweight: Number(data.bodyweight),
          height: Number(data.height),
          weekly_hours: Number(data.weekly_hours),
          squat_max: Number(data.squat_max),
          deadlift_max: Number(data.deadlift_max),
          bench_max: Number(data.bench_max),
          press_max: Number(data.press_max),
          endurance_metric_value: Number(data.endurance_metric_value),
          is_complete: true,
        }),
      });

      if (!res.ok) throw new Error();

      navigate("/dashboard");
    } catch {
      alert("Profile initialization failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-900/60" />

      <div className="relative z-10 px-6 md:px-12 py-14 max-w-5xl mx-auto space-y-12">

        
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Operator <span className="text-zinc-500">Initialization</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Establish baseline parameters.
          </p>
        </div>

        
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8">
          <InputGroup
            label="Primary Goal"
            value={data.goal}
            onChange={(e) => update("goal", e.target.value)}
          />
        </section>

        
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 grid md:grid-cols-2 gap-6">
          <InputGroup label="Bodyweight" type="number" suffix="kg"
            value={data.bodyweight}
            onChange={(e) => update("bodyweight", e.target.value)} />

          <InputGroup label="Height" type="number" suffix="cm"
            value={data.height}
            onChange={(e) => update("height", e.target.value)} />
        </section>

        
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 grid md:grid-cols-4 gap-6">
          <InputGroup label="Squat" type="number" suffix="kg"
            value={data.squat_max}
            onChange={(e) => update("squat_max", e.target.value)} />

          <InputGroup label="Deadlift" type="number" suffix="kg"
            value={data.deadlift_max}
            onChange={(e) => update("deadlift_max", e.target.value)} />

          <InputGroup label="Bench" type="number" suffix="kg"
            value={data.bench_max}
            onChange={(e) => update("bench_max", e.target.value)} />

          <InputGroup label="Press" type="number" suffix="kg"
            value={data.press_max}
            onChange={(e) => update("press_max", e.target.value)} />
        </section>

        
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 grid md:grid-cols-2 gap-6">
          <InputGroup
            label="Primary Modality"
            value={data.primary_endurance}
            onChange={(e) => update("primary_endurance", e.target.value)}
          />

          <SelectGroup
            label="Metric Type"
            value={data.endurance_metric_type}
            onChange={(e) => update("endurance_metric_type", e.target.value)}
            options={["FTP", "5K Run", "2K Row", "VO2 Max"]}
          />

          <InputGroup
            label="Metric Value"
            type="number"
            value={data.endurance_metric_value}
            onChange={(e) => update("endurance_metric_value", e.target.value)}
          />
        </section>

       
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 grid md:grid-cols-2 gap-6">
          <SelectGroup
            label="Preferred Rest Day"
            value={data.preferred_rest_day}
            onChange={(e) => update("preferred_rest_day", e.target.value)}
            options={["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]}
          />

          <InputGroup
            label="Weekly Training Hours"
            type="number"
            suffix="hrs"
            value={data.weekly_hours}
            onChange={(e) => update("weekly_hours", e.target.value)}
          />

          <SelectGroup
            label="Equipment Access"
            value={data.equipment_access}
            onChange={(e) => update("equipment_access", e.target.value)}
            options={["Full Gym","Home Gym","Dumbbells","Bodyweight"]}
          />

          <InputGroup
            label="Preferred Cadence"
            value={data.cadence_pref}
            onChange={(e) => update("cadence_pref", e.target.value)}
          />

          <div className="md:col-span-2">
            <InputGroup
              label="Injury History"
              value={data.injury_history}
              onChange={(e) => update("injury_history", e.target.value)}
            />
          </div>
        </section>

        
        <button
          onClick={submit}
          disabled={saving}
          className="w-full py-5 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-lg hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {saving ? "Initializing…" : "Complete Setup"}
        </button>

      </div>
    </div>
  );
}
