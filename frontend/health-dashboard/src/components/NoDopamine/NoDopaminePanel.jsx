import React, { useEffect, useMemo, useState } from "react";
import useLocalStorage from "./useLocalStorage";
import ToggleItem from "./ToggleItem";
import HeatmapGrid from "./HeatmapGrid";
import streakService from "../../services/streakService";
import { 
    Apple,            // No Sugar + Junk Food
    BookOpen,         // Reading
    Dumbbell,         // Discipline-like (could also be Pranayama if you want)
    Flame,            // Daily Streak Maintained
    Notebook,         // Journal
    ShowerHead,       // Cold Shower
    GraduationCap,    // Study
    Wind,             // Pranayama (breathing)
    ScrollText,       // Hanuman Chalisa
    AudioWaveform,    // Recitations
    Video,            // Shorts
  } from "lucide-react";
  


const defaultTasks = {
    junkFood: false,
    chant: false,
    shorts: false,
    reading: false,
    hanumanChalisa: false,
    pranayama: false,
    dailyStreak: false,
    journal: false,
    coldShower: false,
    study: false,
};

// Task point allocations
const taskPoints = {
    junkFood: 1,
    chant: 5, // Nama Japa - Highest points
    shorts: 3, // No Shorts - Third highest
    reading: 2,
    hanumanChalisa: 4,
    pranayama: 2,
    dailyStreak: 1,
    journal: 2,
    coldShower: 2,
    study: 4, // Study - Second highest
};

const milestones = [1, 3, 7, 14, 30, 60, 100];

