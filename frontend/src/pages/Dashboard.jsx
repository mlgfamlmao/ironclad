import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LandingImg from "../assets/Landing.png";
import dumbbell from "../assets/dumbbell.png";

import NutritionSummary from "../components/NutritionSummary";
import SessionExecute from "../components/SessionExecute";
import SleepCard from "../components/SleepCard";
import DailySummaryRings from "../components/DailySummaryRings";

export default function DashboardRevamp() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [planStatus, setPlanStatus] = useState("loading"); 
  const [todaysLog, setTodaysLog] = useState(null);
  const [todaysTargets, setTodaysTargets] = useState(null);
  const [sleepData, setSleepData] = useState(null);

  const [isSessionMode, setIsSessionMode] = useState(false);

  

  const formatDuration = (seconds) => {
    if (!seconds) return "0m 0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

 

  const fetchLatestWorkout = async () => {
    const token = localStorage.getItem("token");
    const todayStr = getLocalToday();

    try {
      const planRes = await fetch("http://localhost:8000/plans/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (planRes.ok) {
        const plan = await planRes.json();
        const workoutToday = plan.workouts.find(
          (w) => w.date === todayStr || w.date.substring(0, 10) === todayStr
        );
       
        setTodayWorkout(workoutToday || null);
      }
    } catch (e) {
      console.error("Failed to refresh workout", e);
    }
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_date: getLocalToday(),
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to generate plan");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };



  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login", { replace: true });

      const todayStr = getLocalToday();

      try {
        const userRes = await fetch("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();

        if (!userData.profile_complete) {
          navigate("/profile-setup", { replace: true });
          return;
        }
        setUser(userData);

        const planRes = await fetch("http://localhost:8000/plans/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!planRes.ok) {
          setPlanStatus("none");
        } else {
          const plan = await planRes.json();
          
          if (plan.end_date < todayStr) {
             setPlanStatus("expired");
             setTodayWorkout(null);
          } else {
             setPlanStatus("active");
             
             const workoutToday = plan.workouts.find(
                (w) => w.date === todayStr || w.date.substring(0, 10) === todayStr
             );
             setTodayWorkout(workoutToday || null);

             const nutRes = await fetch(
                `http://localhost:8000/plans/${plan.id}/nutrition-plan`,
                { headers: { Authorization: `Bearer ${token}` } }
             );
             if (nutRes.ok) {
                const week = await nutRes.json();
                const todayNut = week.find(
                  (d) => d.day_context.date === todayStr || d.day_context.date.substring(0, 10) === todayStr
                );
                setTodaysTargets(todayNut?.targets || null);
             }
          }
        }

        const logsRes = await fetch(
          "http://localhost:8000/nutrition/logs/week",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (logsRes.ok) {
          const logs = await logsRes.json();
          const todayLog = logs.find((l) => l.date === todayStr || l.date.substring(0, 10) === todayStr);
          
          setTodaysLog(todayLog || { 
              protein_consumed: 0, 
              carbs_consumed: 0, 
              fats_consumed: 0, 
              calories_consumed: 0 
          });
        }

        const sleepRes = await fetch("http://localhost:8000/sleep/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sleepRes.ok) {
          setSleepData(await sleepRes.json());
        }

      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  

  const workoutCompletedMinutes = 
    todayWorkout?.completed && 
    todayWorkout?.actual_duration !== null && 
    todayWorkout?.actual_duration !== undefined
      ? Math.floor(Number(todayWorkout.actual_duration) / 60) 
      : 0;
  
  const workoutTargetMinutes = 
    Number(todayWorkout?.estimated_duration_min) || 60;

  const dateDisplay = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });


  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white pb-20">

      
      <div className="absolute inset-0">
        <img src={LandingImg} alt="Training" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-zinc-900/50" />
      </div>

      
      {isSessionMode && todayWorkout && (
        <SessionExecute
          workout={todayWorkout}
          onClose={() => setIsSessionMode(false)}
          onComplete={fetchLatestWorkout}
        />
      )}

      
      <div className="relative z-10 flex justify-between items-start px-6 md:px-20 pt-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center">
            <img src={dumbbell} alt="" className="w-7 h-7 invert" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-zinc-400">Dashboard</p>
            <p className="text-xs font-mono text-zinc-600">{dateDisplay}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-zinc-900/60 backdrop-blur-xl px-6 py-4 text-right">
          <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
          <button onClick={() => navigate("/edit-profile")} className="mt-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition">
            Edit Profile
          </button>
        </div>
      </div>

      
      <div className="relative z-10 px-6 md:px-20 py-14 grid grid-cols-1 xl:grid-cols-12 gap-10">

        
        <div className="xl:col-span-5">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-8 min-h-[300px] flex flex-col justify-between">
            
            
            {planStatus === "expired" || planStatus === "none" ? (
                
                <div className="flex flex-col h-full justify-center items-start">
                    <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2 font-bold">
    {planStatus === "expired" ? "Weekly Protocol Ended" : "Initialization Required"}
</p>

                    <h1 className="text-3xl font-black mb-4 leading-tight">
                        Protocol <br/><span className="text-zinc-500">Unassigned</span>
                    </h1>
                    <button 
                        onClick={handleGenerate}
                        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition w-full uppercase tracking-wider"
                    >
                        Generate Next Week
                    </button>
                </div>
            ) : (
                
                <>
                    <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Today’s Session</p>
                    <h1 className="text-2xl font-black mb-4">
                        {todayWorkout ? todayWorkout.title : "Rest Day"}
                    </h1>
                    <p className="text-zinc-300 max-w-sm leading-relaxed">
                        {todayWorkout?.completed
                        ? `Session completed. ${todayWorkout.notes || "Good work."}`
                        : todayWorkout?.workout_type === "Rest"
                        ? "Active recovery protocol initiated."
                        : "Focus on maintaining intensity throughout."}
                    </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4 items-center">
                    {todayWorkout && !todayWorkout.is_rest_day && (
                        <div className="mr-6">
                        <p className="text-xs uppercase text-zinc-500 mb-1">
                            {todayWorkout.completed ? "Actual Time" : "Target Time"}
                        </p>
                        <p className="font-mono text-lg">
                            {todayWorkout.completed
                            ? formatDuration(todayWorkout.actual_duration)
                            : `${todayWorkout.estimated_duration_min} min`}
                        </p>
                        </div>
                    )}

                    
                    {todayWorkout && !todayWorkout.completed && !todayWorkout.is_rest_day && (
                        <button
                        onClick={() => setIsSessionMode(true)}
                        className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition"
                        >
                        Start Session
                        </button>
                    )}

                    
                    <button
                        onClick={() => navigate("/plan")}
                        className="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 transition"
                    >
                        View Week
                    </button>
                    </div>
                </>
            )}
          </div>
        </div>

        
        <div className="xl:col-span-7">
          <div
            onClick={() => navigate("/nutrition")}
            className="h-full rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-8 cursor-pointer hover:border-white/40 transition"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-6">Daily Nutrition Targets</p>
            <NutritionSummary
              caloriesActual={todaysLog?.calories_consumed || 0}
              caloriesTarget={todaysTargets?.calories || 2000}
              proteinActual={todaysLog?.protein_consumed || 0}
              proteinTarget={todaysTargets?.protein || 180}
              carbsActual={todaysLog?.carbs_consumed || 0}
              carbsTarget={todaysTargets?.carbs || 200}
              fatsActual={todaysLog?.fats_consumed || 0}
              fatsTarget={todaysTargets?.fats || 60}
            />
          </div>
        </div>

        
        <div className="xl:col-span-12">
          <SleepCard
            sleepData={sleepData}
            onClick={() => navigate("/sleep")}
          />
        </div>

      </div>

     
      <div className="relative z-10 px-6 md:px-20 pb-16">
        <DailySummaryRings
          calories={todaysLog?.calories_consumed || 0}
          calorieTarget={todaysTargets?.calories || 2000}
          sleepHours={sleepData?.total_hours || 0}
          sleepTarget={8}
          workoutCompletedMinutes={workoutCompletedMinutes}
          workoutTargetMinutes={workoutTargetMinutes}
        />
      </div>

    </div>
  );
}