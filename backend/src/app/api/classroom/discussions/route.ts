import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Thread, Group, User } from '@/models';

// POST /api/classroom/discussions - Create a new discussion thread
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

    const body = await request.json();
    const { groupId, content } = body;

    if (!groupId || !content) {
      return NextResponse.json(
        { error: 'groupId and content are required' },
        { status: 400 }
      );
    }

    // Verify user is member of group
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const isTeacher = group.teacherId === userId;
    const isMember = group.members.some((m) => m.studentId === userId);

    if (!isTeacher && !isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Create thread
    const thread = await Thread.create({
      groupId,
      title: '', // Explicitly set empty title
      content,
      authorId: userId,
      authorName: user.fullName || user.username || 'Anonymous',
      replies: [],
    });

    return NextResponse.json({
      success: true,
      thread: {
        _id: thread._id,
        content: thread.content,
        authorName: thread.authorName,
        replyCount: 0,
        createdAt: thread.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/classroom/discussions?groupId=xxx - Get all discussions for a group
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

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      );
    }

    // Verify access
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const isTeacher = group.teacherId === userId;
    const isMember = group.members.some((m) => m.studentId === userId);

    if (!isTeacher && !isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this group' },
        { status: 403 }
      );
    }

    // Get threads
    const threads = await Thread.find({ groupId }).sort({ updatedAt: -1 });

    const formattedThreads = threads.map((thread) => ({
      _id: thread._id,
      title: thread.title,
      content: thread.content,
      authorId: thread.authorId,
      authorName: thread.authorName,
      replyCount: thread.replies.length,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      threads: formattedThreads,
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
