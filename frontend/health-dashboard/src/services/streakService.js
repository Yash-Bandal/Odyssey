// Enhanced Streak Service for the new backend API
const API_BASE_URL = 'http://localhost:5000/api';

class StreakService {
    constructor() {
        this.userId = this.getUserId();
        this.initializeUser();
    }

    // Generate or retrieve user ID
    getUserId() {
        let userId = localStorage.getItem('streak_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('streak_user_id', userId);
        }
        return userId;
    }

    // Initialize user in backend
    async initializeUser() {
        try {
            await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.userId })
            });
        } catch (error) {
            console.log('User initialization failed (backend may be offline)');
        }
    }

    // Save streak data to backend
    async saveStreak(date, tasksCompleted, points) {
        try {
            console.log('Saving streak to backend:', { date, tasksCompleted, points });
            
            const response = await fetch(`${API_BASE_URL}/streaks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.userId,
                    date: date,
                    tasks_completed: tasksCompleted,
                    points_earned: points,
                    is_completed: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Backend response:', result);
            
            if (result.success) {
                // Update localStorage with new data
                this.updateLocalStorage(result.streaks, result.stats.total_points, result.achievements);
                return result;
            } else {
                throw new Error(result.error || 'Failed to save streak');
            }
        } catch (error) {
            console.error('Error saving streak to backend, falling back to localStorage:', error);
            // Fallback to localStorage
            this.saveToLocalStorage(date, tasksCompleted, points);
            return { 
                success: true, 
                message: 'Saved locally (API unavailable)',
                stats: this.calculateLocalStats(),
                unlocked_achievements: []
            };
        }
    }

    // Load all streak data from backend
    async loadStreaks() {
        try {
            const response = await fetch(`${API_BASE_URL}/streaks?user_id=${this.userId}`);
            const result = await response.json();
            
            if (result.success) {
                // Update localStorage with backend data
                this.updateLocalStorage(result.streaks, result.stats.total_points, result.achievements);
                return result;
            } else {
                throw new Error(result.error || 'Failed to load streaks');
            }
        } catch (error) {
            console.error('Error loading streaks:', error);
            // Fallback to localStorage
            return this.loadFromLocalStorage();
        }
    }

    // Reset all streaks
    async resetStreaks() {
        try {
            const response = await fetch(`${API_BASE_URL}/streaks/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.userId })
            });

            const result = await response.json();
            if (result.success) {
                this.clearLocalStorage();
                return result;
            } else {
                throw new Error(result.error || 'Failed to reset streaks');
            }
        } catch (error) {
            console.error('Error resetting streaks:', error);
            // Fallback to localStorage reset
            this.clearLocalStorage();
            return { success: true, message: 'Reset locally (API unavailable)' };
        }
    }

    // Export user data
    async exportData() {
        try {
            const response = await fetch(`${API_BASE_URL}/streaks/export?user_id=${this.userId}`);
            const result = await response.json();
            
            if (result.success !== undefined) {
                return result;
            } else {
                throw new Error('Failed to export data');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            // Fallback to localStorage export
            return this.exportFromLocalStorage();
        }
    }

    // Local storage fallback methods
    saveToLocalStorage(date, tasksCompleted, points) {
        const existingData = JSON.parse(localStorage.getItem('nodopamineData') || '{}');
        existingData[date] = tasksCompleted;
        localStorage.setItem('nodopamineData', JSON.stringify(existingData));

        // Update points
        const currentPoints = parseInt(localStorage.getItem('nodopaminePoints') || '0');
        localStorage.setItem('nodopaminePoints', (currentPoints + points).toString());
    }

    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('nodopamineData') || '{}');
        const points = parseInt(localStorage.getItem('nodopaminePoints') || '0');
        const badges = JSON.parse(localStorage.getItem('nodopamineBadges') || '[]');
        
        return {
            success: true,
            streaks: data,
            stats: this.calculateLocalStats(),
            achievements: badges
        };
    }

    calculateLocalStats() {
        const data = JSON.parse(localStorage.getItem('nodopamineData') || '{}');
        const dates = Object.keys(data).sort();
        const totalPoints = parseInt(localStorage.getItem('nodopaminePoints') || '0');
        
        let currentStreak = 0;
        let longestStreak = 0;
        let activeDays = 0;
        
        // Calculate current streak
        for (let i = dates.length - 1; i >= 0; i--) {
            if (data[dates[i]] > 0) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        // Calculate longest streak and active days
        let tempStreak = 0;
        for (const date of dates) {
            if (data[date] > 0) {
                tempStreak++;
                activeDays++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }
        
        return {
            current_streak: currentStreak,
            longest_streak: longestStreak,
            total_active_days: activeDays,
            total_points: totalPoints
        };
    }

    updateLocalStorage(streaks, totalPoints, achievements) {
        console.log('Updating localStorage with:', { streaks, totalPoints, achievements });
        
        // Convert backend format to localStorage format
        const convertedStreaks = {};
        for (const [date, data] of Object.entries(streaks)) {
            if (typeof data === 'object' && data.tasks_completed !== undefined) {
                convertedStreaks[date] = data.tasks_completed;
            } else {
                convertedStreaks[date] = data; // Already in local format
            }
        }
        
        console.log('Converted streaks for localStorage:', convertedStreaks);
        
        localStorage.setItem('nodopamineData', JSON.stringify(convertedStreaks));
        localStorage.setItem('nodopaminePoints', totalPoints.toString());
        localStorage.setItem('nodopamineBadges', JSON.stringify(achievements));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('localStorageUpdated', {
            detail: { streaks: convertedStreaks, totalPoints, achievements }
        }));
        
        console.log('localStorage updated successfully');
    }

    clearLocalStorage() {
        localStorage.removeItem('nodopamineData');
        localStorage.removeItem('nodopamineBadges');
        localStorage.removeItem('nodopaminePoints');
        localStorage.removeItem('nodopamineSubmitted');
    }

    exportFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('nodopamineData') || '{}');
        const points = parseInt(localStorage.getItem('nodopaminePoints') || '0');
        const badges = JSON.parse(localStorage.getItem('nodopamineBadges') || '[]');
        
        return {
            user_id: this.userId,
            export_date: new Date().toISOString(),
            streaks: Object.entries(data).map(([date, tasks]) => ({
                date,
                tasks_completed: tasks,
                points_earned: tasks,
                is_completed: true
            })),
            achievements: badges.map(milestone => ({
                achievement_type: 'streak',
                milestone,
                unlocked_at: new Date().toISOString()
            })),
            stats: this.calculateLocalStats()
        };
    }

    // Sync data between backend and localStorage
    async syncData() {
        try {
            const backendData = await this.loadStreaks();
            if (backendData.success) {
                return backendData;
            }
        } catch (error) {
            console.error('Sync failed, using local data:', error);
        }
        return this.loadFromLocalStorage();
    }

    // Check if backend is available
    async isBackendAvailable() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Get connection status
    async getConnectionStatus() {
        const isBackendAvailable = await this.isBackendAvailable();
        return {
            backend: isBackendAvailable ? 'connected' : 'disconnected',
            storage: 'local',
            sync_status: isBackendAvailable ? 'synced' : 'local_only'
        };
    }
}

export default new StreakService();
