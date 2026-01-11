// src/pages/ConsistencyTracker.jsx
import React from 'react';
import NoDopaminePanel from "../components/NoDopamine/NoDopaminePanel";


const ConsistencyTracker = () => {
  return (
    <div className="space-y-8 p-6">
      <h1 className='text-[50px]  dark:text-white mb-10'>Habit Manager</h1>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <NoDopaminePanel />
      </div>

    </div>

  );
};

export default ConsistencyTracker;
