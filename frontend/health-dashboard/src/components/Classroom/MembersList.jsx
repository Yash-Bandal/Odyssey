import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Trophy, Calendar } from 'lucide-react';

const MembersList = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/groups/${groupId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
        setGroupName(data.groupName);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading members...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/classroom')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Classroom
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-500" size={32} />
            <h1 className="text-3xl font-bold">Members</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{groupName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Total: {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No members have joined yet.</p>
            <p className="text-sm mt-2">Share your group code to invite students!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member, index) => (
                  <tr key={member.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {(member.studentName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{member.studentName}</div>
                          <div className="text-sm text-gray-500">Member #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-500" />
                        <span className="text-lg font-bold">{member.points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <h3 className="font-bold mb-2">💡 Tip:</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Students earn points by completing quizzes (+5 per correct answer) and participating in discussions (+5 per reply).
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembersList;
