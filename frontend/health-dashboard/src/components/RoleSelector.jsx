import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { GraduationCap, Users } from 'lucide-react';

const RoleSelector = ({ onRoleSelected, allowTeacherRole = true }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [selecting, setSelecting] = useState(false);

  const selectRole = async (role) => {
    setSelecting(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      if (data.success) {
        onRoleSelected(role);
      } else {
        alert('Failed to set role. Please try again.');
      }
    } catch (error) {
      console.error('Error setting role:', error);
      alert('Failed to set role. Please try again.');
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Odyssey Classroom! 🎓
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Hi {user?.firstName}! Choose your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Teacher Card - Only show if allowed */}
          {allowTeacherRole && (
          <button
            onClick={() => selectRole('teacher')}
            disabled={selecting}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                I'm a Teacher
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create groups, design quizzes, track student progress, and foster collaborative learning
              </p>
              
              <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Create and manage groups
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Design custom quizzes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  View student submissions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Monitor discussions
                </li>
              </ul>
              
              <div className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium group-hover:bg-blue-700 transition">
                {selecting ? 'Setting up...' : 'Continue as Teacher'}
              </div>
            </div>
          </button>
          )}

          {/* Student Card */}
          <button
            onClick={() => selectRole('student')}
            disabled={selecting}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                I'm a Student
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join groups, take quizzes, participate in discussions, and earn points on the leaderboard
              </p>
              
              <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Join groups with codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Take quizzes and earn points
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Participate in Q&A discussions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Compete on leaderboard
                </li>
              </ul>
              
              <div className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-medium group-hover:bg-green-700 transition">
                {selecting ? 'Setting up...' : 'Continue as Student'}
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          {allowTeacherRole 
            ? "Don't worry, you can always contact support to change your role later"
            : "Note: Teacher role registration requires approval. Please contact an administrator."
          }
        </p>
      </div>
    </div>
  );
};

export default RoleSelector;
