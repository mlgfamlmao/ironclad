import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import LandingImg from "../assets/Landing.png";



const MacroBar = ({ label, actual, target, unit = "g" }) => {
  const safeActual = Number(actual) || 0;
  const safeTarget = Number(target) || 1;
  const pct = Math.min((safeActual / safeTarget) * 100, 100);


  const barColor = label === "Calories" ? "bg-white" : "bg-zinc-200";

  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="text-zinc-400 uppercase tracking-wider">{label}</span>
        <span className="text-white font-mono">
          {safeActual} / {safeTarget} {unit}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, step = 1 }) => (
  <div>
    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wider">
      {label}
    </label>
    <input
      type="number"
      step={step}
      value={value}
      onChange={onChange}
      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-white outline-none font-mono text-lg focus:border-white/40 transition-colors"
      placeholder="0"
    />
  </div>
);



export default function Nutrition() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [weeklyNutrition, setWeeklyNutrition] = useState([]);
  const [dailyLogs, setDailyLogs] = useState({});
  const [planId, setPlanId] = useState(null); 

  const [selectedDay, setSelectedDay] = useState(null);
  
  const [editForm, setEditForm] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    water: 0,
  });

  

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
     
      const planRes = await fetch("http://localhost:8000/plans/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!planRes.ok) throw new Error();
      const planData = await planRes.json();
      
      setPlanId(planData.id); 

      
      const nutRes = await fetch(
        `http://localhost:8000/plans/${planData.id}/nutrition-plan`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (nutRes.ok) setWeeklyNutrition(await nutRes.json());


      const logsRes = await fetch(
        "http://localhost:8000/nutrition/logs/week",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (logsRes.ok) {
        const logs = await logsRes.json();
        const map = {};
        logs.forEach((log) => {
          map[log.date.substring(0, 10)] = log;
        });
        setDailyLogs(map);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);



  const downloadNutritionPDF = async () => {
    if (!planId) return;
    const token = localStorage.getItem("token");
    
    try {
        const res = await fetch(`http://localhost:8000/plans/${planId}/export/nutrition-pdf`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if(res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ironclad_Nutrition_Plan.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    } catch (e) {
        console.error("PDF download failed", e);
    }
  };

  

  const saveLog = async () => {
    const token = localStorage.getItem("token");
    if (!selectedDay) return;

    const date = selectedDay.day_context.date.substring(0, 10);

    await fetch("http://localhost:8000/nutrition/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date,
        calories: Number(editForm.calories) || 0,
        protein: Number(editForm.protein) || 0,
        carbs: Number(editForm.carbs) || 0,
        fats: Number(editForm.fats) || 0,
        water: Number(editForm.water) || 0,
      }),
    });

    setSelectedDay(null);
    await fetchData();
  };

  const openLogModal = (day) => {
    const dateStr = day.day_context.date.substring(0, 10);
    const existing = dailyLogs[dateStr] || {};

    setEditForm({
      calories: existing.calories_consumed || 0,
      protein: existing.protein_consumed || 0,
      carbs: existing.carbs_consumed || 0,
      fats: existing.fats_consumed || 0,
      water: existing.water_liters || 0,
    });

    setSelectedDay(day);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

 

  const graphData = weeklyNutrition.map((day) => {
    const dateStr = day.day_context.date.substring(0, 10);
    const log = dailyLogs[dateStr] || {};

    return {
      date: dateStr,
      calories_consumed: log.calories_consumed || 0,
      protein_consumed: log.protein_consumed || 0,
      carbs_consumed: log.carbs_consumed || 0,
      fats_consumed: log.fats_consumed || 0,
      water_liters: log.water_liters || 0,
    };
  });

  const chartLine = {
    stroke: "#e4e4e7",
    strokeWidth: 2,
    dot: false,
  };



  return (
    <div className="relative min-h-screen text-white">

      
      <div className="absolute inset-0">
        <img
          src={LandingImg}
          alt="Nutrition"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/95 via-zinc-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-zinc-900/60" />
      </div>

      <div className="relative z-10 px-6 md:px-12 py-10">

       
        <div className="mb-10 border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 text-xs font-bold uppercase hover:text-white transition mb-3"
            >
              Back to Command
            </button>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Fueling Logistics
            </h1>
          </div>

         
          <button
            onClick={downloadNutritionPDF}
            className="
                px-6 py-3
                rounded-xl
                border border-white/20
                text-white text-sm
                font-bold uppercase tracking-wider
                hover:bg-white/10 transition
                flex items-center gap-2
            "
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Export Plan
          </button>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {weeklyNutrition.map((day, idx) => {
            const dateStr = day.day_context.date.substring(0, 10);
            const log = dailyLogs[dateStr] || {};

            return (
              <div
                key={idx}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-6"
              >
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase">
                    {new Date(dateStr).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </span>
                  <button
                    onClick={() => openLogModal(day)}
                    className="text-xs bg-zinc-800 hover:bg-white hover:text-black px-3 py-1 rounded-full font-bold uppercase tracking-wider transition"
                  >
                    {log.protein_consumed ? "Edit Log" : "Log Intake"}
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  
                  <MacroBar label="Calories" actual={log.calories_consumed} target={day.targets.calories} unit="kcal" />
                  
                  <MacroBar label="Protein" actual={log.protein_consumed} target={day.targets.protein} />
                  <MacroBar label="Carbohydrates" actual={log.carbs_consumed} target={day.targets.carbs} />
                  <MacroBar label="Fats" actual={log.fats_consumed} target={day.targets.fats} />
                </div>

                <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between">
                  <span>
                    Focus{" "}
                    <span className="text-white font-bold">
                      {day.day_context.type}
                    </span>
                  </span>
                  <span>
                    Water {log.water_liters || 0} /{" "}
                    {day.targets.hydration_liters} L
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            ["Calories (kcal)", "calories_consumed"],
            ["Protein (g)", "protein_consumed"],
            ["Carbs (g)", "carbs_consumed"],
            ["Fats (g)", "fats_consumed"],
            ["Water (L)", "water_liters"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8"
            >
              <p className="text-xs uppercase tracking-widest text-zinc-400 mb-6">
                {label} — this week
              </p>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <XAxis hide dataKey="date" />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e4e4e7",
                      }}
                    />
                    <Line dataKey={key} {...chartLine} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      {selectedDay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/80 border border-zinc-700 p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-2xl font-black uppercase mb-6">
              Log Intake
              <span className="block text-sm text-zinc-400 mt-1">
                {selectedDay.day_context.date.substring(0, 10)}
              </span>
            </h2>

            <div className="space-y-4">
              <InputGroup label="Calories (kcal)" value={editForm.calories} onChange={e => setEditForm({ ...editForm, calories: e.target.value })} />
              <InputGroup label="Protein (g)" value={editForm.protein} onChange={e => setEditForm({ ...editForm, protein: e.target.value })} />
              <InputGroup label="Carbohydrates (g)" value={editForm.carbs} onChange={e => setEditForm({ ...editForm, carbs: e.target.value })} />
              <InputGroup label="Fats (g)" value={editForm.fats} onChange={e => setEditForm({ ...editForm, fats: e.target.value })} />
              <InputGroup label="Water (L)" step="0.1" value={editForm.water} onChange={e => setEditForm({ ...editForm, water: e.target.value })} />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setSelectedDay(null)}
                className="flex-1 py-4 text-zinc-400 hover:text-white font-bold uppercase"
              >
                Cancel
              </button>
              <button
                onClick={saveLog}
                className="flex-1 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 uppercase"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}