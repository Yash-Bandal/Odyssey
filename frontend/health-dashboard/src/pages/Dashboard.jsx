
import React from 'react';
import { Target,Globe, Code, Calendar, Github, BookOpen, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming React Router for navigation

// Mock GoalsCard component with enhanced UI (replace with your actual GoalsCard)
const MockGoalsCard = ({ dailyGoal, weeklyGoal, monthlyGoal, dailyStudyTime, weeklyStudyTime, monthlyStudyTime }) => {
  const formatHours = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Daily Goal Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Daily Goal</h3>
          <Target size={24} className="text-blue-500 animate-pulse" />
        </div>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {formatHours(dailyStudyTime)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Goal: {dailyGoal}h
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgressPercentage(dailyStudyTime, dailyGoal)}%` }}
          />
        </div>
      </div>

      {/* Weekly Goal Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in delay-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Weekly Goal</h3>
          <Calendar size={24} className="text-green-500 animate-pulse" />
        </div>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {formatHours(weeklyStudyTime)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Goal: {weeklyGoal}h
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgressPercentage(weeklyStudyTime, weeklyGoal)}%` }}
          />
        </div>
      </div>

      {/* Monthly Goal Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in delay-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Monthly Goal</h3>
          <Calendar size={24} className="text-purple-500 animate-pulse" />
        </div>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {formatHours(monthlyStudyTime)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Goal: {monthlyGoal}h
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgressPercentage(monthlyStudyTime, monthlyGoal)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Get actual data from localStorage
  const [studyData, setStudyData] = React.useState({
    dailyGoal: 8,
    weeklyGoal: 40,
    monthlyGoal: 160,
    dailyStudyTime: 0,
    weeklyStudyTime: 0,
    monthlyStudyTime: 0,
  });
  
  // Get NoDopamine data for task completion
  const [taskData, setTaskData] = React.useState({
    completedTasks: 0,
    totalTasks: 10,
    points: 0
  });
  
  React.useEffect(() => {
    // Load study data from localStorage
    try {
      const savedStudyData = localStorage.getItem('studyManagerData');
      if (savedStudyData) {
        const parsedData = JSON.parse(savedStudyData);
        setStudyData({
          dailyGoal: 8, // Default goals
          weeklyGoal: 40,
          monthlyGoal: 160,
          dailyStudyTime: parsedData.dailyTime || 0,
          weeklyStudyTime: parsedData.weeklyTime || 0,
          monthlyStudyTime: parsedData.monthlyTime || 0,
        });
      }
      
      // Load NoDopamine data
      const nodopamineTasks = localStorage.getItem('nodopamineTasks');
      const nodopaminePoints = localStorage.getItem('nodopaminePoints');
      const nodopamineSubmittedTasks = localStorage.getItem('nodopamineSubmittedTasks');
      
      if (nodopamineTasks && nodopaminePoints) {
        const tasks = JSON.parse(nodopamineTasks);
        const submittedTasks = nodopamineSubmittedTasks ? JSON.parse(nodopamineSubmittedTasks) : {};
        const completedCount = Object.values(tasks).filter(Boolean).length;
        const totalCount = Object.keys(tasks).length;
        
        setTaskData({
          completedTasks: completedCount,
          totalTasks: totalCount,
          points: parseInt(nodopaminePoints) || 0
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
      {/* Hero Section with New Color Scheme */}
<div className="relative bg-gradient-to-r 
                from-white to-white 
                dark:from-teal-800 dark:to-indigo-900 
                text-gray-900 dark:text-white 
                py-16 px-6 text-center 
                rounded-b-3xl dark:shadow-2xl">

  {/* Overlay for subtle shading */}
  <div className="absolute inset-0 bg-black bg-opacity-5 dark:bg-opacity-20 rounded-b-3xl" />

  {/* Heading */}
  <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in">
    Odyssey - Make Today Count
  </h1>

  {/* Subtext */}
  <p className="relative text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in delay-100">
    Embark on your productivity journey. Track your study time, achieve your goals, and unlock your potential!
  </p>

  {/* CTA Button */}
  <Link
    to="/StudyManager"
    className="relative inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 dark:bg-gray-800 dark:text-teal-300 font-semibold rounded-full shadow-lg hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-all duration-300 transform hover:scale-105 animate-pulse"
  >
    <Clock size={24} />
    Start Tracking Now
    <ArrowRight size={20} />
  </Link>

  {/* Note */}
  <div className="relative mt-6 text-sm text-yellow-700 dark:text-yellow-400 animate-pulse">
    App Under Active Development
  </div>
</div>


      {/* Goals Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
          <Target size={28} className="text-teal-500" />
          Your Progress
        </h2>
        <MockGoalsCard {...studyData} />
        
        {/* Task Completion Card */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
            <CheckCircle size={28} className="text-purple-500" />
            Daily Tasks
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Task Completion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your daily habits and routines</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{taskData.points}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Points</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {taskData.completedTasks} of {taskData.totalTasks} tasks completed
                </span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {Math.round((taskData.completedTasks / taskData.totalTasks) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(taskData.completedTasks / taskData.totalTasks) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Link
                to="/ConsistencyTracker"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-all duration-300"
              >
                <CheckCircle size={18} />
                View All Tasks
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
          <Code size={28} className="text-gray-600 dark:text-gray-400" />
          About the Developer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a
            href="https://yashbandal.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-300 transform hover:scale-105"
          >
            <Globe size={32} className="text-teal-500 dark:text-teal-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Portfolio</h3>
              <p className="text-teal-500 dark:text-teal-400">yashbandal.netlify.app</p>
            </div>
          </a>
          <a
            href="https://github.com/Yash-Bandal"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-300 transform hover:scale-105"
          >
            <Github size={32} className="text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">GitHub</h3>
              <p className="text-teal-500 dark:text-teal-400">@Yash-Bandal</p>
            </div>
          </a>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="bg-white dark:bg-gray-800 py-12 text-center rounded-t-3xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-3">
          <Clock size={28} className="text-teal-500" />
          Ready to Boost Your Productivity?
        </h2>
        <Link
          to="/StudyManager"
          className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-semibold rounded-full shadow-lg hover:bg-teal-600 dark:hover:bg-teal-700 transition-all duration-300 transform hover:scale-105"
        >
          <Clock size={24} />
          Go to Study Manager
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
