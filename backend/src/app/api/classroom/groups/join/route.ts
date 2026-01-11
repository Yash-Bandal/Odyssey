import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Group, User } from '@/models';

// POST /api/classroom/groups/join - Student joins a group using code
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

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can join groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Group code is required' },
        { status: 400 }
      );
    }

    const uniqueCode = code.toUpperCase().trim();

    // Find group by code
    const group = await Group.findOne({ uniqueCode });

    if (!group) {
      return NextResponse.json(
        { error: 'Invalid group code' },
        { status: 404 }
      );
    }

    // Check if student is already a member
    const alreadyMember = group.members.some(
      (member) => member.studentId === userId
    );

    if (alreadyMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      );
    }

    // Add student to group
    group.members.push({
      studentId: userId,
      points: 0,
      joinedAt: new Date(),
    });

    group.updatedAt = new Date();
    await group.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully joined group',
      group: {
        _id: group._id,
        name: group.name,
        uniqueCode: group.uniqueCode,
        memberCount: group.members.length,
      },
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
