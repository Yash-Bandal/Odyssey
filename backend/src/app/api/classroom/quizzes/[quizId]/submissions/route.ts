import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Quiz, Submission, Group, User } from '@/models';

// GET /api/classroom/quizzes/[quizId]/submissions - View all submissions (Teacher only)
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

    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can view submissions' },
        { status: 403 }
      );
    }

    const { quizId } = params;

    // Get quiz and verify ownership
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const group = await Group.findById(quiz.groupId);
    if (!group || group.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You can only view submissions for your own quizzes' },
        { status: 403 }
      );
    }

    // Get all submissions
    const submissions = await Submission.find({ quizId }).sort({ submittedAt: -1 });

    // Get student details
    const studentIds = submissions.map((s) => s.studentId);
    const students = await User.find({ clerkUserId: { $in: studentIds } });

    const studentMap = new Map(
      students.map((s) => [s.clerkUserId, s])
    );

    // Format submissions with student details
    const formattedSubmissions = submissions.map((sub) => {
      const student = studentMap.get(sub.studentId);
      return {
        _id: sub._id,
        studentId: sub.studentId,
        studentName: student?.fullName || student?.username || 'Unknown',
        studentEmail: student?.email,
        score: sub.score,
        totalQuestions: sub.totalQuestions,
        correctAnswers: sub.score / 5, // 5 points per correct answer
        submittedAt: sub.submittedAt,
      };
    });

    return NextResponse.json({
      success: true,
      quizTitle: quiz.title,
      totalSubmissions: formattedSubmissions.length,
      totalStudents: group.members.length,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
