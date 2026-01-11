import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { DailyStreak, Achievement, UserStats } from '@/models';

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

    // Get all user data
    const [streaks, achievements, stats] = await Promise.all([
      DailyStreak.find({ userId }).sort({ date: 1 }).lean(),
      Achievement.find({ userId }).lean(),
      UserStats.findOne({ userId }).lean(),
    ]);

    const exportData = {
      user_id: userId,
      export_date: new Date().toISOString(),
      streaks: streaks.map(s => ({
        date: s.date,
        tasks_completed: s.tasksCompleted,
        points_earned: s.pointsEarned,
        is_completed: s.isCompleted,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      })),
      achievements: achievements.map(a => ({
        achievement_type: a.achievementType,
        milestone: a.milestone,
        unlocked_at: a.unlockedAt,
      })),
      stats: stats ? {
        total_points: stats.totalPoints,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        total_active_days: stats.totalActiveDays,
        last_updated: stats.lastUpdated,
      } : null,
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error in GET /api/streaks/export:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
