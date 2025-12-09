import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Calendar, Clock, ChevronRight, Save } from 'lucide-react';

const TASKS = [
  {
    id: 1,
    frequency: 'Daily',
    title: 'Visual Leak Inspection',
    desc: 'Inspect feed lines, cooling connections, and boiler drain for moisture.',
    critical: true,
  },
  {
    id: 2,
    frequency: 'Daily',
    title: 'Distillate Purity Check',
    desc: 'Verify conductivity meter reads < 2.0 µS/cm.',
    critical: false,
  },
  {
    id: 3,
    frequency: 'Weekly',
    title: 'Boiler Blowdown',
    desc: 'Drain boiler completely to remove concentrated sludge and mineral deposits.',
    critical: true,
  },
  {
    id: 4,
    frequency: 'Weekly',
    title: 'Vent Filter Inspection',
    desc: 'Check the sterile air vent filter on the storage tank for blockage.',
    critical: false,
  },
  {
    id: 5,
    frequency: 'Monthly',
    title: 'Descaling Cycle',
    desc: 'Perform acid wash using 10% Citric Acid solution. Soak for 4 hours.',
    critical: true,
  },
  {
    id: 6,
    frequency: 'Monthly',
    title: 'Gasket & Seal Check',
    desc: 'Inspect silicone gaskets on the boiler head and condenser for brittleness.',
    critical: false,
  },
  {
    id: 7,
    frequency: 'Quarterly',
    title: 'Heater Element Testing',
    desc: 'Measure resistance across heating elements to ensure even load distribution.',
    critical: true,
  }
];

const STORAGE_KEY = 'distillai_maintenance_checked';

const Maintenance: React.FC = () => {
  // Initialize from local storage if available
  const [checked, setChecked] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save to local storage whenever checked state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggleCheck = (id: number) => {
    setChecked(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getProgress = (freq: string) => {
    const total = TASKS.filter(t => t.frequency === freq).length;
    const completed = TASKS.filter(t => t.frequency === freq && checked.includes(t.id)).length;
    return total === 0 ? 0 : (completed / total) * 100;
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto pb-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Maintenance Hub</h1>
            <p className="text-slate-500 dark:text-slate-400">Track and manage critical service tasks for your distillation unit.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full font-medium">
             <Save size={14} /> Autosave Active
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['Daily', 'Weekly', 'Monthly'].map((freq) => (
            <div key={freq} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{freq} Tasks</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {TASKS.filter(t => t.frequency === freq && checked.includes(t.id)).length} / {TASKS.filter(t => t.frequency === freq).length} Completed
                    </p>
                 </div>
                 <div className={`p-2 rounded-lg ${freq === 'Daily' ? 'bg-blue-100 text-blue-600' : freq === 'Weekly' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Calendar size={18} />
                 </div>
               </div>
               <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${freq === 'Daily' ? 'bg-blue-500' : freq === 'Weekly' ? 'bg-purple-500' : 'bg-orange-500'}`} 
                   style={{ width: `${getProgress(freq)}%` }}
                 ></div>
               </div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="space-y-8">
          {['Daily', 'Weekly', 'Monthly', 'Quarterly'].map((section) => {
            const sectionTasks = TASKS.filter(t => t.frequency === section);
            if (sectionTasks.length === 0) return null;

            return (
              <div key={section} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                   <Clock size={16} className="text-slate-400" />
                   <h2 className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-sm">{section} Protocol</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {sectionTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleCheck(task.id)}
                      className="p-6 flex items-start gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                       <div className={`mt-1 transition-colors ${checked.includes(task.id) ? 'text-green-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                          {checked.includes(task.id) ? <CheckCircle2 size={24} className="fill-current" /> : <Circle size={24} />}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold text-lg transition-all ${checked.includes(task.id) ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                              {task.title}
                            </h3>
                            {task.critical && (
                              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                <AlertTriangle size={10} /> Critical
                              </span>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed ${checked.includes(task.id) ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            {task.desc}
                          </p>
                       </div>
                       <ChevronRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;