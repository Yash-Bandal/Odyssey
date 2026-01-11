import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, ArrowLeft, CheckCircle, Clock } from 'lucide-react';

const QuizList = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      // Fetch user role
      const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();
      setUserRole(userData.user.role);

      // Fetch quizzes
      const quizResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/quizzes?groupId=${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const quizData = await quizResponse.json();
      if (quizData.success) {
        setQuizzes(quizData.quizzes);
        setGroupName(quizData.groupName || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading quizzes...</div>;
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
            <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
            <p className="text-gray-600 dark:text-gray-400">{groupName}</p>
          </div>
          {userRole === 'teacher' && (
            <button
              onClick={() => navigate(`/classroom/group/${groupId}/quizzes/create`)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg font-semibold"
            >
              <Plus size={24} />
              Create Quiz
            </button>
          )}
        </div>

        {userRole === 'teacher' && quizzes.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900 border-2 border-green-500 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-green-600 dark:text-green-400 text-5xl">📝</div>
              <div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Create Your First Quiz!</h3>
                <p className="text-green-700 dark:text-green-300 mb-3">Get started by creating a quiz for your students. Add questions, set correct answers, and watch your students learn!</p>
                <button
                  onClick={() => navigate(`/classroom/group/${groupId}/quizzes/create`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Quiz Now
                </button>
              </div>
            </div>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="mb-2">No quizzes available yet.</p>
            {userRole === 'teacher' && <p>Click "Create Quiz" to add your first quiz!</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>📝 {quiz.questions?.length || 0} questions</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Created {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {quiz.submitted && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Show Take Quiz for students */}
                  {!quiz.submitted && (
                    <button
                      onClick={() => navigate(`/classroom/quiz/${quiz._id}/take`)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md flex items-center gap-2"
                    >
                      <BookOpen size={20} />
                      Take Quiz
                    </button>
                  )}
                  
                  {/* Show Already Submitted if quiz is completed */}
                  {quiz.submitted && (
                    <button
                      disabled
                      className="bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-6 py-3 rounded-lg cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Already Submitted
                    </button>
                  )}
                  
                  {/* Show View Submissions for teachers */}
                  {userRole === 'teacher' && (
                    <button
                      onClick={() => navigate(`/classroom/quiz/${quiz._id}/submissions`)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold ml-2"
                    >
                      View Submissions ({quiz.submissionCount || 0})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
