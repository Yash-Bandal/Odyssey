import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Group, User } from '@/models';

// GET /api/classroom/groups/[groupId]/leaderboard
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { groupId } = params;

    // Find group
    const group = await Group.findById(groupId);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (teacher or member)
    const isTeacher = group.teacherId === userId;
    const isMember = group.members.some((m) => m.studentId === userId);

    if (!isTeacher && !isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this group' },
        { status: 403 }
      );
    }

    // Get member details
    const memberIds = group.members.map((m) => m.studentId);
    const users = await User.find({ clerkUserId: { $in: memberIds } });

    // Create user map for quick lookup
    const userMap = new Map(
      users.map((u) => [u.clerkUserId, u])
    );

    // Build leaderboard with user details
    const leaderboard = group.members
      .map((member) => {
        const user = userMap.get(member.studentId);
        return {
          studentId: member.studentId,
          name: user?.fullName || user?.username || 'Unknown User',
          email: user?.email,
          profileImage: user?.profileImageUrl,
          points: member.points,
          joinedAt: member.joinedAt,
        };
      })
      .sort((a, b) => b.points - a.points); // Sort by points descending

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return NextResponse.json({
      success: true,
      groupName: group.name,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
