import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Target, Clock, Trophy, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { FaCrown, FaTrophy, FaStar, FaBullseye, FaSeedling, FaRocket, FaBolt } from "react-icons/fa";

const StudyManager = () => {
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Study tracking states
  const [studySessions, setStudySessions] = useState([]);
  const [dailyStudyTime, setDailyStudyTime] = useState(0);
  const [weeklyStudyTime, setWeeklyStudyTime] = useState(0);
  const [monthlyStudyTime, setMonthlyStudyTime] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  
  // Goals and rewards
  const [dailyGoal, setDailyGoal] = useState(8); // hours
  const [weeklyGoal, setWeeklyGoal] = useState(40); // hours
  const [monthlyGoal, setMonthlyGoal] = useState(160); // hours
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);
  
  // UI states
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('');
  const [sessionSubject, setSessionSubject] = useState('');
  const [timerRestored, setTimerRestored] = useState(false);
  
  const intervalRef = useRef(null);

  // Timer configurations
  const timerConfigs = {
    pomodoro: { time: 25 * 60, label: 'Focus Time', color: 'bg-red-500' },
    shortBreak: { time: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { time: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  };

  // Reward system based on study hours
  // const rewardTiers = [
  //   { hours: 10, points: 100, label: 'Master', color: 'from-purple-600 to-pink-600', icon: '👑' },
  //   { hours: 8, points: 80, label: 'Expert', color: 'from-yellow-500 to-orange-500', icon: '🏆' },
  //   { hours: 6, points: 60, label: 'Advanced', color: 'from-blue-500 to-cyan-500', icon: '⭐' },
  //   { hours: 4, points: 40, label: 'Intermediate', color: 'from-green-500 to-emerald-500', icon: '🎯' },
  //   { hours: 2, points: 20, label: 'Beginner', color: 'from-indigo-500 to-purple-500', icon: '🌱' },
  //   { hours: 1, points: 10, label: 'Starter', color: 'from-gray-500 to-slate-500', icon: '🚀' },
  //   { hours: 0.5, points: 5, label: 'Warm-up', color: 'from-slate-400 to-gray-400', icon: '💫' }
  // ];

const rewardTiers = [
  { hours: 10, points: 100, label: 'Master', color: 'from-purple-600 to-pink-600', icon: <FaCrown className="text-black dark:text-white" /> },
  { hours: 8, points: 80, label: 'Expert', color: 'from-yellow-500 to-orange-500', icon: <FaTrophy className="text-black dark:text-white" /> },
  { hours: 6, points: 60, label: 'Advanced', color: 'from-blue-500 to-cyan-500', icon: <FaStar className="text-black dark:text-white" /> },
  { hours: 4, points: 40, label: 'Intermediate', color: 'from-green-500 to-emerald-500', icon: <FaBullseye className="text-black dark:text-white" /> },
  { hours: 2, points: 20, label: 'Beginner', color: 'from-indigo-500 to-purple-500', icon: <FaSeedling className="text-black dark:text-white" /> },
  { hours: 1, points: 10, label: 'Starter', color: 'from-gray-500 to-slate-500', icon: <FaRocket className="text-black dark:text-white" /> },
  { hours: 0.5, points: 5, label: 'Warm-up', color: 'from-slate-400 to-gray-400', icon: <FaBolt className="text-black dark:text-white" /> },
];

  // Initialize data from localStorage
  useEffect(() => {
    let data = {};
    try {
      const savedData = localStorage.getItem('studyManagerData');
      console.log('🔍 Loading saved data:', savedData);
      if (savedData) {
        data = JSON.parse(savedData);
        console.log('📊 Parsed data:', data);
        if (data.sessions?.length > 0) {
          console.log(`✅ Loaded ${data.sessions.length} study sessions from localStorage`);
        }
      }
    } catch (error) {
      console.error('❌ Error parsing localStorage data:', error);
      localStorage.removeItem('studyManagerData'); // Clear corrupted data
    }

    setStudySessions(data.sessions || []);
    setDailyStudyTime(data.dailyTime || 0);
    setWeeklyStudyTime(data.weeklyTime || 0);
    setMonthlyStudyTime(data.monthlyTime || 0);
    setTotalStudyTime(data.totalTime || 0);
    setCurrentStreak(data.currentStreak || 0);
    setLongestStreak(data.longestStreak || 0);
    setPoints(data.points || 0);
    setLevel(data.level || 1);
    setAchievements(data.achievements || []);
    setCompletedPomodoros(data.completedPomodoros || 0);
    
    // Check if we need to update streak based on sessions
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastStreakDate = localStorage.getItem('lastStreakDate');
    
    // If we have a session today but haven't updated the streak yet
    if (data.sessions?.some(session => new Date(session.timestamp).toDateString() === today) && 
        lastStreakDate !== today) {
      // Update streak manually since the function isn't available in the effect
      const newStreak = data.currentStreak + 1 || 1;
      setCurrentStreak(newStreak);
      if (newStreak > (data.longestStreak || 0)) {
        setLongestStreak(newStreak);
      }
      localStorage.setItem('lastStreakDate', today);
      console.log('🔄 Updated streak on initialization:', newStreak);
    }
    // If we don't have a session today and the last streak date wasn't yesterday, reset streak
    else if (lastStreakDate && lastStreakDate !== yesterday && lastStreakDate !== today) {
      setCurrentStreak(0);
      console.log('🔄 Streak reset due to missed day');
    }

    // Restore timer state
    if (data.timerMode) {
      setTimerMode(data.timerMode);
      console.log('✅ Timer mode restored:', data.timerMode);
    }
    if (data.timeLeft !== undefined && data.timeLeft > 0) {
      console.log('⏰ Restoring time left:', data.timeLeft);
      setTimeLeft(data.timeLeft);
      
      // If timer was running, calculate elapsed time
      if (data.isRunning) {
        const lastSaved = localStorage.getItem('lastTimerSave');
        if (lastSaved) {
          const timePassed = Math.floor((Date.now() - parseInt(lastSaved)) / 1000);
          const newTimeLeft = Math.max(0, data.timeLeft - timePassed);
          console.log('⏱️ Time passed:', timePassed, 'New time left:', newTimeLeft);
          
          if (newTimeLeft > 0) {
            setTimeLeft(newTimeLeft);
            setTimerRestored(true);
            console.log('⏸️ Timer restored with', newTimeLeft, 'seconds remaining');
          } else {
            console.log('⏰ Timer completed while page was closed');
            handleTimerComplete();
          }
        }
      }
      setIsRunning(false); // Always start paused for safety
    }

    checkAndResetTimeframes();
  }, []);

  // Save data to localStorage whenever important state changes
  useEffect(() => {
    const saveData = () => {
      try {
        const data = {
          sessions: studySessions,
          dailyTime: dailyStudyTime,
          weeklyTime: weeklyStudyTime,
          monthlyTime: monthlyStudyTime,
          totalTime: totalStudyTime,
          currentStreak: currentStreak,
          longestStreak: longestStreak,
          points: points,
          level: level,
          achievements: achievements,
          completedPomodoros,
          timerMode,
          timeLeft,
          isRunning
        };
        localStorage.setItem('studyManagerData', JSON.stringify(data));
        console.log('💾 Data saved to localStorage');
      } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
      }
    };

    // Save immediately
    saveData();

    // Also save when page is about to unload
    const handleBeforeUnload = () => {
      saveData();
      if (isRunning) {
        localStorage.setItem('lastTimerSave', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [studySessions, dailyStudyTime, weeklyStudyTime, monthlyStudyTime, totalStudyTime, currentStreak, longestStreak, points, level, achievements, completedPomodoros, timerMode, timeLeft, isRunning]);



  // Check and reset timeframes (daily, weekly, monthly)
  const checkAndResetTimeframes = () => {
    const now = new Date();
    const today = now.toDateString();
    const lastSaved = localStorage.getItem('lastStudyReset');

    if (lastSaved !== today) {
      setDailyStudyTime(0);
      localStorage.setItem('lastStudyReset', today);

      const lastWeek = localStorage.getItem('lastWeekReset');
      const currentWeek = getWeekNumber(now);

      if (lastWeek !== currentWeek.toString()) {
        setWeeklyStudyTime(0);
        localStorage.setItem('lastWeekReset', currentWeek.toString());
      }

      const lastMonth = localStorage.getItem('lastMonthReset');
      const currentMonth = now.getMonth() + 1;

      if (lastMonth !== currentMonth.toString()) {
        setMonthlyStudyTime(0);
        localStorage.setItem('lastMonthReset', currentMonth.toString());
      }
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Save timestamp when timer starts
      localStorage.setItem('lastTimerSave', Date.now().toString());
      console.log('⏰ Timer started, saved timestamp');
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      addStudySession(25, 'Pomodoro Session'); // Add 25-minute session
      setTimerMode('shortBreak');
      setTimeLeft(timerConfigs.shortBreak.time);
      setIsRunning(true);
    }
    
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  };

  const startTimer = () => {
    setIsRunning(true);
    setTimerRestored(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerConfigs[timerMode].time);
  };

  const switchTimerMode = (mode) => {
    setTimerMode(mode);
    setTimeLeft(timerConfigs[mode].time);
    setIsRunning(false);
  };

  const addStudySession = (duration, subject = 'General Study') => {
    const session = {
      id: Date.now(),
      duration,
      subject,
      timestamp: new Date().toISOString(),
      points: calculatePoints(duration)
    };

    setStudySessions(prev => [session, ...prev]);
    
    const hours = duration / 60;
    setDailyStudyTime(prev => prev + hours);
    setWeeklyStudyTime(prev => prev + hours);
    setMonthlyStudyTime(prev => prev + hours);
    setTotalStudyTime(prev => prev + hours);
    
    setPoints(prev => prev + session.points);
    checkAchievements(session.points);
    
    updateStreaks();
  };

  const calculatePoints = (minutes) => {
    const hours = minutes / 60;
    const tier = rewardTiers.find(t => hours >= t.hours);
    return tier ? tier.points : 0;
  };

  const checkAchievements = (newPoints) => {
    const newLevel = Math.floor(points / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setAchievements(prev => [...prev, { type: 'level', value: newLevel, timestamp: new Date().toISOString() }]);
    }
  };

  const updateStreaks = () => {
    const today = new Date().toDateString();
    const hasSessionToday = studySessions.some(session => 
      new Date(session.timestamp).toDateString() === today
    );
    
    if (hasSessionToday) {
      // Check if we already counted today in the streak
      const lastSessionDate = localStorage.getItem('lastStreakDate');
      
      if (lastSessionDate !== today) {
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > longestStreak) {
            setLongestStreak(newStreak);
          }
          // Save the date we counted for the streak
          localStorage.setItem('lastStreakDate', today);
          return newStreak;
        });
      }
    }
  };
  
  const deleteSession = (sessionId) => {
    // Find the session to delete
    const sessionToDelete = studySessions.find(session => session.id === sessionId);
    
    if (sessionToDelete) {
      // Update study times
      const hours = sessionToDelete.duration / 60;
      setDailyStudyTime(prev => Math.max(0, prev - hours));
      setWeeklyStudyTime(prev => Math.max(0, prev - hours));
      setMonthlyStudyTime(prev => Math.max(0, prev - hours));
      setTotalStudyTime(prev => Math.max(0, prev - hours));
      
      // Update points
      setPoints(prev => Math.max(0, prev - sessionToDelete.points));
      
      // Remove the session
      setStudySessions(prev => prev.filter(session => session.id !== sessionId));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const getCurrentRewardTier = () => {
    const tier = rewardTiers.find(t => dailyStudyTime >= t.hours);
    return tier || rewardTiers[rewardTiers.length - 1];
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Header */}
<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
    
    {/* Left Section */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Study Manager</h1>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Calendar size={16} />
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
    
    {/* Right Section */}
    <div className="flex flex-wrap gap-3 md:gap-2 items-center justify-start md:justify-end">
      
      {/* Add Session */}
      <button
        onClick={() => setShowSessionModal(true)}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
      >
        <BookOpen size={16} />
        + Session
      </button>

      {/* Debug State */}
      {/* <button
        onClick={() => {
          const savedData = localStorage.getItem('studyManagerData');
          console.log('🔍 Current localStorage data:', savedData);
          console.log('⏰ Last timer save:', localStorage.getItem('lastTimerSave'));
          console.log('📅 Last study reset:', localStorage.getItem('lastStudyReset'));
          console.log('📊 Current state:', {
            sessions: studySessions,
            dailyTime: dailyStudyTime,
            weeklyTime: weeklyStudyTime,
            monthlyTime: monthlyStudyTime,
            totalTime: totalStudyTime,
            currentStreak,
            longestStreak,
            points,
            level,
            achievements,
            completedPomodoros,
            timerMode,
            timeLeft,
            isRunning
          });
        }}
        className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
      >
        Debug State
      </button> */}

      {/* Status Indicator */}
      <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col gap-1 text-center">
        <div>{studySessions.length} sessions</div>
        <div>{formatTime(timeLeft)}</div>
        <div>{formatHours(dailyStudyTime)} today</div>
      </div>

      {/* Clear Data */}
      {/* <button
        onClick={() => {
          localStorage.removeItem('studyManagerData');
          localStorage.removeItem('lastTimerSave');
          localStorage.removeItem('lastStudyReset');
          localStorage.removeItem('lastWeekReset');
          localStorage.removeItem('lastMonthReset');
          alert('All data cleared!');
          window.location.reload();
        }}
        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
      >
        Clear Data
      </button> */}

      {/* Timer Mode Buttons */}
      {/* <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {Object.entries(timerConfigs).map(([mode, config]) => (
          <button
            key={mode}
            onClick={() => switchTimerMode(mode)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              timerMode === mode
                ? `${config.color} text-white shadow-md`
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div> */}

      {/* Timer Mode Buttons */}
<div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-2 shadow-inner">
  {Object.entries(timerConfigs).map(([mode, config]) => (
    <button
      key={mode}
      onClick={() => switchTimerMode(mode)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-none
        ${
          timerMode === mode
            ? `${config.color} text-white shadow-lg scale-105`
            : 'bg-white/70 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
      {config.label}
    </button>
  ))}
</div>


    </div>
  </div>
</div>

      <div className="p-6 space-y-6">
        {/* Main Timer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {timerConfigs[timerMode].label}
            </h2>
            
            {timerRestored && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                  <Clock size={16} />
                  <span>Timer restored from previous session. Click Start to resume.</span>
                </div>
              </div>
            )}
            
            <div className="text-8xl font-mono font-bold text-gray-800 dark:text-gray-100 mb-8">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <Play size={24} />
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <Pause size={24} />
                  Pause
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Target size={20} />
                <span>Completed: {completedPomodoros}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>Today: {formatHours(dailyStudyTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Daily Goal</h3>
              <Target size={20} className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {formatHours(dailyStudyTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Goal: {dailyGoal}h
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(dailyStudyTime, dailyGoal)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Weekly Goal</h3>
              <Calendar size={20} className="text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {formatHours(weeklyStudyTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Goal: {weeklyGoal}h
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(weeklyStudyTime, weeklyGoal)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Current Streak</h3>
              <Trophy size={20} className="text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {currentStreak} days
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Best: {longestStreak} days
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(currentStreak, Math.max(longestStreak, 7))}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Total Points</h3>
              <Trophy size={20} className="text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {points}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Level atom
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((points % 100) / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reward System */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Reward System</h3>
          
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Tier</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Based on today's study time</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getCurrentRewardTier().icon} {getCurrentRewardTier().label}
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-400">
                  {getCurrentRewardTier().points} points
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {rewardTiers.map((tier, index) => {
              const isUnlocked = dailyStudyTime >= tier.hours;
              const isCurrent = dailyStudyTime >= tier.hours && (index === 0 || dailyStudyTime < rewardTiers[index - 1]?.hours);
              
              return (
                <div 
                  key={tier.hours}
                  className={`
                    relative group transition-all duration-300 transform hover:scale-105 p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center
                    ${isUnlocked 
                      ? `bg-gradient-to-br ${tier.color} text-white border-transparent shadow-lg` 
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }
                    ${isCurrent ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-800" : ""}
                  `}
                >
                  <div className="text-3xl mb-2">{tier.icon}</div>
                  <div className="text-sm font-bold mb-1 text-black dark:text-white">
                    {tier.hours === 0.5 ? '30m' : `${tier.hours}h`}
                  </div>
                  <div className="text-xs opacity-90 text-black dark:text-white">{tier.label}</div>
                  <div className="text-xs mt-1 text-black dark:text-white">{tier.points} pts</div>
                  
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🔥</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-700 dark:border-gray-600">
                    {isCurrent ? "Current Tier! 🔥" : 
                     isUnlocked ? `${tier.label} Tier Unlocked! 🏆` : 
                     `Unlock at ${tier.hours === 0.5 ? '30 minutes' : `${tier.hours} hours`}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Study Sessions</h3>
          
          {studySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No study sessions yet. Start your first session!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studySessions.slice(0, 10).map(session => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{session.subject}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.timestamp).toLocaleDateString()} at {new Date(session.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {formatHours(session.duration / 60)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {session.points} points
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                        title="Delete session"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

      {/* Add Session Modal */}
      {showSessionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowSessionModal(false);
            setSessionDuration('');
            setSessionSubject('');
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Add Study Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  placeholder="e.g., 120"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Physics"
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSessionModal(false);
                  setSessionDuration('');
                  setSessionSubject('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (sessionDuration && parseInt(sessionDuration) > 0) {
                    addStudySession(parseInt(sessionDuration), sessionSubject || 'General Study');
                    setSessionDuration('');
                    setSessionSubject('');
                    setShowSessionModal(false);
                  }
                }}
                disabled={!sessionDuration || parseInt(sessionDuration) <= 0}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
              >
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyManager;