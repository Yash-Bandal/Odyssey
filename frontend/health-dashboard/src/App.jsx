// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Importing pages
import Dashboard from "./pages/Dashboard";
import StudyManager from "./pages/StudyManager";
import ConsistencyTracker from "./pages/ConsistencyTracker";
import Workouts from "./pages/Workouts";
import Leaderboard from "./pages/Leaderboard";

import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import SimonSays from "./pages/simonGame";

// Component to handle landing page redirect if already signed in
const LandingPageWrapper = () => {
  const { isSignedIn } = useAuth();
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <LandingPage />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/StudyManager" element={<StudyManager />} />
          <Route path="/ConsistencyTracker" element={<ConsistencyTracker/>} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/simonGame" element={<simonGame/>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
