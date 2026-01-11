import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

const QuizTaker = () => {
  const { quizId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/quizzes/${quizId}/submit`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        if (data.alreadySubmitted) {
          alert('You have already submitted this quiz');
          navigate('/classroom');
        } else {
          setQuiz(data.quiz);
        }
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionIndex, optionIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex,
    });
  };

  const submitQuiz = async () => {
    const answersArray = quiz.questions.map((_, index) => answers[index] ?? -1);

    const unanswered = answersArray.filter((a) => a === -1).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classroom/quizzes/${quizId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: answersArray }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setScore(data.score);
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-center py-12">Quiz not found</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <h1 className="text-3xl font-bold mb-4">Quiz Submitted!</h1>
          <div className="mb-6">
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {score}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              out of {quiz.questions.length * 5} points
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You earned {score} points! Keep it up! 🎉
          </p>
          <button
            onClick={() => navigate('/classroom')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Classroom
          </button>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {quiz.questions.length} questions • {quiz.questions.length * 5} points possible
          </p>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">
                Question {qIndex + 1}: {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      answers[qIndex] === oIndex
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => selectAnswer(qIndex, oIndex)}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={submitQuiz}
            disabled={submitting}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Send size={20} />
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
