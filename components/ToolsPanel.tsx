import React from 'react';
import { Thermometer, Activity, Settings, BookOpen, Search, Sparkles, Plus, MessageSquare, Moon, Sun, Trash2, Calculator } from 'lucide-react';
import { AppMode, ChatSession, AppView } from '../types';

interface ToolsPanelProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  currentView: AppView;
  setView: (view: AppView) => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSwitchSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onQuickPrompt: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  currentMode, setMode, 
  currentView, setView,
  sessions, currentSessionId, onSwitchSession, onNewChat, onDeleteSession,
  onQuickPrompt, 
  isOpen, onClose, 
  isDarkMode, toggleTheme 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-80 h-full shadow-2xl flex flex-col transition-colors duration-200 animate-in slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="text-brand-600 dark:text-brand-400" /> DistillAI
              </h2>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
           </div>
           
           <button 
             onClick={onNewChat}
             className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-medium transition-colors"
           >
             <Plus size={18} /> New Chat
           </button>
        </div>

        {/* View Switcher */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
           <button 
             onClick={() => setView(AppView.CHAT)}
             className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === AppView.CHAT 
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
             }`}
           >
              <MessageSquare size={16} /> Chat
           </button>
           <button 
             onClick={() => setView(AppView.CALCULATOR)}
             className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === AppView.CALCULATOR
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
             }`}
           >
              <Calculator size={16} /> Graphs
           </button>
        </div>

        {/* Mode Selector */}
        {currentView === AppView.CHAT && (
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">AI Model Mode</label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMode(AppMode.EXPERT)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentMode === AppMode.EXPERT 
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles size={16} className={currentMode === AppMode.EXPERT ? 'text-purple-500' : ''} />
              Expert Reasoning
            </button>
            <button
              onClick={() => setMode(AppMode.SEARCH)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentMode === AppMode.SEARCH 
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Search size={16} className={currentMode === AppMode.SEARCH ? 'text-green-500' : ''} />
              Web Search
            </button>
          </div>
        </div>
        )}

        {/* History List */}
        {currentView === AppView.CHAT && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Chat History</label>
          <div className="space-y-1">
            {sessions.slice().reverse().map(session => (
              <div 
                key={session.id}
                onClick={() => { onSwitchSession(session.id); onClose(); }}
                className={`group flex items-center justify-between w-full px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  session.id === currentSessionId
                  ? 'bg-slate-100 dark:bg-slate-800' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare size={14} className="text-slate-400 flex-shrink-0" />
                  <span className={`text-sm truncate ${
                    session.id === currentSessionId ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {session.title || "Untitled Chat"}
                  </span>
                </div>
                {/* Delete button only visible on hover or if active */}
                {(session.id === currentSessionId || true) && (
                   <button 
                     onClick={(e) => onDeleteSession(e, session.id)}
                     className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={12} />
                   </button>
                )}
              </div>
            ))}
          </div>
        </div>
        )}
        
        {currentView === AppView.CALCULATOR && (
           <div className="flex-1 p-4 flex flex-col items-center justify-center text-center opacity-50">
             <Calculator size={48} className="text-slate-300 mb-4" />
             <p className="text-sm text-slate-500">Interactive tools active</p>
           </div>
        )}

        {/* Quick Actions (only show if in chat view) */}
        {currentView === AppView.CHAT && (
          <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Quick Actions</label>
            <div className="space-y-1">
              <button onClick={() => onQuickPrompt("Predict output for a simple water distillation setup: 5L tap water at 100°C.")} className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2">
                <Thermometer size={14} className="text-orange-500" />
                Predict Output
              </button>
              <button onClick={() => onQuickPrompt("Analyze this graph for efficiency drops.")} className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2">
                <Activity size={14} className="text-blue-500" />
                Analyze Graph
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600 text-center">
          v1.2.0 • Mobile Expert
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel;