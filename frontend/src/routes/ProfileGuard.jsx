import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileGuard({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    async function checkProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const user = await res.json();
          if (user.profile_complete) {
            setStatus("complete");
          } else {
            setStatus("incomplete");
            
            if (window.location.pathname !== "/profile-setup") {
               navigate("/profile-setup", { replace: true });
            }
          }
        } else {
          
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Profile check failed", err);
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    }

    checkProfile();
  }, [navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  
  if (window.location.pathname === "/profile-setup") {
      return children;
  }

  
  return status === "complete" ? children : null;
}