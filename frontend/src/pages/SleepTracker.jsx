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



const InputGroup = ({ label, value, onChange, step = 0.1 }) => (
  <div>
    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wider">
      {label}
    </label>
    <input
      type="number"
      step={step}
      value={value}
      onChange={onChange}
      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-white outline-none font-mono text-lg focus:border-white/40"
      placeholder="0"
    />
  </div>
);


export default function SleepTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    total_hours: "",
    rem_hours: "",
    deep_hours: "",
    core_hours: "",
    awake_hours: "",
  });

  

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("en-CA"));
    }
    return days;
  };

  const weekDates = getLast7Days();
  const todayStr = new Date().toLocaleDateString("en-CA");

  

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await fetch("http://localhost:8000/sleep/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);


  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:8000/sleep/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: selectedDate,
        total_hours: Number(formData.total_hours) || 0,
        rem_hours: Number(formData.rem_hours) || null,
        deep_hours: Number(formData.deep_hours) || null,
        core_hours: Number(formData.core_hours) || null,
        awake_hours: Number(formData.awake_hours) || null,
      }),
    });

    setSelectedDate(null);
    fetchData();
  };

  const openLogModal = (date) => {
    const existing = history.find((h) => h.date === date) || {};

    setFormData({
      total_hours: existing.total_hours || "",
      rem_hours: existing.rem_hours || "",
      deep_hours: existing.deep_hours || "",
      core_hours: existing.core_hours || "",
      awake_hours: existing.awake_hours || "",
    });

    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }



  const graphData = weekDates.map((date) => {
    const log = history.find((h) => h.date === date) || {};
    return {
      date,
      total_hours: log.total_hours || 0,
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
        <img src={LandingImg} alt="Sleep" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/95 via-zinc-900/70 to-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-zinc-900/60" />
      </div>

      <div className="relative z-10 px-6 md:px-12 py-10 max-w-7xl mx-auto">

      
        <div className="mb-10 border-b border-zinc-800 pb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-2 transition"
          >
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">
            Sleep <span className="text-zinc-400">Recovery</span>
          </h1>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {weekDates.map((date) => {
            const log = history.find((h) => h.date === date);
            const isToday = date === todayStr;

            return (
              <div
                key={date}
                onClick={() => openLogModal(date)}
                className={`
                  rounded-3xl border backdrop-blur-xl p-6 cursor-pointer
                  ${isToday
                    ? "bg-zinc-900/80 border-white/40"
                    : "bg-zinc-900/60 border-zinc-800"}
                `}
              >
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase font-bold">
                    {log ? "Edit Log" : "Log Sleep"}
                  </span>
                </div>

                {log ? (
                  <div>
                    <p className="text-4xl font-black text-white mb-2">
                      {log.total_hours}
                    </p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Hours Slept
                    </p>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-600 text-xs font-bold uppercase">
                      No Data
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

       
        <div className="border-t border-zinc-800 pt-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-8">
            Weekly Sleep Trend
          </h2>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8">
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
                  <Line dataKey="total_hours" {...chartLine} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      
      {selectedDate && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/80 border border-zinc-700 p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-2xl font-black uppercase mb-6">
              Log Sleep
              <span className="block text-sm text-zinc-400 mt-1">
                {selectedDate}
              </span>
            </h2>

            <div className="space-y-4">
              <InputGroup label="Total Hours" value={formData.total_hours} onChange={e => setFormData({ ...formData, total_hours: e.target.value })} />
              <InputGroup label="REM Hours" value={formData.rem_hours} onChange={e => setFormData({ ...formData, rem_hours: e.target.value })} />
              <InputGroup label="Deep Hours" value={formData.deep_hours} onChange={e => setFormData({ ...formData, deep_hours: e.target.value })} />
              <InputGroup label="Core Hours" value={formData.core_hours} onChange={e => setFormData({ ...formData, core_hours: e.target.value })} />
              <InputGroup label="Awake Hours" value={formData.awake_hours} onChange={e => setFormData({ ...formData, awake_hours: e.target.value })} />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setSelectedDate(null)}
                className="flex-1 py-4 text-zinc-400 hover:text-white font-bold uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
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
