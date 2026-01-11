import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Quiz, Group, User, Submission } from '@/models';

// POST /api/classroom/quizzes - Create a quiz (Teacher only)
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

    // Verify teacher role
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create quizzes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { groupId, title, description, questions } = body;

    // Validation
    if (!groupId || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Quiz must have at least one question' },
        { status: 400 }
      );
    }

    // Verify group exists and teacher owns it
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (group.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You can only create quizzes for your own groups' },
        { status: 403 }
      );
    }

    // Validate questions format
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        return NextResponse.json(
          { error: `Invalid format for question ${i + 1}` },
          { status: 400 }
        );
      }

      if (q.options.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have at least 2 options` },
          { status: 400 }
        );
      }

      if (
        typeof q.correctOptionIndex !== 'number' ||
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length
      ) {
        return NextResponse.json(
          { error: `Invalid correct option index for question ${i + 1}` },
          { status: 400 }
        );
      }
    }

    // Create quiz
    const quiz = await Quiz.create({
      groupId,
      title,
      description: description || '',
      questions,
      createdBy: userId,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      quiz: {
        _id: quiz._id,
        groupId: quiz.groupId,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt,
        isActive: quiz.isActive,
      },
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/classroom/quizzes?groupId=xxx - Get quizzes for a group
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

    // Verify user has access to group
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

    // Get quizzes
    const quizzes = await Quiz.find({ groupId, isActive: true }).sort({ createdAt: -1 });

    // Get user info for additional data
    const user = await User.findOne({ clerkUserId: userId });
    
    // Format response with submission info
    const formattedQuizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        let submitted = false;
        let submissionCount = 0;

        if (user?.role === 'student') {
          // Check if student has submitted
          const submission = await Submission.findOne({
            quizId: quiz._id,
            studentId: userId,
          });
          submitted = !!submission;
        } else if (user?.role === 'teacher') {
          // Get submission count for teacher
          submissionCount = await Submission.countDocuments({
            quizId: quiz._id,
          });
        }

        return {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          questionCount: quiz.questions.length,
          createdAt: quiz.createdAt,
          submitted,
          submissionCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      groupName: group.name,
      quizzes: formattedQuizzes,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
