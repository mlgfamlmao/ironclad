import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

 
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Welcome to Ironclad AI. I can assist with workouts, training strategy, nutrition targets, recovery, and performance optimization. Ask anything.",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef(null);
  const location = useLocation();

  const publicRoutes = ["/", "/login", "/signup", "/verify-email"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (isPublicRoute) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg.content,
          history: [...messages, userMsg],
        }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "model", content: data.response },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "model", content: "Signal degraded. Retry recommended." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

      {isOpen && (
        <div
          className="
            pointer-events-auto
            w-[360px] md:w-[460px] h-[620px] mb-5
            rounded-[28px] overflow-hidden
            bg-zinc-900/85 backdrop-blur-xl
            border border-white/15
            shadow-[0_0_60px_rgba(255,255,255,0.08)]
            flex flex-col
          "
        >
          <div className="px-5 py-4 border-b border-white/10 bg-zinc-950/80">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  IRONCLAD
                </p>
                <p className="text-sm font-black uppercase tracking-widest text-white">
                  AI ASSISTANT
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-zinc-900/60"
          >
            

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[85%] text-sm px-4 py-3 rounded-2xl
                    ${msg.role === "user"
                      ? "bg-white text-black rounded-br-md"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-bl-md"}
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="text-xs text-zinc-500 italic ml-1 animate-pulse">
                Processing request…
              </div>
            )}
          </div>

          <div className="px-4 py-4 border-t border-white/10 bg-zinc-950/80 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="
                flex-1 bg-zinc-900 border border-zinc-800 rounded-xl
                px-4 py-3 text-sm text-white outline-none
                focus:border-white/40
              "
            />
            <button
              onClick={handleSend}
              className="px-5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            pointer-events-auto
            h-20 w-20 rounded-2xl
            bg-zinc-900 border border-white/25
            flex flex-col items-center justify-center
            shadow-[0_0_30px_rgba(255,255,255,0.12)]
            hover:bg-zinc-800 transition
          "
        >
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            AI
          </span>
          <span className="text-lg font-black text-white tracking-widest">
            CHAT
          </span>
        </button>
      )}
    </div>
  );
}
