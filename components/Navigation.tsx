import React from 'react';
import { Activity, Wrench, ClipboardList, Droplets, Sun, Moon } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isDarkMode, toggleTheme }) => {
  const navItems = [
    { id: AppView.CALCULATOR, label: 'Analytics & Graphs', icon: Activity },
    { id: AppView.MAINTENANCE, label: 'Maintenance Hub', icon: Wrench },
    { id: AppView.PROCEDURES, label: 'SOP Procedures', icon: ClipboardList },
  ];

  return (
    <div className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-50">
      
      {/* Header */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
           <Droplets className="text-white" size={20} />
        </div>
        <span className="ml-3 font-bold text-lg text-slate-800 dark:text-white hidden lg:block">DistillAI</span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-6 flex flex-col gap-2 px-2 lg:px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center justify-center lg:justify-start p-3 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <item.icon size={22} className={currentView === item.id ? 'animate-pulse-slow' : 'group-hover:scale-110 transition-transform'} />
            <span className="ml-3 hidden lg:block">{item.label}</span>
            
            {/* Active Indicator */}
            {currentView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 hidden lg:block"></div>
            )}
          </button>
        ))}
      </div>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center lg:justify-start p-2 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-0 lg:mr-3 transition-colors ${isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-orange-100 text-orange-500'}`}>
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <span className="text-xs font-medium hidden lg:block">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>
        <p className="text-[10px] text-center lg:text-left text-slate-300 dark:text-slate-600 mt-4 hidden lg:block">
          v2.0 • Water Systems
        </p>
      </div>
    </div>
  );
};

export default Navigation;