export default function NoDopaminePanel({ year = new Date().getFullYear() }) {
    const [tasks, setTasks] = useState(defaultTasks);
    const [data, setData] = useLocalStorage("nodopamineData", {});
    const [submitted, setSubmitted] = useLocalStorage("nodopamineSubmitted", false);
    const [points, setPoints] = useLocalStorage("nodopaminePoints", 0);
    const [badges, setBadges] = useLocalStorage("nodopamineBadges", []);
    const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
    const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

    useEffect(() => {
        setSubmitted(Boolean(data[todayStr] !== undefined));
        
        // Load data from backend/localStorage on component mount
        const loadData = async () => {
            try {
                const result = await streakService.syncData();
                if (result.success) {
                    // Update local state with synced data
                    if (result.streaks && typeof result.streaks === 'object') {
                        // Convert backend format to local format if needed
                        const convertedStreaks = {};
                        for (const [date, data] of Object.entries(result.streaks)) {
                            if (typeof data === 'object' && data.tasks_completed !== undefined) {
                                convertedStreaks[date] = data.tasks_completed;
                            } else {
                                convertedStreaks[date] = data; // Already in local format
                            }
                        }
                        setData(convertedStreaks);
                    }
                    
                    if (result.stats && result.stats.total_points !== undefined) {
                        setPoints(result.stats.total_points);
                    }
                    
                    if (result.achievements && Array.isArray(result.achievements)) {
                        setBadges(result.achievements);
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        
        // Check connection status
        const checkConnection = async () => {
            try {
                const status = await streakService.getConnectionStatus();
                const statusElement = document.getElementById('connection-status');
                if (statusElement) {
                    if (status.backend === 'connected') {
                        statusElement.textContent = '🟢 Backend';
                        statusElement.className = 'text-green-600 dark:text-green-400';
                    } else {
                        statusElement.textContent = '🔴 Local Only';
                        statusElement.className = 'text-orange-600 dark:text-orange-400';
                    }
                }
            } catch (error) {
                console.error('Failed to check connection:', error);
            }
        };
        
        loadData();
        checkConnection();
    }, [todayStr, setSubmitted, setData, setPoints, setBadges]);
    
    // Debug effect removed - no longer needed
    
    // Auto-sync with localStorage after submission
    useEffect(() => {
        if (submitted) {
            // Small delay to ensure localStorage is updated
            const timer = setTimeout(() => {
                syncWithLocalStorage();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [submitted]);
    
    // Listen for localStorage updates from streak service
    useEffect(() => {
        const handleLocalStorageUpdate = (event) => {
            console.log('Received localStorage update event:', event.detail);
            const { streaks, totalPoints, achievements } = event.detail;
            
            setData(streaks);
            setPoints(totalPoints);
            setBadges(achievements);
            
            // Force update to recalculate stats
            setForceUpdate(prev => prev + 1);
        };
        
        window.addEventListener('localStorageUpdated', handleLocalStorageUpdate);
        
        return () => {
            window.removeEventListener('localStorageUpdated', handleLocalStorageUpdate);
        };
    }, []);

    // Listen for theme changes to ensure proper dark mode updates
    useEffect(() => {
        const handleThemeChange = () => {
            // Force a re-render when theme changes to ensure proper dark mode styling
            setForceUpdate(prev => prev + 1);
        };
        
        window.addEventListener('themeChanged', handleThemeChange);
        
        return () => {
            window.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    const handleTaskChange = (task) => {
        if (submitted) return;
        setTasks((p) => ({ ...p, [task]: !p[task] }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const commits = Object.values(tasks).filter(Boolean).length;
        // Calculate points based on completed tasks using taskPoints
        const pointsEarned = Object.entries(tasks)
            .filter(([_, completed]) => completed)
            .reduce((total, [taskId, _]) => total + (taskPoints[taskId] || 1), 0);
        
        try {
            // Save to backend (with localStorage fallback)
            const result = await streakService.saveStreak(todayStr, commits, pointsEarned);
            
                            if (result.success) {
                    // Update local state with backend response
                    if (result.streaks && typeof result.streaks === 'object') {
                        // Convert backend format to local format if needed
                        const convertedStreaks = {};
                        for (const [date, data] of Object.entries(result.streaks)) {
                            if (typeof data === 'object' && data.tasks_completed !== undefined) {
                                convertedStreaks[date] = data.tasks_completed;
                            } else {
                                convertedStreaks[date] = data; // Already in local format
                            }
                        }
                        
                        // Ensure today's data is included
                        if (!convertedStreaks[todayStr]) {
                            convertedStreaks[todayStr] = commits;
                        }
                        
                        console.log('Updating data with:', convertedStreaks);
                        
                        // Update state immediately
                        setData(convertedStreaks);
                        setPoints(result.stats?.total_points || points + pointsEarned);
                        setBadges(result.achievements || badges);
                        setSubmitted(true);
                        
                        // Force a re-render to update stats immediately
                        setForceUpdate(prev => prev + 1);
                        
                        // Show achievement notifications if any unlocked
                        if (result.unlocked_achievements && result.unlocked_achievements.length > 0) {
                            result.unlocked_achievements.forEach(milestone => {
                                console.log(`🎉 Achievement unlocked: ${milestone} day streak!`);
                            });
                        }
                    } else {
                        // Fallback if no streaks data
                        const newData = { ...data, [todayStr]: commits };
                        setData(newData);
                        setPoints(prev => prev + pointsEarned);
                        setSubmitted(true);
                        setForceUpdate(prev => prev + 1);
                    }
                }
        } catch (error) {
            console.error('Failed to save streak:', error);
            // Fallback to local storage
        const newData = { ...data, [todayStr]: commits };
        setData(newData);
            setPoints(prev => prev + pointsEarned);
        setSubmitted(true);

            // Force a re-render to update stats immediately
            setForceUpdate(prev => prev + 1);
            
            // Update badges locally
            const newBadges = Array.from(new Set([...badges]));
        const currentStreak = (() => {
            let c = 0;
                for (let i = Object.keys(newData).sort().length - 1; i >= 0; i--) {
                    if ((newData[Object.keys(newData).sort()[i]] || 0) > 0) c++; else break;
            }
            return c;
        })();

            milestones.forEach(m => { 
                if (currentStreak >= m && !newBadges.includes(m)) newBadges.push(m); 
            });
        setBadges(newBadges);
        }
    };
    
    // Function to manually sync with localStorage
    const syncWithLocalStorage = () => {
        try {
            const storedData = JSON.parse(localStorage.getItem('nodopamineData') || '{}');
            const storedPoints = parseInt(localStorage.getItem('nodopaminePoints') || '0');
            const storedBadges = JSON.parse(localStorage.getItem('nodopamineBadges') || '[]');
            const storedSubmitted = localStorage.getItem('nodopamineSubmitted') === 'true';
            
            console.log('Syncing with localStorage:', { storedData, storedPoints, storedBadges, storedSubmitted });
            
            setData(storedData);
            setPoints(storedPoints);
            setBadges(storedBadges);
            setSubmitted(storedSubmitted);
            
            // Force update to recalculate stats
            setForceUpdate(prev => prev + 1);
        } catch (error) {
            console.error('Error syncing with localStorage:', error);
        }
    };

    const resetAll = async () => {
        if (!confirm("Reset all progress? This will clear all data from both backend and local storage.")) return;
        
        try {
            const result = await streakService.resetStreaks();
            if (result.success) {
                setData({});
                setBadges([]);
                setPoints(0);
                setSubmitted(false);
                setTasks(defaultTasks);
                console.log('✅ All data reset successfully');
            }
        } catch (error) {
            console.error('Failed to reset data:', error);
            // Fallback to local reset
        localStorage.removeItem("nodopamineData");
        localStorage.removeItem("nodopamineBadges");
        localStorage.removeItem("nodopaminePoints");
        localStorage.removeItem("nodopamineSubmitted");
        setData({});
        setBadges([]);
        setPoints(0);
        setSubmitted(false);
        setTasks(defaultTasks);
        }
    };

    const stats = useMemo(() => {
        console.log('Calculating stats with data:', data);
        const dates = Object.keys(data).sort();
        const totalCommits = Object.values(data).reduce((a, b) => a + (b || 0), 0);
        const activeDays = dates.filter(d => (data[d] || 0) > 0).length;
        let maxStreak = 0, cur = 0;
        for (let i = 0; i < dates.length; i++) {
            if ((data[dates[i]] || 0) > 0) {
                cur = i > 0 && (new Date(dates[i]) - new Date(dates[i - 1]) === 86400000) ? cur + 1 : 1;
                maxStreak = Math.max(maxStreak, cur);
            } else cur = 0;
        }
        let currentStreak = 0;
        for (let i = dates.length - 1; i >= 0; i--) {
            if ((data[dates[i]] || 0) > 0) currentStreak++;
            else break;
        }
        const result = { totalCommits, activeDays, maxStreak, currentStreak };
        console.log('Calculated stats:', result);
        return result;
    }, [data, forceUpdate]);

    return (
        <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-all duration-300 ease-in-out">
            {/* Connection Status & Debug Info */}
            <div className="flex items-center justify-between mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span id="connection-status" className="text-sm font-semibold">Checking...</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Data: {Object.keys(data).length} days
                    </span>
                    <button 
                        onClick={syncWithLocalStorage}
                        className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                    >
                        Sync
                    </button>
                </div>
            </div>

            {/* Enhanced Top Stats with Ring */}
            <div className="card p-6 mb-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/50 shadow-lg dark:shadow-gray-900/20 transition-all duration-300">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Main Ring */}
                    <div className="relative">
                        <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
                            {/* Progress Ring */}
                            <svg className="w-48 h-48 absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 42}`}
                                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - Math.min(stats.currentStreak / 100, 1))}`}
                                    className="text-green-500 dark:text-green-400 transition-all duration-1000 ease-out drop-shadow-lg"
                                    strokeLinecap="round"
                                />
                            </svg>
                            
                            {/* Center Content */}
                            <div className="text-center z-10">
                                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                                    {stats.currentStreak}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Day{stats.currentStreak === 1 ? '' : 's'}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                    Current Streak
                                </div>
                            </div>
                        </div>
                        
                        {/* Ring Glow Effect */}
                        {stats.currentStreak > 0 && (
                            <div className="absolute inset-0 w-48 h-48 rounded-full bg-green-400/20 dark:bg-green-400/10 blur-xl animate-pulse"></div>
                        )}
                        
                        {/* Animated particles for active streaks */}
                        {stats.currentStreak > 0 && (
                            <>
                                <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 dark:bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 dark:bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-300 dark:bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-300 dark:bg-emerald-200 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                            </>
                        )}
                    </div>
                    
                    {/* Streak status indicator */}
                    {stats.currentStreak > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                            🔥 Active
                        </div>
                    )}
                </div>

                {/* Enhanced Stats Section */}
                <div className="flex-1 space-y-4 mt-6">
                    {/* Progress to next milestone */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress to Next Milestone</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                {(() => {
                                    const nextMilestone = milestones.find(m => m > stats.currentStreak) || milestones[milestones.length - 1];
                                    const progress = Math.min(100, (stats.currentStreak / nextMilestone) * 100);
                                    return `${progress.toFixed(0)}%`;
                                })()}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                                className="h-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                style={{ 
                                    width: `${(() => {
                                        const nextMilestone = milestones.find(m => m > stats.currentStreak) || milestones[milestones.length - 1];
                                        return Math.min(100, (stats.currentStreak / nextMilestone) * 100);
                                    })()}%` 
                                }}
                            />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {(() => {
                                const nextMilestone = milestones.find(m => m > stats.currentStreak);
                                if (nextMilestone) {
                                    const remaining = nextMilestone - stats.currentStreak;
                                    return `${remaining} more day${remaining === 1 ? '' : 's'} to unlock ${nextMilestone}d badge!`;
                                }
                                return "All milestones unlocked! 🎉";
                            })()}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Longest Streak</span>
                            </div>
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{stats.maxStreak}d</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {stats.maxStreak === stats.currentStreak ? "🏆 New Record!" : "Best achievement"}
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Days</span>
                            </div>
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{stats.activeDays}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {stats.activeDays > 0 ? `${Math.round((stats.activeDays / Object.keys(data).length) * 100)}% success rate` : "Start your journey!"}
                            </div>
                        </div>
                    </div>

                    {/* Additional stats */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Points Earned</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">From completed tasks</div>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{points}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Submit Button */}
            <div className="mt-6 flex justify-center">
                <button 
                    onClick={handleSubmit} 
                    className="relative overflow-hidden px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                >
                    {submitted ? (
                        <div className="flex items-center gap-2">
                            <span>Submitted Today</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>🎯 Submit Today's Progress</span>
                        </div>
                    )}
                    
                    {/* Button glow effect */}
                    {!submitted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
                    )}
                </button>
            </div>

            {/* Enhanced Daily Tasks */}
            <div className="card p-6 mb-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 shadow-lg dark:shadow-gray-900/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">📋 Daily Tasks</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Complete your daily goals to build consistency</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {Object.values(tasks).filter(Boolean).length}/{Object.keys(defaultTasks).length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                            {(() => {
                                const currentPoints = Object.entries(tasks)
                                    .filter(([_, completed]) => completed)
                                    .reduce((total, [taskId, _]) => total + (taskPoints[taskId] || 1), 0);
                                const totalPossible = Object.values(taskPoints).reduce((sum, points) => sum + points, 0);
                                return `${currentPoints}/${totalPossible} pts`;
                            })()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Points Earned/Total</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Progress</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {Math.round((Object.values(tasks).filter(Boolean).length / Object.keys(defaultTasks).length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                            className="h-3 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                            style={{ 
                                width: `${(Object.values(tasks).filter(Boolean).length / Object.keys(defaultTasks).length) * 100}%` 
                            }}
                        />
                    </div>
                </div>

                {/* Enhanced Task Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {[
                        { 
                            id: "junkFood", 
                            label: "No Sugar + Junk Food", 
                            icon: <Apple/>,
                            description: "Avoid processed foods and added sugars",
                            color: "from-red-500 to-pink-500",
                            bgColor: "from-red-50 to-pink-50",
                            darkBgColor: "from-red-900/20 to-pink-900/20",
                            points: 1
                        },
                        { 
                            id: "chant", 
                            label: "Recitations - 5000", 
                            // icon: "🙏",
                            icon: <AudioWaveform/>,
                            description: "Complete your daily spiritual practice (5 points)",
                            color: "from-purple-500 to-indigo-500",
                            bgColor: "from-purple-50 to-indigo-50",
                            darkBgColor: "from-purple-900/20 to-indigo-900/20",
                            points: 5
                        },
                        { 
                            id: "shorts", 
                            label: "No Instant Gratification", 
                            // icon: "📱",
                            icon: <Video />,
                            description: "Avoid short-form video content (3 points)",
                            color: "from-orange-500 to-red-500",
                            bgColor: "from-orange-50 to-red-50",
                            darkBgColor: "from-orange-900/20 to-red-900/20",
                            points: 3
                        },
                        { 
                            id: "reading", 
                            label: "Reading", 
                            // icon: "📚",
                            icon: <BookOpen/>,
                            description: "Read for personal growth",
                            color: "from-green-500 to-teal-500",
                            bgColor: "from-green-50 to-teal-50",
                            darkBgColor: "from-green-900/20 to-teal-900/20",
                            points: 2
                        },
                        { 
                            id: "hanumanChalisa", 
                            label: "Hanuman Chalisa", 
                            // icon: "🕉️",
                            icon: <ScrollText/>,
                            description: "Recite Hanuman Chalisa daily",
                            color: "from-yellow-500 to-orange-500",
                            bgColor: "from-yellow-50 to-orange-50",
                            darkBgColor: "from-yellow-900/20 to-orange-900/20",
                            points: 4
                        },
                        { 
                            id: "pranayama", 
                            label: "Pranayama", 
                            // icon: "🫁",
                            icon: <Wind/>,
                            description: "Practice breathing exercises",
                            color: "from-blue-500 to-cyan-500",
                            bgColor: "from-blue-50 to-cyan-50",
                            darkBgColor: "from-blue-900/20 to-cyan-900/20",
                            points: 2
                        },
                        { 
                            id: "dailyStreak", 
                            label: "Daily Streak Maintained", 
                            // icon: "🔥",
                            icon: <Flame/>,
                            description: "Maintain your daily consistency",
                            color: "from-red-500 to-pink-500",
                            bgColor: "from-red-50 to-pink-50",
                            darkBgColor: "from-red-900/20 to-pink-900/20",
                            points: 1
                        },
                        { 
                            id: "journal", 
                            label: "Journal", 
                            // icon: "📝",
                            icon: <Notebook/>,
                            description: "Write in your daily journal",
                            color: "from-indigo-500 to-purple-500",
                            bgColor: "from-indigo-50 to-purple-50",
                            darkBgColor: "from-indigo-900/20 to-purple-900/20",
                            points: 2
                        },
                        { 
                            id: "coldShower", 
                            label: "Cold Shower", 
                            // icon: "🚿",
                            icon: <ShowerHead/>,
                            description: "Take a cold shower for discipline",
                            color: "from-cyan-500 to-blue-500",
                            bgColor: "from-cyan-50 to-blue-50",
                            darkBgColor: "from-cyan-900/20 to-blue-900/20",
                            points: 2
                        },
                        { 
                            id: "study", 
                            label: "Study", 
                            // icon: "🎓",
                            icon: <GraduationCap/>,
                            description: "Study for academic/professional growth (4 points)",
                            color: "from-emerald-500 to-green-500",
                            bgColor: "from-emerald-50 to-green-50",
                            darkBgColor: "from-emerald-900/20 to-green-900/20",
                            points: 4
                        },
                    ].map(item => (
                        <div 
                            key={item.id} 
                            className={`
                                relative group transition-all duration-300 transform hover:scale-105 cursor-pointer
                                ${tasks[item.id] 
                                    ? `bg-gradient-to-br ${item.bgColor} dark:${item.darkBgColor} border-2 border-transparent ring-2 ring-opacity-50 shadow-lg` 
                                    : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }
                                ${submitted ? "cursor-not-allowed opacity-75" : ""}
                                p-5 rounded-xl shadow-sm hover:shadow-md
                            `}
                            onClick={() => !submitted && handleTaskChange(item.id)}
                        >
                            {/* Task Icon */}
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg`}>
                                {item.icon}
                            </div>

                            {/* Task Content */}
                            <div className="text-center">
                                <h5 className={`font-bold text-lg mb-2 ${tasks[item.id] ? "text-gray-800 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                                    {item.label}
                                </h5>
                                <p className={`text-sm mb-3 ${tasks[item.id] ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}`}>
                                    {item.description}
                                </p>
                                
                                {/* Points Badge */}
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 mb-3">
                                    <span>⭐</span>
                                    <span>{item.points} pt{item.points !== 1 ? 's' : ''}</span>
                                </div>
                                
                                {/* Status Indicator */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                    tasks[item.id] 
                                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" 
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                }`}>
                                    {tasks[item.id] ? (
                                        <>
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            Completed
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                            Pending
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Hover Effect */}
                            {!submitted && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                            )}

                            {/* Completion Checkmark */}
                            {tasks[item.id] && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => { 
                                if (!submitted) {
                                    setTasks({ 
                                        junkFood: true, 
                                        chant: true, 
                                        shorts: true, 
                                        reading: true,
                                        hanumanChalisa: true,
                                        pranayama: true,
                                        dailyStreak: true,
                                        journal: true,
                                        coldShower: true,
                                        study: true
                                    });
                                }
                            }} 
                            disabled={submitted}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark All Complete
                        </button>
                        <button 
                            onClick={() => { 
                                if (!submitted) {
                                    setTasks({ 
                                        junkFood: false, 
                                        chant: false, 
                                        shorts: false, 
                                        reading: false,
                                        hanumanChalisa: false,
                                        pranayama: false,
                                        dailyStreak: false,
                                        journal: false,
                                        coldShower: false,
                                        study: false
                                    });
                                }
                            }} 
                            disabled={submitted}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear All
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right">
                        <div className="font-medium">💡 Pro Tip:</div>
                        <div>Submit when you finish your chosen tasks for the day</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Rewards & Badges Section */}
            <div className="card p-6 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">🏆 Rewards & Badges</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Unlock achievements as you build consistency</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{points}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Points</div>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Progress to Next Milestone</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                            {(() => {
                                const nextMilestone = milestones.find(m => m > stats.currentStreak) || milestones[milestones.length - 1];
                                const progress = Math.min(100, (stats.currentStreak / nextMilestone) * 100);
                                return `${progress.toFixed(0)}%`;
                            })()}
                        </span>
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-800/40 rounded-full h-2 shadow-inner">
                        <div 
                            className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                            style={{ 
                                width: `${(() => {
                                    const nextMilestone = milestones.find(m => m > stats.currentStreak) || milestones[milestones.length - 1];
                                    return Math.min(100, (stats.currentStreak / nextMilestone) * 100);
                                })()}%` 
                            }}
                        />
                    </div>
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                        {(() => {
                            const nextMilestone = milestones.find(m => m > stats.currentStreak);
                            if (nextMilestone) {
                                const remaining = nextMilestone - stats.currentStreak;
                                return `${remaining} more day${remaining === 1 ? '' : 's'} to unlock ${nextMilestone}d badge!`;
                            }
                            return "All milestones unlocked! 🎉";
                        })()}
                    </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    {milestones.map(m => {
                        const unlocked = (badges || []).includes(m) || stats.currentStreak >= m;
                        const isCurrentStreak = stats.currentStreak === m;
                        const isNextMilestone = m === milestones.find(mil => mil > stats.currentStreak);
                        
                        return (
                            <div 
                                key={m} 
                                className={`
                                    relative group transition-all duration-300 transform hover:scale-105
                                    ${unlocked 
                                        ? "trophy-unlocked bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700/50" 
                                        : "trophy-empty bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50"
                                    }
                                    ${isCurrentStreak ? "ring-2 ring-green-400 ring-offset-2 dark:ring-offset-gray-800" : ""}
                                    ${isNextMilestone ? "ring-2 ring-purple-400 ring-offset-2 dark:ring-offset-gray-800" : ""}
                                    p-4 rounded-xl border-2 flex flex-col items-center justify-center
                                `}
                            >
                                {/* Badge Icon */}
                                <div className="w-16 h-16 flex items-center justify-center mb-3">
                                    {unlocked ? (
                                        <div className="relative">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                <path d="M7 3h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V3z" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M10 14h4v3h-4z" fill="#f59e0b" />
                                            </svg>
                                            {/* Sparkle effect for unlocked badges */}
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                        </div>
                                    ) : (
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-50">
                                            <path d="M7 3h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V3z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10 14h4v3h-4z" stroke="#9ca3af" strokeWidth="1.5" />
                                        </svg>
                                    )}
                                </div>

                                {/* Badge Info */}
                                <div className="text-center">
                                    <div className={`text-lg font-bold ${unlocked ? "text-amber-700 dark:text-amber-300" : "text-gray-500 dark:text-gray-400"}`}>
                                        {m}d
                                    </div>
                                    <div className={`text-xs ${unlocked ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"}`}>
                                        {unlocked ? "Unlocked" : "Locked"}
                                    </div>
                                </div>

                                {/* Status Indicators */}
                                {isCurrentStreak && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">🔥</span>
                                    </div>
                                )}
                                {isNextMilestone && !unlocked && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">⚡</span>
                                    </div>
                                )}

                                {/* Hover Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-700 dark:border-gray-600">
                                    {isCurrentStreak ? "Current Streak! 🔥" : 
                                     isNextMilestone ? "Next Milestone! ⚡" : 
                                     unlocked ? `${m} Day Badge Unlocked! 🏆` : 
                                     `Unlock at ${m} days`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Current Streak</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>Next Milestone</span>
                        </div>
                    </div>
                    <button 
                        onClick={async () => {
                            try {
                                const exportData = await streakService.exportData();
                                const a = document.createElement("a");
                                a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                                a.download = `nodopamine_${year}_${new Date().toISOString().split('T')[0]}.json`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                console.log('✅ Data exported successfully');
                            } catch (error) {
                                console.error('Failed to export data:', error);
                                // Fallback to local export
                                const a = document.createElement("a");
                                a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                                a.download = `nodopamine_${year}_local.json`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }
                        }} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        📊 Export Data
                    </button>
                </div>
            </div>

            {/* Heatmap */}
            <div className="card p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Year Heatmap</h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{year}</div>
                </div>
                <HeatmapGrid year={year} data={data} />
            </div>
        </div>
    );
}
