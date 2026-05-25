import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => (
    typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark'
  ));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-all backdrop-blur-sm relative"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;

