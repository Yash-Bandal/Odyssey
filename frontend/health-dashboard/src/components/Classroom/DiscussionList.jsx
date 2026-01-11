import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, ArrowLeft, User, Clock, MessageCircle } from 'lucide-react';

const DiscussionList = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, [groupId]);

  const fetchThreads = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/discussions?groupId=${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setThreads(data.threads);
        setGroupName(data.groupName || '');
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const createThread = async () => {
    if (!newThreadContent.trim()) {
      alert('Please enter a question or discussion topic');
      return;
    }

    setCreating(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          content: newThreadContent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewThreadContent('');
        setShowCreateModal(false);
        fetchThreads();
      } else {
        alert(data.error || 'Failed to create thread');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading discussions...</div>;
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Q&A Discussion</h1>
            <p className="text-gray-600 dark:text-gray-400">{groupName}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={20} />
            New Thread
          </button>
        </div>

        {/* Create Thread Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Start a Discussion</h3>
              <textarea
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                placeholder="Ask a question or start a discussion..."
                rows={4}
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={createThread}
                  disabled={creating}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Thread'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewThreadContent('');
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {threads.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="mb-2">No discussions yet.</p>
            <p>Start a conversation by creating a new thread!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => navigate(`/classroom/discussion/${thread._id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <User size={40} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">{thread.authorName}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(thread.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{thread.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MessageCircle size={16} />
                      <span>{thread.replyCount || 0} replies</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <h3 className="font-bold mb-2">💡 Tip:</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Earn +5 points for each helpful reply you post! Share your knowledge and help your classmates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscussionList;
