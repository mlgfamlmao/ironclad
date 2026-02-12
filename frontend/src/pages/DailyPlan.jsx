import { useLocation, useNavigate } from "react-router-dom";

export default function DailyPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workout } = location.state || {}; 

  
  if (!workout) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <p className="mb-4">Session not found.</p>
        <button onClick={() => navigate("/plan")} className="text-rose-500 hover:underline">Return to Plan</button>
      </div>
    );
  }

  const isStrength = workout.workout_type === "Strength";
  const token = localStorage.getItem("token");

  const handleDownloadZwo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/workouts/${workout.id}/zwo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${workout.date}_${workout.title}.zwo`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Error downloading file");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl">
        
        
        <button 
          onClick={() => navigate(-1)} 
          className="text-zinc-500 hover:text-white text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Week
        </button>

        
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {workout.date} • {workout.day_of_week}
              </span>
              <span className="text-2xl">{isStrength ? "🏋️‍♂️" : "🚴‍♂️"}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-none mb-4">
              {workout.title}
            </h1>

            <div className="flex items-center gap-6 text-zinc-400 font-mono text-sm">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {workout.estimated_duration_min} MINS
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                {workout.modality || "GENERAL"}
              </div>
            </div>
          </div>
        </div>

        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span> Session Protocol
            </h2>
            
            
            {workout.has_zwo && (
              <button 
                onClick={handleDownloadZwo}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download .ZWO
              </button>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {workout.is_rest_day ? (
               <div className="p-8 text-center text-zinc-500">
                 <p className="text-lg">Take today completely off. No intense activity.</p>
                 <p className="text-sm mt-2">Focus on hydration, mobility, and protein intake.</p>
               </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                
                <div className="grid grid-cols-12 bg-zinc-950/50 p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Movement / Interval</div>
                  <div className="col-span-3 text-center">Set/Dur</div>
                  <div className="col-span-3 text-right">Load/Pwr</div>
                </div>

                
                {workout.structure_json?.map((step, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-4 text-sm items-center hover:bg-white/5 transition-colors">
                    
                    
                    <div className="col-span-1 text-zinc-600 font-mono">
                      {idx + 1}
                    </div>
                    
                    
                    <div className="col-span-5 font-bold text-white">
                      {step.section === "Warmup" && <span className="text-yellow-500 text-xs mr-2">WARM</span>}
                      {step.section === "Main Work" && <span className="text-rose-500 text-xs mr-2">MAIN</span>}
                      {step.movement || step.type || "Interval"}
                    </div>

                    
                    <div className="col-span-3 text-center text-zinc-400 font-mono">
                       {step.sets ? `${step.sets} x ${step.reps}` : step.duration}
                       
                       {typeof step.duration === 'number' && ` ${step.duration/60}m`}
                    </div>

                    
                    <div className="col-span-3 text-right font-bold text-white font-mono">
                      {step.weight ? `${step.weight}kg` : step.power ? `${Math.round(step.power * 100)}%` : "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}