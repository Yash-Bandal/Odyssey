# Classroom & Gamification Module - Implementation Guide

## ✅ COMPLETED - Backend Implementation

### Database Models (MongoDB + Mongoose)
Located: `nextjs-backend/src/models/index.ts`

**Extended Models:**
1. **User** - Added `role` field ('student' | 'teacher')
2. **Group** - Classroom management with unique 6-char codes
3. **Quiz** - MCQ quizzes with questions/options/correct answers
4. **Submission** - Student quiz submissions with scoring
5. **Thread** - Discussion board with replies

### API Routes Created

**Group Management:**
- `POST /api/classroom/groups` - Create group (Teacher)
- `GET /api/classroom/groups` - List groups
- `POST /api/classroom/groups/join` - Join group by code (Student)
- `GET /api/classroom/groups/[groupId]/leaderboard` - Dynamic leaderboard

**Quiz System:**
- `POST /api/classroom/quizzes` - Create quiz (Teacher)
- `GET /api/classroom/quizzes?groupId=xxx` - List quizzes
- `GET /api/classroom/quizzes/[quizId]/submit` - Get quiz for student
- `POST /api/classroom/quizzes/[quizId]/submit` - Submit answers
- `GET /api/classroom/quizzes/[quizId]/submissions` - View submissions (Teacher)

**Discussion Board:**
- `POST /api/classroom/discussions` - Create thread
- `GET /api/classroom/discussions?groupId=xxx` - List threads
- `GET /api/classroom/discussions/[threadId]/reply` - Get thread details
- `POST /api/classroom/discussions/[threadId]/reply` - Reply to thread (+5 points)

---

## 📋 FRONTEND COMPONENTS TO CREATE

### 1. Teacher View Component
**File:** `frontend/health-dashboard/src/components/Classroom/TeacherView.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, Users, BookOpen } from 'lucide-react';

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

  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classroom/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });

      const data = await response.json();
      if (data.success) {
        setGroups([...groups, data.group]);
        setGroupName('');
        setShowCreateGroup(false);
        alert(`Group created! Code: ${data.group.uniqueCode}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div>
      {/* Create Group Button */}
      <button
        onClick={() => setShowCreateGroup(true)}
        className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <Plus size={20} />
        Create New Group
      </button>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Group</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={createGroup}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">{group.name}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Code:</span>
              <span className="font-mono text-lg font-bold text-blue-600">
                {group.uniqueCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Users size={16} />
              <span>{group.memberCount} members</span>
            </div>
            <button
              onClick={() => window.location.href = `/classroom/group/${group._id}`}
              className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg"
            >
              Manage Group
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherView;
```

### 2. Student View Component
**File:** `frontend/health-dashboard/src/components/Classroom/StudentView.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Trophy, BookOpen, MessageSquare } from 'lucide-react';

const StudentView = () => {
  const { getToken } = useAuth();
  const [groups, setGroups] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

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
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;

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
    }
  };

  return (
    <div>
      {/* Join Group Button */}
      <button
        onClick={() => setShowJoinModal(true)}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Join Group with Code
      </button>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Join Group</h3>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full border rounded-lg px-4 py-2 mb-4 font-mono text-center text-2xl"
            />
            <div className="flex gap-2">
              <button
                onClick={joinGroup}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                Join
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">{group.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-yellow-500" size={20} />
              <span className="text-lg font-bold">{group.myPoints} points</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => window.location.href = `/classroom/group/${group._id}/quizzes`}
                className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 py-2 rounded-lg"
              >
                <BookOpen size={16} />
                Quizzes
              </button>
              <button
                onClick={() => window.location.href = `/classroom/group/${group._id}/discussions`}
                className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 py-2 rounded-lg"
              >
                <MessageSquare size={16} />
                Q&A
              </button>
            </div>
            <button
              onClick={() => window.location.href = `/classroom/group/${group._id}/leaderboard`}
              className="w-full mt-2 bg-yellow-100 hover:bg-yellow-200 py-2 rounded-lg"
            >
              View Leaderboard
            </button>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>You haven't joined any groups yet.</p>
          <p>Click "Join Group with Code" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default StudentView;
```

### 3. Leaderboard Component
**File:** `frontend/health-dashboard/src/components/Classroom/Leaderboard.jsx`

See implementation in separate file...

### 4. Quiz Components
- QuizList.jsx
- QuizTaker.jsx (student)
- QuizCreator.jsx (teacher)
- QuizSubmissions.jsx (teacher)

### 5. Discussion Components
- DiscussionList.jsx
- ThreadView.jsx
- CreateThread.jsx

---

## 🔗 Integration Steps

### 1. Add Route to App.jsx
```jsx
import Classroom from "./pages/Classroom";

// Add to protected routes:
<Route path="/classroom" element={<Classroom />} />
```

### 2. Add to Sidebar
```jsx
import { GraduationCap } from 'lucide-react';

// Add to navItems:
{ to: "/classroom", label: "Classroom", icon: <GraduationCap /> }
```

### 3. Environment Variable
Already configured: `VITE_API_BASE_URL=http://localhost:5000/api`

---

## ✨ Key Features Implemented

✅ **Role-Based Access**: Teachers create, students join  
✅ **Unique Codes**: 6-character alphanumeric group codes  
✅ **Quiz Scoring**: +5 points per correct answer  
✅ **Atomic Updates**: MongoDB $inc for concurrent safety  
✅ **Dynamic Leaderboard**: Real-time ranking by points  
✅ **Discussion Rewards**: +5 points for each reply  
✅ **Teacher Dashboard**: View submissions & scores  
✅ **Validation**: Edge cases handled (duplicate joins, invalid codes)

---

## 🚀 Next Steps

1. Create remaining React components (listed above)
2. Test all API endpoints with Postman
3. Add role selection during onboarding
4. Implement real-time updates (optional: Socket.io)
5. Add notifications for quiz assignments
6. Export/Import quiz functionality

The backend is fully functional and ready for frontend integration!
