// import React from 'react';
// import { Sun, Moon } from 'lucide-react';
// import { useTheme } from '../hooks/useTheme';

// const Header = () => {
//     const { theme, toggleTheme } = useTheme();

//     return (
//         // <header className="w-full px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//         <header className="w-full px-6 py-4 bg-white dark:bg-[#0f1724] border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//             <h1 className="text-xl font-semibold text-gray-800 dark:text-white">YB-Productions</h1>
//             <button
//                 onClick={toggleTheme}
//                 className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
//             >
//                 {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-800" />}
//             </button>
//         </header>
//     );
// };

// export default Header;

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full px-6 py-4 
        bg-white dark:bg-[#0f1724] 
        border-b border-gray-200 dark:border-gray-700 
        sticky top-0 z-50 
        flex justify-between items-center shadow-sm">
      
      {/* Brand / Title */}
      <h1 className="text-xl font-semibold tracking-wide">
        <span className="text-gray-900 dark:text-white">YB</span>{" "}
        <span className="text-blue-600 dark:text-blue-400">Productions</span>
      </h1>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full 
          bg-gray-200 dark:bg-gray-700 
          hover:rotate-12 hover:scale-110 
          transition-all duration-300 shadow-md"
      >
        {theme === 'dark' 
          ? <Sun size={20} className="text-yellow-400" /> 
          : <Moon size={20} className="text-gray-700" />}
      </button>
    </header>
  );
};

export default Header;
