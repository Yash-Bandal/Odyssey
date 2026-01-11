import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Trophy } from 'lucide-react';

const QuizSubmissions = () => {
  const { quizId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/quizzes/${quizId}/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
        setQuizTitle(data.quizTitle);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading submissions...</div>;
  }

  const averageScore =
    submissions.length > 0
      ? (submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length).toFixed(1)
      : 0;

  const maxScore = submissions.length > 0 ? Math.max(...submissions.map((s) => s.score)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/classroom')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Classroom
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{quizTitle} - Submissions</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Submissions</div>
              <div className="text-3xl font-bold">{submissions.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</div>
              <div className="text-3xl font-bold">{averageScore}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Score</div>
              <div className="text-3xl font-bold">{maxScore}</div>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p>No submissions yet.</p>
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
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-gray-400" />
                        <span className="font-medium">{submission.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Trophy
                          size={20}
                          className={
                            submission.score === maxScore ? 'text-yellow-500' : 'text-gray-400'
                          }
                        />
                        <span className="text-lg font-bold">{submission.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSubmissions;
