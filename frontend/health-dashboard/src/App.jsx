// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Importing pages
import Dashboard from "./pages/Dashboard";
import StudyManager from "./pages/StudyManager";
import ConsistencyTracker from "./pages/ConsistencyTracker";
import Workouts from "./pages/Workouts";
import SimonSays from "./pages/simonGame";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/StudyManager" element={<StudyManager />} />
          <Route path="/ConsistencyTracker" element={<ConsistencyTracker/>} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/game" element={<SimonSays />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
