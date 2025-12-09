import React, { useState, useRef, useEffect } from 'react';
import { Menu, Send, Image as ImageIcon, X, Trash2, FileSpreadsheet } from 'lucide-react';
import { Message, AppMode, ChatSession, AppView } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { fileToBase64, parseDataFile } from './utils/helpers';
import ChatBubble from './components/ChatBubble';
import ToolsPanel from './components/ToolsPanel';
import CalculatorPanel from './components/Calculator';

const HISTORY_KEY = 'distillai_sessions';
const THEME_KEY = 'distillai_theme';

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'model',
  text: "Hello. I am DistillAI, your distillation operations expert. I can assist with troubleshooting, maintenance, and graph analysis. I keep things concise and professional. How can I help you today?",
  timestamp: Date.now()
};

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    // Default session
    return [{
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [DEFAULT_WELCOME_MESSAGE],
      createdAt: Date.now(),
      lastModified: Date.now()
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions.length > 0 ? sessions[0].id : '';
  });

  // View State (Kept simpler now as there is only one main view)
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);

  // Interaction State
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.EXPERT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);

  // Derived state: current messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];

  // --- Effects ---

  // Handle Theme Change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save Sessions
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Actions ---

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [DEFAULT_WELCOME_MESSAGE],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this chat?")) {
      const newSessions = sessions.filter(s => s.id !== id);
      if (newSessions.length === 0) {
        // Always keep at least one
        createNewChat();
      } else {
        setSessions(newSessions);
        if (currentSessionId === id) {
          setCurrentSessionId(newSessions[newSessions.length - 1].id);
        }
      }
    }
  };

  const updateCurrentSession = (newMessages: Message[], title?: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        // Auto-generate title from first user message if it's "New Chat"
        let newTitle = s.title;
        if (s.title === 'New Chat' && newMessages.length > 1) {
            const firstUserMsg = newMessages.find(m => m.role === 'user');
            if (firstUserMsg) {
                newTitle = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
            }
        }
        
        return {
          ...s,
          messages: newMessages,
          title: newTitle,
          lastModified: Date.now()
        };
      }
      return s;
    }));
  };

  const handleSendMessage = async (text: string = inputText, dataContext?: any[], fileName?: string) => {
    if ((!text.trim() && selectedImages.length === 0 && !dataContext) || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text,
      images: selectedImages,
      chartData: dataContext,
      fileName: fileName,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    updateCurrentSession(updatedMessages);
    
    setInputText('');
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const responseMsg = await sendMessageToGemini(updatedMessages, userMsg.text, userMsg.images, appMode);
      updateCurrentSession([...updatedMessages, responseMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const base64 = await fileToBase64(e.target.files[i]);
        newImages.push(base64);
      }
      setSelectedImages(prev => [...prev, ...newImages]);
      e.target.value = '';
    }
  };

  const handleDataSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const data = await parseDataFile(file);
        if (data.length > 0) {
          const truncatedData = data.slice(0, 100); 
          handleSendMessage(`Uploaded data file: ${file.name}. Please analyze the trends shown in the graph.`, truncatedData, file.name);
        } else {
          alert("Could not parse data from file. Please ensure it is a valid CSV or JSON.");
        }
      } catch (error) {
        console.error("Error parsing data file", error);
        alert("Error parsing file.");
      }
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickPrompt = (text: string) => {
    setInputText(text);
    setIsSidebarOpen(false);
  };
  
  const clearCurrentChat = () => {
      if (window.confirm("Clear current conversation?")) {
        updateCurrentSession([DEFAULT_WELCOME_MESSAGE]);
      }
  };
  
  const setView = (view: AppView) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 relative transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">DistillAI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              {currentView === AppView.CHAT ? (
                 <>
                    {appMode === AppMode.EXPERT ? 'Expert Mode' : 'Search Mode'}
                    <span className={`w-2 h-2 rounded-full ${appMode === AppMode.EXPERT ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                 </>
              ) : (
                 <span className="text-brand-500">Graph Calculator</span>
              )}
            </p>
          </div>
        </div>
        <button 
        onClick={clearCurrentChat}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"
        title="Clear Chat"
        >
        <Trash2 size={20} />
        </button>
      </header>

      {/* Sidebar / Tools */}
      <ToolsPanel 
        currentMode={appMode}
        setMode={setAppMode}
        currentView={currentView}
        setView={setView}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSwitchSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        onQuickPrompt={handleQuickPrompt}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        
        {currentView === AppView.CALCULATOR ? (
            <CalculatorPanel />
        ) : (
        <>
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
            <div className="max-w-3xl mx-auto">
                {messages.map(msg => (
                <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm ml-2 animate-pulse">
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    Thinking...
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            </div>

            {/* Input Area */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 pb-6 z-30 transition-colors">
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
                
                {/* Selected Images Preview */}
                {selectedImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 group">
                        <img src={img} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        <button 
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-90 hover:opacity-100"
                        >
                        <X size={12} />
                        </button>
                    </div>
                    ))}
                </div>
                )}

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2 border border-transparent focus-within:border-brand-300 dark:focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/30 transition-all">
                {/* Image Upload */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    title="Attach Image"
                >
                    <ImageIcon size={20} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
                
                {/* Data File Upload */}
                <button 
                    onClick={() => dataInputRef.current?.click()}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    title="Upload CSV/JSON Data"
                >
                    <FileSpreadsheet size={20} />
                </button>
                <input 
                    type="file" 
                    ref={dataInputRef}
                    onChange={handleDataSelect}
                    accept=".csv,.json"
                    className="hidden"
                />

                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                    placeholder={appMode === AppMode.EXPERT ? "Ask specific distillation questions..." : "Search the web for equipment..."}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                
                <button 
                    onClick={() => handleSendMessage(inputText)}
                    disabled={!inputText.trim() && selectedImages.length === 0}
                    className={`p-2 rounded-full transition-all ${
                    (inputText.trim() || selectedImages.length > 0) 
                        ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                >
                    <Send size={18} />
                </button>
                </div>
                <div className="text-[10px] text-center text-slate-400 dark:text-slate-600 font-medium">
                AI can make mistakes. Check safety protocols.
                </div>
            </div>
            </footer>
        </>
        )}
      </main>

    </div>
  );
};

export default App;