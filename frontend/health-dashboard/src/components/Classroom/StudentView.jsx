import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Trophy, BookOpen, MessageSquare, UserPlus } from 'lucide-react';

const StudentView = () => {
  const { getToken } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim() || joinCode.length !== 6) {
      alert('Please enter a valid 6-character code');
      return;
    }

    setJoining(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/groups/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Successfully joined group!');
        setJoinCode('');
        setShowJoinModal(false);
        fetchGroups();
      } else {
        alert(data.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Groups</h2>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <UserPlus size={20} />
          Join Group
        </button>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Join Group</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the 6-character code provided by your teacher
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., ABC123)"
              maxLength={6}
              className="w-full border rounded-lg px-4 py-3 mb-4 font-mono text-center text-2xl tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <button
                onClick={joinGroup}
                disabled={joining}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? 'Joining...' : 'Join'}
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Groups */}
      {groups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">You haven't joined any groups yet.</p>
          <p>Click "Join Group" and enter a group code to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <h3 className="text-xl font-bold mb-3">{group.name}</h3>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Trophy className="text-yellow-500" size={24} />
                <div>
                  <div className="text-2xl font-bold">{group.myPoints || 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">points</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => window.location.href = `/classroom/group/${group._id}/quizzes`}
                  className="flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 py-2 rounded-lg transition"
                >
                  <BookOpen size={16} />
                  <span className="text-sm">Quizzes</span>
                </button>
                <button
                  onClick={() => window.location.href = `/classroom/group/${group._id}/discussions`}
                  className="flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 py-2 rounded-lg transition"
                >
                  <MessageSquare size={16} />
                  <span className="text-sm">Q&A</span>
                </button>
              </div>
              
              <button
                onClick={() => window.location.href = `/classroom/group/${group._id}/leaderboard`}
                className="w-full flex items-center justify-center gap-2 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 py-2 rounded-lg transition"
              >
                <Trophy size={16} />
                <span className="text-sm">Leaderboard</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentView;
