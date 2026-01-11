import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { DailyStreak, Achievement, UserStats } from '@/models';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Delete all user data
    await Promise.all([
      DailyStreak.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      UserStats.deleteOne({ userId }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'All user data reset successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/streaks/reset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
