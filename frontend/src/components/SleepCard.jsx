import React from "react";

export default function SleepCard({ sleepData, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        w-full rounded-3xl border border-zinc-800
        bg-zinc-900/60 backdrop-blur-xl
        p-8 cursor-pointer
        transition-colors hover:border-white/40
      "
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

        
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Sleep Recovery
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white">
              {sleepData ? sleepData.total_hours : "--"}
            </h2>
            <span className="text-lg text-zinc-500 font-medium">hrs</span>
          </div>
        </div>

        
        {sleepData ? (
          <div className="flex gap-3 flex-wrap md:justify-end">
            <div className="px-4 py-2 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                REM
              </span>
              <span className="text-sm font-mono text-white">
                {sleepData.rem_hours ?? "-"}h
              </span>
            </div>

            <div className="px-4 py-2 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Deep
              </span>
              <span className="text-sm font-mono text-white">
                {sleepData.deep_hours ?? "-"}h
              </span>
            </div>

            <div className="px-4 py-2 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                Core
              </span>
              <span className="text-sm font-mono text-white">
                {sleepData.core_hours ?? "-"}h
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-zinc-500 text-sm font-medium uppercase tracking-wider">
            Log last night’s sleep
          </div>
        )}
      </div>
    </div>
  );
}
