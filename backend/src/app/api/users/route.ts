import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    // Fetch complete user data from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    await connectDB();

    // Get role from request body (optional, for initial setup)
    const body = await request.json().catch(() => ({}));
    const { role } = body;

    // Extract user information from Clerk
    const userData: any = {
      clerkUserId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
      username: clerkUser.username || undefined,
      profileImageUrl: clerkUser.imageUrl || undefined,
      lastActive: new Date(),
      updatedAt: new Date(),
    };

    // Only set role if provided and valid
    if (role && (role === 'student' || role === 'teacher')) {
      userData.role = role;
    }

    // Create or update user in MongoDB with complete Clerk data
    const user = await User.findOneAndUpdate(
      { clerkUserId: userId },
      userData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log('User updated with role:', user.role);

    return NextResponse.json({
      success: true,
      user_id: userId,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
      message: 'User created/updated successfully in MongoDB',
    });
  } catch (error) {
    console.error('Error in /api/users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user from MongoDB
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
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        clerkUserId: user.clerkUserId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
