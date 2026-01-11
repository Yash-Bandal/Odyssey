import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Group, User } from '@/models';

// Helper function to generate unique 6-character code
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/classroom/groups - Create a new group (Teacher only)
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

    // Check if user is a teacher
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    // Generate unique code
    let uniqueCode = generateUniqueCode();
    let codeExists = await Group.findOne({ uniqueCode });

    // Ensure uniqueness
    while (codeExists) {
      uniqueCode = generateUniqueCode();
      codeExists = await Group.findOne({ uniqueCode });
    }

    // Create group
    const group = await Group.create({
      name: name.trim(),
      uniqueCode,
      teacherId: userId,
      members: [],
    });

    return NextResponse.json({
      success: true,
      group: {
        _id: group._id,
        name: group.name,
        uniqueCode: group.uniqueCode,
        teacherId: group.teacherId,
        memberCount: group.members.length,
        createdAt: group.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/classroom/groups - Get all groups for current user
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

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let groups;

    if (user.role === 'teacher') {
      // Get groups created by this teacher
      groups = await Group.find({ teacherId: userId });
    } else {
      // Get groups where this student is a member
      groups = await Group.find({
        'members.studentId': userId,
      });
    }

    // Format response
    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      uniqueCode: group.uniqueCode,
      teacherId: group.teacherId,
      memberCount: group.members.length,
      myPoints: user.role === 'student' 
        ? group.members.find(m => m.studentId === userId)?.points || 0 
        : null,
      createdAt: group.createdAt,
    }));

    return NextResponse.json({
      success: true,
      role: user.role,
      groups: formattedGroups,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
