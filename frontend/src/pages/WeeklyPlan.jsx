import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkoutImg from "../assets/workout.png";

export default function WeeklyPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);



  useEffect(() => {
    async function fetchActivePlan() {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("http://localhost:8000/plans/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setPlan(data);
        }
      } catch (err) {
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchActivePlan();
  }, [navigate]);

  

  const handleGenerate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const downloadPDF = async () => {
    if (!plan) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/plans/${plan.id}/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Ironclad_Week_${plan.start_date}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to download PDF");
      }
    } catch (e) {
      console.error("PDF download failed", e);
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];


  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      
      
      <div className="absolute inset-0">
        <img
          src={WorkoutImg}
          alt="Workout"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/75 to-zinc-950/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-transparent to-zinc-950/70" />
      </div>

      <div className="relative z-10 px-6 md:px-16 py-16 max-w-7xl mx-auto">
        
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16 border-b border-white/10 pb-12">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-[0.25em] mb-6 transition"
            >
              Back to Dashboard
            </button>

            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Weekly <span className="text-zinc-400">Protocol</span>
            </h1>
          </div>

          <div className="flex gap-4">
            
            {plan && !loading && (
              <button
                onClick={downloadPDF}
                className="
                  px-8 py-4
                  rounded-2xl
                  border border-white/20
                  text-white
                  font-bold uppercase tracking-wider
                  hover:bg-white/10 transition
                  flex items-center gap-3
                "
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Export PDF
              </button>
            )}

            
            {!loading && !plan && (
              <button
                onClick={handleGenerate}
                className="
                  px-10 py-4
                  rounded-2xl
                  bg-white text-black
                  font-bold uppercase tracking-wider
                  hover:bg-zinc-200 transition
                "
              >
                Generate New Cycle
              </button>
            )}
          </div>
        </div>

        
        {loading && (
          <div className="h-72 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-xs font-mono tracking-[0.4em] text-zinc-500 uppercase">
              Synchronizing Data
            </p>
          </div>
        )}

        
        {!loading && !plan && (
          <div className="
            flex flex-col items-center justify-center
            h-72
            rounded-3xl
            border border-white/15
            bg-zinc-800/60 backdrop-blur-xl
          ">
            <p className="text-zinc-300 font-bold uppercase tracking-widest mb-6">
              No Active Training Cycle
            </p>
            <button
              onClick={handleGenerate}
              className="text-white font-bold uppercase tracking-wider hover:underline"
            >
              Initialize Protocol Now
            </button>
          </div>
        )}

        
        {plan && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {plan.workouts.map((workout) => {
              const isRest = workout.is_rest_day;
              const isToday = workout.date?.substring(0, 10) === todayDate;

              return (
                <div
                  key={workout.id}
                  className={`
                    rounded-3xl
                    border
                    backdrop-blur-xl
                    p-8
                    flex flex-col justify-between
                    h-72
                    transition-all duration-300
                    ${
                      isToday
                        ? "bg-zinc-800/70 border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.06)]"
                        : "bg-zinc-800/60 border-white/15 hover:border-white/30"
                    }
                    ${isRest ? "opacity-80" : ""}
                  `}
                >
                  
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span
                        className={`
                          text-xs font-bold uppercase tracking-widest
                          px-4 py-2 rounded-full
                          ${
                            isToday
                              ? "bg-white text-black"
                              : "bg-zinc-700/70 text-zinc-300"
                          }
                        `}
                      >
                        {workout.day_of_week}
                      </span>
                    </div>

                    <h3
                      className={`
                        text-2xl font-black uppercase leading-tight mb-3
                        ${isRest ? "text-zinc-400" : "text-white"}
                      `}
                    >
                      {workout.title}
                    </h3>

                    <p className="text-zinc-400 text-sm">
                      {isRest
                        ? "Active recovery. Sleep 8h+."
                        : `${workout.workout_type} Focus`}
                    </p>
                  </div>

                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div>
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                        Duration
                      </span>
                      <p className="text-xl font-bold font-mono text-white mt-1">
                        {workout.estimated_duration_min}m
                      </p>
                    </div>

                    <div
                      className="
                      w-12 h-12
                      rounded-xl
                      bg-zinc-700/60
                      border border-white/10
                      flex items-center justify-center
                      text-zinc-300
                    "
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}