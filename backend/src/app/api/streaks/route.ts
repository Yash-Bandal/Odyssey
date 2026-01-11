import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { DailyStreak, Achievement, UserStats } from '@/models';

// Helper function to calculate user stats
async function updateUserStats(userId: string) {
  try {
    // Get all completed streaks
    const streaks = await DailyStreak.find({
      userId,
      isCompleted: true,
    }).sort({ date: 1 });

    if (streaks.length === 0) {
      return {
        current_streak: 0,
        longest_streak: 0,
        total_active_days: 0,
        total_points: 0,
      };
    }

    // Calculate total points
    const totalPoints = streaks.reduce((sum, streak) => sum + streak.pointsEarned, 0);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);

    const streakDates = new Set(streaks.map(s => s.date));

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (streakDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const streak of streaks) {
      const currentDate = new Date(streak.date);
      
      if (lastDate) {
        const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Update or create user stats
    const stats = await UserStats.findOneAndUpdate(
      { userId },
      {
        totalPoints,
        currentStreak,
        longestStreak,
        totalActiveDays: streaks.length,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_active_days: streaks.length,
      total_points: totalPoints,
    };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
}

// Helper function to check and unlock achievements
async function checkAndUnlockAchievements(userId: string, currentStreak: number) {
  const milestones = [1, 3, 7, 14, 30, 60, 100];
  const unlockedAchievements: number[] = [];

  try {
    for (const milestone of milestones) {
      if (currentStreak >= milestone) {
        // Try to create achievement (will fail silently if already exists due to unique index)
        try {
          await Achievement.create({
            userId,
            achievementType: 'streak',
            milestone,
          });
          unlockedAchievements.push(milestone);
        } catch (error: any) {
          // Ignore duplicate key errors
          if (error.code !== 11000) {
            console.error('Error creating achievement:', error);
          }
        }
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// GET /api/streaks - Get user streaks and stats
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get streaks for last 365 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const streaks = await DailyStreak.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    }).sort({ date: -1 });

    // Convert to object format
    const streakData: Record<string, any> = {};
    streaks.forEach(streak => {
      streakData[streak.date] = {
        tasks_completed: streak.tasksCompleted,
        points_earned: streak.pointsEarned,
        is_completed: streak.isCompleted,
      };
    });

    // Get user stats
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      const calculatedStats = await updateUserStats(userId);
      stats = await UserStats.findOne({ userId });
    }

    // Get achievements
    const achievements = await Achievement.find({
      userId,
      achievementType: 'streak',
    }).sort({ milestone: 1 });

    const achievementMilestones = achievements.map(a => a.milestone);

    return NextResponse.json({
      success: true,
      streaks: streakData,
      stats: {
        current_streak: stats?.currentStreak || 0,
        longest_streak: stats?.longestStreak || 0,
        total_active_days: stats?.totalActiveDays || 0,
        total_points: stats?.totalPoints || 0,
      },
      achievements: achievementMilestones,
    });
  } catch (error) {
    console.error('Error in GET /api/streaks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/streaks - Save streak data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      date = new Date().toISOString().split('T')[0],
      tasks_completed = 0,
      points_earned = 0,
      is_completed = true,
    } = body;

    await connectDB();

    // Create or update daily streak
    const streak = await DailyStreak.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        tasksCompleted: tasks_completed,
        pointsEarned: points_earned,
        isCompleted: is_completed,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Update user stats
    const stats = await updateUserStats(userId);

    // Check for new achievements
    const unlockedAchievements = stats 
      ? await checkAndUnlockAchievements(userId, stats.current_streak)
      : [];

    return NextResponse.json({
      success: true,
      message: 'Streak updated successfully',
      date,
      stats: stats || {},
      unlocked_achievements: unlockedAchievements,
    });
  } catch (error) {
    console.error('Error in POST /api/streaks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
