import mongoose, { Schema, Model } from 'mongoose';

// User Interface
export interface IUser {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  profileImageUrl?: string;
  role: 'student' | 'teacher';
  createdAt: Date;
  lastActive: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  fullName: {
    type: String,
  },
  username: {
    type: String,
  },
  profileImageUrl: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Daily Streak Interface
export interface IDailyStreak {
  userId: string;
  date: string;
  tasksCompleted: number;
  pointsEarned: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Daily Streak Schema
const DailyStreakSchema = new Schema<IDailyStreak>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for userId and date (unique combination)
DailyStreakSchema.index({ userId: 1, date: 1 }, { unique: true });

// Achievement Interface
export interface IAchievement {
  userId: string;
  achievementType: string;
  milestone: number;
  unlockedAt: Date;
}

// Achievement Schema
const AchievementSchema = new Schema<IAchievement>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  achievementType: {
    type: String,
    required: true,
  },
  milestone: {
    type: Number,
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for unique achievements
AchievementSchema.index({ userId: 1, achievementType: 1, milestone: 1 }, { unique: true });

// User Stats Interface
export interface IUserStats {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastUpdated: Date;
}

// User Stats Schema
const UserStatsSchema = new Schema<IUserStats>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  totalActiveDays: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Export Models
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const DailyStreak: Model<IDailyStreak> = mongoose.models.DailyStreak || mongoose.model<IDailyStreak>('DailyStreak', DailyStreakSchema);
export const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const UserStats: Model<IUserStats> = mongoose.models.UserStats || mongoose.model<IUserStats>('UserStats', UserStatsSchema);

// ==================== CLASSROOM & GAMIFICATION MODELS ====================

// Group Interface
export interface IGroup {
  name: string;
  uniqueCode: string;
  teacherId: string;
  members: Array<{
    studentId: string;
    points: number;
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Group Schema
const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  uniqueCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6,
  },
  teacherId: {
    type: String,
    required: true,
    index: true,
  },
  members: [{
    studentId: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups
GroupSchema.index({ uniqueCode: 1 });
GroupSchema.index({ teacherId: 1 });
GroupSchema.index({ 'members.studentId': 1 });

// Quiz Interface
export interface IQuiz {
  groupId: string;
  title: string;
  description?: string;
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
  }>;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

// Quiz Schema
const QuizSchema = new Schema<IQuiz>({
  groupId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length >= 2;
        },
        message: 'Each question must have at least 2 options',
      },
    },
    correctOptionIndex: {
      type: Number,
      required: true,
    },
  }],
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Submission Interface
export interface ISubmission {
  quizId: string;
  studentId: string;
  groupId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  submittedAt: Date;
}

// Submission Schema
const SubmissionSchema = new Schema<ISubmission>({
  quizId: {
    type: String,
    required: true,
    index: true,
  },
  studentId: {
    type: String,
    required: true,
    index: true,
  },
  groupId: {
    type: String,
    required: true,
    index: true,
  },
  answers: {
    type: [Number],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate submissions
SubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

// Thread Interface
export interface IThread {
  groupId: string;
  title?: string;
  content: string;
  authorId: string;
  authorName: string;
  replies: Array<{
    authorId: string;
    authorName: string;
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Thread Schema
const ThreadSchema = new Schema<IThread>({
  groupId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: false,
    trim: true,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  replies: [{
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Export Classroom Models
export const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
export const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
export const Thread: Model<IThread> = mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);
