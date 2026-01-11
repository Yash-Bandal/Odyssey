from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta
import json
import os 

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_PATH = 'streaks.db'

def get_db_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def init_database():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Daily streaks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_streaks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            tasks_completed INTEGER DEFAULT 0,
            points_earned INTEGER DEFAULT 0,
            is_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, date),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User achievements/badges table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            achievement_type TEXT NOT NULL,
            milestone INTEGER NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, achievement_type, milestone),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User statistics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            user_id TEXT PRIMARY KEY,
            total_points INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            total_active_days INTEGER DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date ON daily_streaks(user_id, date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)')
    
    conn.commit()
    conn.close()

def update_user_stats(user_id):
    """Update user statistics based on current data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Calculate current streak
        cursor.execute('''
            SELECT COUNT(*) as streak_count
            FROM (
                SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) as rn
                FROM daily_streaks 
                WHERE user_id = ? AND is_completed = TRUE
                ORDER BY date DESC
            ) 
            WHERE date = DATE('now', '-' || (rn-1) || ' days')
        ''', (user_id,))
        
        current_streak = cursor.fetchone()['streak_count']
        
        # Calculate longest streak
        cursor.execute('''
            WITH streak_groups AS (
                SELECT date, 
                       DATE(date, '-' || ROW_NUMBER() OVER (ORDER BY date) || ' days') as grp
                FROM daily_streaks 
                WHERE user_id = ? AND is_completed = TRUE
                ORDER BY date
            )
            SELECT MAX(COUNT(*)) as max_streak
            FROM streak_groups 
            GROUP BY grp
        ''', (user_id,))
        
        longest_streak = cursor.fetchone()['max_streak'] or 0
        
        # Get total active days and points
        cursor.execute('''
            SELECT COUNT(*) as active_days, SUM(points_earned) as total_points
            FROM daily_streaks 
            WHERE user_id = ? AND is_completed = TRUE
        ''', (user_id,))
        
        stats = cursor.fetchone()
        total_active_days = stats['active_days'] or 0
        total_points = stats['total_points'] or 0
        
        # Update or insert user stats
        cursor.execute('''
            INSERT OR REPLACE INTO user_stats 
            (user_id, total_points, current_streak, longest_streak, total_active_days, last_updated)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, total_points, current_streak, longest_streak, total_active_days))
        
        conn.commit()
        
        return {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'total_active_days': total_active_days,
            'total_points': total_points
        }
        
    except Exception as e:
        print(f"Error updating user stats: {e}")
        return None
    finally:
        conn.close()

def check_and_unlock_achievements(user_id, current_streak):
    """Check and unlock achievements based on current streak"""
    milestones = [1, 3, 7, 14, 30, 60, 100]
    unlocked_achievements = []
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        for milestone in milestones:
            if current_streak >= milestone:
                # Check if already unlocked
                cursor.execute('''
                    SELECT id FROM user_achievements 
                    WHERE user_id = ? AND achievement_type = 'streak' AND milestone = ?
                ''', (user_id, milestone))
                
                if not cursor.fetchone():
                    # Unlock new achievement
                    cursor.execute('''
                        INSERT INTO user_achievements (user_id, achievement_type, milestone)
                        VALUES (?, 'streak', ?)
                    ''', (user_id, milestone))
                    unlocked_achievements.append(milestone)
        
        conn.commit()
        return unlocked_achievements
        
    except Exception as e:
        print(f"Error checking achievements: {e}")
        return []
    finally:
        conn.close()

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if os.path.exists(DATABASE_PATH) else 'not_found'
    })

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user or get existing user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create user if doesn't exist
        cursor.execute('''
            INSERT OR IGNORE INTO users (id, last_active)
            VALUES (?, CURRENT_TIMESTAMP)
        ''', (user_id,))
        
        # Update last active
        cursor.execute('''
            UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'message': 'User created/updated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/streaks', methods=['GET', 'POST'])
def manage_streaks():
    """Get or create daily streaks"""
    try:
        data = request.get_json() if request.method == 'POST' else {}
        user_id = data.get('user_id') if request.method == 'POST' else request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'POST':
            # Create or update daily streak
            date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
            tasks_completed = data.get('tasks_completed', 0)
            points_earned = data.get('points_earned', 0)
            is_completed = data.get('is_completed', True)
            
            cursor.execute('''
                INSERT OR REPLACE INTO daily_streaks 
                (user_id, date, tasks_completed, points_earned, is_completed, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user_id, date, tasks_completed, points_earned, is_completed))
            
            conn.commit()
            
            # Update user stats and check achievements
            stats = update_user_stats(user_id)
            unlocked_achievements = check_and_unlock_achievements(user_id, stats['current_streak'])
            
            return jsonify({
                'success': True,
                'message': 'Streak updated successfully',
                'date': date,
                'stats': stats,
                'unlocked_achievements': unlocked_achievements
            })
            
        else:
            # Get user streaks and stats
            # Get daily streaks for the last 365 days
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            cursor.execute('''
                SELECT date, tasks_completed, points_earned, is_completed
                FROM daily_streaks 
                WHERE user_id = ? AND date BETWEEN ? AND ?
                ORDER BY date DESC
            ''', (user_id, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
            
            streaks = cursor.fetchall()
            streak_data = {
                row['date']: {
                    'tasks_completed': row['tasks_completed'],
                    'points_earned': row['points_earned'],
                    'is_completed': bool(row['is_completed'])
                } for row in streaks
            }
            
            # Get user stats
            cursor.execute('SELECT * FROM user_stats WHERE user_id = ?', (user_id,))
            stats_row = cursor.fetchone()
            
            if stats_row:
                stats = dict(stats_row)
                del stats['user_id']  # Remove user_id from response
            else:
                stats = update_user_stats(user_id) or {}
            
            # Get unlocked achievements
            cursor.execute('''
                SELECT milestone FROM user_achievements 
                WHERE user_id = ? AND achievement_type = 'streak'
                ORDER BY milestone
            ''', (user_id,))
            
            achievements = [row['milestone'] for row in cursor.fetchall()]
            
            conn.close()
            
            return jsonify({
                'success': True,
                'streaks': streak_data,
                'stats': stats,
                'achievements': achievements
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/streaks/reset', methods=['POST'])
def reset_user_data():
    """Reset all user data"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Delete all user data
        cursor.execute('DELETE FROM daily_streaks WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM user_achievements WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM user_stats WHERE user_id = ?', (user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'All user data reset successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/streaks/export', methods=['GET'])
def export_user_data():
    """Export user data as JSON"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all user data
        cursor.execute('SELECT * FROM daily_streaks WHERE user_id = ? ORDER BY date', (user_id,))
        streaks = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM user_achievements WHERE user_id = ?', (user_id,))
        achievements = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM user_stats WHERE user_id = ?', (user_id,))
        stats = dict(cursor.fetchone()) if cursor.fetchone() else {}
        
        conn.close()
        
        export_data = {
            'user_id': user_id,
            'export_date': datetime.now().isoformat(),
            'streaks': streaks,
            'achievements': achievements,
            'stats': stats
        }
        
        return jsonify(export_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database on startup
if __name__ == '__main__':
    init_database()
    print("✅ Database initialized successfully!")
    print("🚀 Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)