import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Navigation from './components/Navigation';
import CalculatorPanel from './components/Calculator';
import Maintenance from './components/Maintenance';
import Procedures from './components/Procedures';

const THEME_KEY = 'distillai_theme';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  // View State
  const [currentView, setCurrentView] = useState<AppView>(AppView.CALCULATOR);

  // --- Effects ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CALCULATOR:
        return <CalculatorPanel isDarkMode={isDarkMode} />;
      case AppView.MAINTENANCE:
        return <Maintenance />;
      case AppView.PROCEDURES:
        return <Procedures />;
      default:
        return <CalculatorPanel isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full relative overflow-hidden">
        {renderContent()}
      </main>

    </div>
  );
};

export default App;