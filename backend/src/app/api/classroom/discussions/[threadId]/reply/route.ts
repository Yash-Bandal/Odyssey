import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Thread, Group, User } from '@/models';

// POST /api/classroom/discussions/[threadId]/reply - Reply to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
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

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { threadId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    // Get thread
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Verify user has access to group
    const group = await Group.findById(thread.groupId);
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

    // Add reply to thread
    const reply = {
      authorId: userId,
      authorName: user.fullName || user.username || 'Anonymous',
      content: content.trim(),
      timestamp: new Date(),
    };

    thread.replies.push(reply);
    thread.updatedAt = new Date();
    await thread.save();

    // Award +5 points to the replier (only for students)
    if (user.role === 'student' && isMember) {
      await Group.updateOne(
        {
          _id: thread.groupId,
          'members.studentId': userId,
        },
        {
          $inc: { 'members.$.points': 5 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reply posted successfully',
      pointsAwarded: user.role === 'student' && isMember ? 5 : 0,
      reply: {
        authorId: reply.authorId,
        authorName: reply.authorName,
        content: reply.content,
        timestamp: reply.timestamp,
      },
    });
  } catch (error) {
    console.error('Error posting reply:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/classroom/discussions/[threadId]/reply - Get thread with all replies
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
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

    const { threadId } = params;

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Verify access
    const group = await Group.findById(thread.groupId);
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
        { error: 'You do not have access to this thread' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      thread: {
        _id: thread._id,
        title: thread.title,
        content: thread.content,
        authorId: thread.authorId,
        authorName: thread.authorName,
        replies: thread.replies.map((r) => ({
          authorId: r.authorId,
          authorName: r.authorName,
          content: r.content,
          timestamp: r.timestamp,
        })),
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
