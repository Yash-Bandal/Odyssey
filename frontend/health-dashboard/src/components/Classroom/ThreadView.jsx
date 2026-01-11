import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, Send } from 'lucide-react';

const ThreadView = () => {
  const { threadId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/discussions/${threadId}/reply`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setThread(data.thread);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const postReply = async () => {
    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    setReplying(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/discussions/${threadId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: replyContent }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setReplyContent('');
        fetchThread();
        alert('Reply posted! You earned 5 points! 🎉');
      } else {
        alert(data.error || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading thread...</div>;
  }

  if (!thread) {
    return <div className="text-center py-12">Thread not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Discussions
        </button>

        {/* Original Thread */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <User size={48} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-lg">{thread.authorName}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(thread.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg">{thread.content}</p>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            Replies ({thread.replies?.length || 0})
          </h2>

          {thread.replies && thread.replies.length > 0 ? (
            <div className="space-y-4">
              {thread.replies.map((reply, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 ml-8"
                >
                  <div className="flex items-start gap-4">
                    <User size={32} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{reply.authorName}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(reply.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p>No replies yet. Be the first to respond!</p>
            </div>
          )}
        </div>

        {/* Reply Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="font-bold mb-3">Post a Reply</h3>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts or answer..."
            rows={4}
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={postReply}
            disabled={replying}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Send size={20} />
            {replying ? 'Posting...' : 'Post Reply (+5 points)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadView;
