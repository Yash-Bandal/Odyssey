// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import Layout from "./components/Layout";

// Importing pages
import Dashboard from "./pages/Dashboard";
import StudyManager from "./pages/StudyManager";
import ConsistencyTracker from "./pages/ConsistencyTracker";
import Workouts from "./pages/Workouts";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import SimonSays from "./pages/simonGame";
import Classroom from "./pages/Classroom";
import Leaderboard from "./components/Classroom/Leaderboard";
import QuizList from "./components/Classroom/QuizList";
import QuizCreator from "./components/Classroom/QuizCreator";
import QuizTaker from "./components/Classroom/QuizTaker";
import QuizSubmissions from "./components/Classroom/QuizSubmissions";
import DiscussionList from "./components/Classroom/DiscussionList";
import ThreadView from "./components/Classroom/ThreadView";
import MembersList from "./components/Classroom/MembersList";

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
        {/* Landing page - public route */}
        <Route path="/" element={<LandingPageWrapper />} />
        
        {/* Public routes for authentication */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route
          element={
            <>
              <SignedIn>
                <Layout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/StudyManager" element={<StudyManager />} />
          <Route path="/ConsistencyTracker" element={<ConsistencyTracker/>} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/simonGame" element={<SimonSays />} />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/classroom/group/:groupId/members" element={<MembersList />} />
          <Route path="/classroom/group/:groupId/leaderboard" element={<Leaderboard />} />
          <Route path="/classroom/group/:groupId/quizzes" element={<QuizList />} />
          <Route path="/classroom/group/:groupId/quizzes/create" element={<QuizCreator />} />
          <Route path="/classroom/quiz/:quizId/take" element={<QuizTaker />} />
          <Route path="/classroom/quiz/:quizId/submissions" element={<QuizSubmissions />} />
          <Route path="/classroom/group/:groupId/discussions" element={<DiscussionList />} />
          <Route path="/classroom/discussion/:threadId" element={<ThreadView />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
