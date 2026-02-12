import { useState, useEffect, useRef } from "react";

export default function SessionExecute({ workout, onClose, onComplete }) {
  const initialTime = workout.actual_duration || 0;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timeRef = useRef(initialTime);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  const targetMinutes = workout.estimated_duration_min || 0;
  const targetSeconds = targetMinutes * 60;
  const progressPercent =
    targetSeconds > 0
      ? Math.min((time / targetSeconds) * 100, 100)
      : 0;

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleFinish = async () => {
    setIsRunning(false);
    setIsSaving(true);

    const token = localStorage.getItem("token");
    const totalSeconds = timeRef.current;

    try {
      const res = await fetch(
        `http://localhost:8000/workouts/${workout.id}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            actual_duration: totalSeconds,
            rpe: 7,
            notes: "Logged via Ironclad Command",
          }),
        }
      );

      if (res.ok) {
        if (onComplete) onComplete();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-10 shadow-2xl">

        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Session Active
            </p>
            <h1 className="text-2xl font-black text-white">
              {workout.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition"
          >
            ✕
          </button>
        </div>

       
        <div className="relative w-72 h-72 mx-auto mb-12">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-mono text-white font-bold">
              {formatTime(time)}
            </span>
            <span className="text-sm uppercase tracking-widest text-zinc-400 mt-2">
              {Math.floor(time / 60)} / {targetMinutes} min
            </span>
          </div>
        </div>

        
        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="flex-1 bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition"
            >
              Start
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="flex-1 border border-white/20 py-4 rounded-xl font-bold hover:bg-white/10 transition"
            >
              Pause
            </button>
          )}

          <button
            onClick={handleFinish}
            disabled={isSaving}
            className="flex-1 border border-white/20 py-4 rounded-xl font-bold text-zinc-400 hover:text-white hover:border-white/40 transition"
          >
            {isSaving ? "Saving..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
