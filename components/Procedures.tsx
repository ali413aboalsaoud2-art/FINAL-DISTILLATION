import React, { useState } from 'react';
import { Play, BookOpen, AlertOctagon, Check, ArrowRight, Power, ThermometerSnowflake, Droplets } from 'lucide-react';

const SOP_DATA = [
  {
    id: 'startup',
    title: 'System Startup',
    icon: Power,
    color: 'blue',
    steps: [
      'Verify Feed Water Supply: Ensure inlet valve is open and pressure is > 2 bar.',
      'Engage Cooling Water: Open cooling condenser valve. Confirm flow rate at drain.',
      'Check Drain Valve: Ensure boiler drain valve is tightly closed.',
      'Power On Main Breaker: Switch the main isolator to the ON position.',
      'Select Heating Mode: Set controller to AUTO. Heaters should engage within 30 seconds.',
      'Monitor Warm-up: Observe temperature gauge. Boiling should commence in ~15 mins.'
    ]
  },
  {
    id: 'shutdown',
    title: 'Safe Shutdown',
    icon: AlertOctagon,
    color: 'red',
    steps: [
      'Power Off Heaters: Switch heating controller to OFF position.',
      'Cool Down Period: Keep cooling water running for 15 minutes to condense remaining steam.',
      'Power Off Main Breaker: Once boiler temp < 60°C, turn off main isolator.',
      'Close Cooling Valve: Shut off cooling water supply.',
      'Close Feed Valve: Isolate feed water supply.'
    ]
  },
  {
    id: 'cleaning',
    title: 'Acid Cleaning',
    icon: Droplets,
    color: 'orange',
    steps: [
      'Isolate System: Ensure power is OFF and system is cool.',
      'Drain Boiler: Fully open drain valve to empty old water.',
      'Prepare Solution: Mix 1L of 10% Citric Acid solution.',
      'Fill Boiler: Close drain. Pour acid solution into boiler through inspection port.',
      'Soak: Allow to soak for 4 hours (or overnight for heavy scale).',
      'Flush: Drain acid. Fill and flush with tap water 3 times before restarting.'
    ]
  }
];

const Procedures: React.FC = () => {
  const [activeProcedure, setActiveProcedure] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const selectedSop = SOP_DATA.find(s => s.id === activeProcedure);

  const handleStart = (id: string) => {
    setActiveProcedure(id);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (selectedSop && currentStep < selectedSop.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setActiveProcedure(null); // Finish
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-hidden flex flex-col">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
        
        {/* Header (Only visible if not in active mode) */}
        {!activeProcedure && (
          <header className="mb-10 animate-in fade-in slide-in-from-top-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Standard Procedures</h1>
            <p className="text-slate-500 dark:text-slate-400">Approved operational protocols for water distillation safety and efficiency.</p>
          </header>
        )}

        {/* Card Grid */}
        {!activeProcedure ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in delay-100">
            {SOP_DATA.map((sop) => (
              <div key={sop.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${sop.color}-100 dark:bg-${sop.color}-900/30 text-${sop.color}-600 dark:text-${sop.color}-400 group-hover:scale-110 transition-transform`}>
                  <sop.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{sop.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                  {sop.steps.length} Step Protocol • {sop.steps.length * 5} min est.
                </p>
                <button 
                  onClick={() => handleStart(sop.id)}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-brand-600 dark:hover:bg-brand-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Start Procedure <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Active Procedure Focus Mode */
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
               <button 
                 onClick={() => setActiveProcedure(null)}
                 className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
               >
                 ← Cancel
               </button>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                 Step {currentStep + 1} of {selectedSop?.steps.length}
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-center mb-8">
               <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-2 bg-${selectedSop?.color}-500`}></div>
                  
                  <div className="mb-8 flex justify-center">
                    <div className={`w-20 h-20 rounded-full bg-${selectedSop?.color}-100 dark:bg-${selectedSop?.color}-900/30 flex items-center justify-center text-${selectedSop?.color}-600 dark:text-${selectedSop?.color}-400`}>
                       <BookOpen size={32} />
                    </div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                    {selectedSop?.steps[currentStep].split(':')[0]}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {selectedSop?.steps[currentStep].split(':')[1] || selectedSop?.steps[currentStep]}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${selectedSop?.color}-500 transition-all duration-300`} 
                    style={{ width: `${((currentStep) / (selectedSop?.steps.length || 1)) * 100}%` }}
                  ></div>
               </div>
               <button 
                 onClick={handleNext}
                 className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${
                   currentStep === (selectedSop?.steps.length || 0) - 1 
                   ? 'bg-green-600 hover:bg-green-700' 
                   : 'bg-brand-600 hover:bg-brand-700'
                 }`}
               >
                 {currentStep === (selectedSop?.steps.length || 0) - 1 ? (
                   <>Finish <Check size={20} /></>
                 ) : (
                   <>Next <ArrowRight size={20} /></>
                 )}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Procedures;
