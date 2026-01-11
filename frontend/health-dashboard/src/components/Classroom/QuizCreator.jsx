import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

const QuizCreator = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', ''], correctOptionIndex: 0 },
  ]);
  const [creating, setCreating] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', ''], correctOptionIndex: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      // Adjust correctOptionIndex if needed
      if (updated[questionIndex].correctOptionIndex >= updated[questionIndex].options.length) {
        updated[questionIndex].correctOptionIndex = updated[questionIndex].options.length - 1;
      }
      setQuestions(updated);
    }
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const createQuiz = async () => {
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const invalidQuestion = questions.find(
      (q) => !q.question.trim() || q.options.length < 2 || q.options.some((opt) => !opt.trim())
    );

    if (invalidQuestion) {
      alert('Please fill in all questions and at least 2 options for each question');
      return;
    }

    setCreating(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          title,
          questions,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Quiz created successfully!');
        navigate(`/classroom/group/${groupId}/quizzes`);
      } else {
        alert(data.error || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/classroom/group/${groupId}/quizzes`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Quizzes
        </button>
        
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            📝 Create a quiz by adding questions and options. Each question needs at least <strong>2 options</strong>. Click the radio button to mark the correct answer.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 1 Review Quiz"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Enter your question"
                  className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="block text-sm font-medium mb-2">Options (select the correct answer):</label>
                <div className="space-y-2 mb-4">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctOptionIndex === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                        className="w-4 h-4 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Remove option"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => addOption(qIndex)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus size={16} />
                  Add Option
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add Question
          </button>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={createQuiz}
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={20} />
              {creating ? 'Creating...' : 'Create Quiz'}
            </button>
            <button
              onClick={() => navigate(`/classroom/group/${groupId}/quizzes`)}
              className="bg-gray-300 dark:bg-gray-600 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
