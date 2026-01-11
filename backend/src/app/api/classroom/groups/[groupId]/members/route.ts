import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Group, User } from '@/models';

// GET /api/classroom/groups/[groupId]/members - Get members list (Teacher only)
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

    // Verify user is teacher
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can view members list' },
        { status: 403 }
      );
    }

    // Get group
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Verify teacher owns this group
    if (group.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You can only view members of your own groups' },
        { status: 403 }
      );
    }

    // Fetch member details
    const memberDetails = await Promise.all(
      group.members.map(async (member) => {
        const studentUser = await User.findOne({ clerkUserId: member.studentId });
        return {
          studentId: member.studentId,
          studentName: studentUser?.fullName || studentUser?.username || 'Unknown User',
          points: member.points,
          joinedAt: member.joinedAt,
        };
      })
    );

    // Sort by points descending
    memberDetails.sort((a, b) => b.points - a.points);

    return NextResponse.json({
      success: true,
      groupName: group.name,
      members: memberDetails,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
