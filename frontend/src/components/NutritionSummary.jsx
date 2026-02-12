import React from "react";

export default function NutritionSummary({
 
  caloriesActual = 0,
  caloriesTarget = 2000,
  
  proteinActual = 0,
  proteinTarget = 180,
  carbsActual = 0,
  carbsTarget = 200,
  fatsActual = 0,
  fatsTarget = 60,
}) {
  
  const safeP = proteinTarget || 1;
  const safeC = carbsTarget || 1;
  const safeF = fatsTarget || 1;

 
  const pPct = Math.min((proteinActual / safeP) * 100, 100);
  const cPct = Math.min((carbsActual / safeC) * 100, 100);
  const fPct = Math.min((fatsActual / safeF) * 100, 100);

  return (
    <div className="w-full h-full flex flex-col justify-center gap-5">

    
      <div className="flex justify-between items-end mb-1">
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Energy
          </p>
          <p className="text-white font-black text-lg">
            {caloriesActual}
            <span className="text-zinc-500 text-xs font-normal ml-1">
              / {caloriesTarget} kcal
            </span>
          </p>
        </div>
      </div>

  
      <div>
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-zinc-300 uppercase tracking-widest">
            Protein
          </span>
          <span className="text-zinc-400 font-mono">
            {proteinActual} / {proteinTarget} g
          </span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-200 transition-all duration-700 ease-out"
            style={{ width: `${pPct}%` }}
          />
        </div>
      </div>

     
      <div>
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-zinc-300 uppercase tracking-widest">
            Carbohydrates
          </span>
          <span className="text-zinc-400 font-mono">
            {carbsActual} / {carbsTarget} g
          </span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${cPct}%` }}
          />
        </div>
      </div>

      
      <div>
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-zinc-400 uppercase tracking-widest">
            Fats
          </span>
          <span className="text-zinc-400 font-mono">
            {fatsActual} / {fatsTarget} g
          </span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-500 transition-all duration-700 ease-out"
            style={{ width: `${fPct}%` }}
          />
        </div>
      </div>

    </div>
  );
}