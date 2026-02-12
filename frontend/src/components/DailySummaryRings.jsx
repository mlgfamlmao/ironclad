import React from "react";

export default function DailySummaryRings({
  calories = 0,
  calorieTarget = 2000,
  sleepHours = 0,
  sleepTarget = 8,
  workoutCompletedMinutes = 0,
  workoutTargetMinutes = 60,
}) {
  const size = 170;
  const stroke = 14;

  const rings = [
    {
      value: calories,
      max: calorieTarget,
      color: "#e5e7eb", 
      radius: 60,
    },
    {
      value: sleepHours,
      max: sleepTarget,
      color: "#a1a1aa", 
      radius: 42,
    },
    {
      value: workoutCompletedMinutes,
      max: workoutTargetMinutes,
      color: "#52525b", 
      radius: 24,
    },
  ];

  return (
    <div className="mt-16 flex justify-center">

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl px-8 py-8 flex items-center gap-12">

        
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size}>

            {rings.map((ring, i) => {
              const safeMax = ring.max || 1;
              const percentage = Math.min(
                (ring.value / safeMax) * 100,
                100
              );

              const circumference = ring.radius * 2 * Math.PI;
              const offset =
                circumference - (percentage / 100) * circumference;

              return (
                <g key={i}>
                  
                  <circle
                    stroke="rgba(255,255,255,0.07)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={ring.radius}
                    cx={size / 2}
                    cy={size / 2}
                  />

                  
                  <circle
                    stroke={ring.color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    r={ring.radius}
                    cx={size / 2}
                    cy={size / 2}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{
                      transition: "stroke-dashoffset 0.8s ease",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold text-white">
              
            </span>
            <span className="text-[11px] text-zinc-400 uppercase tracking-widest">
              
            </span>
          </div>
        </div>

        
        <div className="space-y-4 text-sm">

          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#e5e7eb]" />
            <span className="text-zinc-300">
              Calories — {calories} / {calorieTarget} kcal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#a1a1aa]" />
            <span className="text-zinc-300">
              Sleep — {sleepHours} / {sleepTarget} hrs
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#52525b]" />
            <span className="text-zinc-300">
              Workout — {workoutCompletedMinutes} / {workoutTargetMinutes} min
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
