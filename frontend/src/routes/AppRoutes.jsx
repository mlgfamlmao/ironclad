import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import ProfileSetup from "../pages/ProfileSetup";
import Dashboard from "../pages/Dashboard";
import WeeklyPlan from "../pages/WeeklyPlan";
import DailyPlan from "../pages/DailyPlan";
import Nutrition from "../pages/Nutrition";
import EditProfile from "../pages/EditProfile";
import SleepTracker from "../pages/SleepTracker";
import Profile from "../pages/Profile";

import ChatAssistant from "../components/ChatAssistant";
import ProtectedRoute from "./ProtectedRoute";
import ProfileGuard from "./ProfileGuard";

export default function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <>
      
      {token && <ChatAssistant />}

      <Routes>
        
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <Dashboard />
              </ProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <EditProfile />
              </ProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <WeeklyPlan />
              </ProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan/:id"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <DailyPlan />
              </ProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <Nutrition />
              </ProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sleep"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <SleepTracker />
              </ProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
