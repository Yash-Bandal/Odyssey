import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, Users, BookOpen, Trophy, MessageSquare } from 'lucide-react';

const TeacherView = () => {
  const { getToken } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = await getToken();
      console.log('TeacherView: Fetching groups...'); // Debug log
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('TeacherView: API response:', data); // Debug log
      if (data.success) {
        setGroups(data.groups);
      } else {
        console.error('TeacherView: API returned error:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const token = await getToken();
      console.log('Creating group:', groupName); // Debug log
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });

      const data = await response.json();
      console.log('Create group response:', data); // Debug log
      
      if (data.success) {
        setGroups([...groups, data.group]);
        setGroupName('');
        setShowCreateGroup(false);
        alert(`Group created! Share this code: ${data.group.uniqueCode}`);
      } else {
        console.error('Failed to create group:', data.error);
        alert(`Failed to create group: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Check console for details.');
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
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create New Group
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Group</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name (e.g., CS101 Section A)"
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={createGroup}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateGroup(false);
                  setGroupName('');
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">You haven't created any groups yet.</p>
          <p>Click "Create New Group" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              <div className="flex items-center justify-between mb-2 pb-2 border-b">
                <span className="text-sm text-gray-600 dark:text-gray-400">Group Code:</span>
                <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                  {group.uniqueCode}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <Users size={16} />
                <span>{group.memberCount || 0} members</span>
              </div>
              
              <button
                onClick={() => window.location.href = `/classroom/group/${group._id}/quizzes/create`}
                className="w-full mb-2 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 py-3 rounded-lg transition font-semibold shadow-md"
              >
                <Plus size={20} />
                <span>Create Quiz</span>
              </button>
              
              <button
                onClick={() => window.location.href = `/classroom/group/${group._id}/members`}
                className="w-full mb-2 flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 py-2 rounded-lg transition"
              >
                <Users size={16} />
                <span className="text-sm">View Members</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => window.location.href = `/classroom/group/${group._id}/quizzes`}
                  className="flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 py-2 rounded-lg transition"
                >
                  <BookOpen size={16} />
                  <span className="text-sm">View Quizzes</span>
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

export default TeacherView;
