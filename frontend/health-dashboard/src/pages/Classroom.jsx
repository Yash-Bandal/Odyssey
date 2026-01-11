import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Users, Plus, BookOpen, MessageSquare, Trophy } from 'lucide-react';
import TeacherView from '../components/Classroom/TeacherView';
import StudentView from '../components/Classroom/StudentView';
import RoleSelector from '../components/RoleSelector';

const Classroom = () => {
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User data from API:', data); // Debug log
        setUserRole(data.user.role);
      } else {
        console.error('Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelected = (role) => {
    setUserRole(role);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show role selector if user doesn't have a role
  if (!userRole) {
    return <RoleSelector onRoleSelected={handleRoleSelected} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎓 Classroom
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'teacher'
              ? 'Manage your groups, create quizzes, and track student progress'
              : 'Join groups, take quizzes, and collaborate with peers'}
          </p>
        </div>

        {userRole === 'teacher' ? <TeacherView /> : <StudentView />}
      </div>
    </div>
  );
};

export default Classroom;
