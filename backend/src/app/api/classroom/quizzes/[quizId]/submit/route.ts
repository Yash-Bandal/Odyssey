import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Quiz, Submission, Group, User } from '@/models';

// POST /api/classroom/quizzes/[quizId]/submit - Submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
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
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit quizzes' },
        { status: 403 }
      );
    }

    const { quizId } = params;
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    // Get quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isActive) {
      return NextResponse.json(
        { error: 'Quiz not found or inactive' },
        { status: 404 }
      );
    }

    // Verify student is in the group
    const group = await Group.findById(quiz.groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const isMember = group.members.some((m) => m.studentId === userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      quizId,
      studentId: userId,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this quiz' },
        { status: 400 }
      );
    }

    // Validate answers length
    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { error: 'Number of answers must match number of questions' },
        { status: 400 }
      );
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOptionIndex) {
        correctCount++;
      }
    });

    const pointsEarned = correctCount * 5; // 5 points per correct answer

    // Create submission
    const submission = await Submission.create({
      quizId,
      studentId: userId,
      groupId: quiz.groupId,
      answers,
      score: pointsEarned,
      totalQuestions: quiz.questions.length,
    });

    // Update student's points in group using atomic operation
    await Group.updateOne(
      {
        _id: quiz.groupId,
        'members.studentId': userId,
      },
      {
        $inc: { 'members.$.points': pointsEarned },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        correctAnswers: correctCount,
        pointsEarned,
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/classroom/quizzes/[quizId]/submit - Get quiz for taking (student view)
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
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

    const { quizId } = params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isActive) {
      return NextResponse.json(
        { error: 'Quiz not found or inactive' },
        { status: 404 }
      );
    }

    // Check if already submitted
    const submission = await Submission.findOne({
      quizId,
      studentId: userId,
    });

    if (submission) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
      });
    }

    // Return quiz without correct answers
    const questionsForStudent = quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({
      success: true,
      alreadySubmitted: false,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: questionsForStudent,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
