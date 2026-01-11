import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft, Crown } from 'lucide-react';

const Leaderboard = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [groupId]);

  const fetchLeaderboard = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/groups/${groupId}/leaderboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setGroupName(data.groupName);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-orange-600" size={24} />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-yellow-800 border-2 border-yellow-400';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800 border-2 border-orange-400';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading leaderboard...</div>;
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
            <Trophy className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{groupName}</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No members have earned points yet.</p>
            <p>Start completing quizzes and participating in discussions!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((member) => (
              <div
                key={member.studentId}
                className={`${getRankColor(member.rank)} rounded-lg shadow p-4 transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(member.rank)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{member.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {member.points}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <h3 className="font-bold mb-2">How to earn points:</h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>✅ +5 points for each correct quiz answer</li>
            <li>💬 +5 points for each discussion reply</li>
            <li>🎯 Complete all quizzes to maximize your score!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
