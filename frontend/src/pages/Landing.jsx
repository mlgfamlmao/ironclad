import { useNavigate } from "react-router-dom";
import LandingImg from "../assets/Landing.png";
import dumbbell from "../assets/dumbbell.png";

export default function LandingRevamp() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-900">


      <div className="absolute inset-0">
        <img
          src={LandingImg}
          alt="Athlete"
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-800/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-zinc-900/40" />
      </div>

    
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="ml-6 md:ml-24 max-w-2xl w-full">


          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-12 md:p-16">

   
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-white/10">
              <img
                src={dumbbell}
                alt="Logo"
                className="w-9 h-9 brightness-0 invert"
              />
            </div>

            
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-8">
              Train Like <br />
              <span className="text-zinc-300">Nothing Else Matters</span>
            </h1>

            <p className="text-zinc-400 text-xl leading-relaxed mb-14 max-w-xl">
              Strength and endurance programming designed for athletes who
              demand structure, intent, and results.
            </p>

           
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => navigate("/signup")}
                className="px-10 py-5 rounded-2xl bg-white text-black font-bold text-lg transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-10 py-5 rounded-2xl border border-white/15 text-white font-semibold text-lg transition-all hover:bg-white/5"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-1 bg-zinc-700/60 rounded-full" />
    </div>
  );
}
