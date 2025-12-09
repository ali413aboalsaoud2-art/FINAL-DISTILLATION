import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area, ComposedChart, Bar 
} from 'recharts';
import { 
  Thermometer, Activity, Calculator, ArrowRight, 
  FlaskConical, TrendingUp, Droplets, Gauge, Zap, RotateCcw
} from 'lucide-react';
import { 
  SUBSTANCES, generateAntoineData, generateMcCabeThieleData, 
  generateHeatingData, generateRayleighData,
  generateConductivityData, generateFlowData, generatePowerData
} from '../utils/calculations';
import { AntoineParams } from '../types';

// --- Reusable UI Components ---

const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all ${className}`}>
    {children}
  </div>
);

const NavButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 w-full min-h-[80px] ${
      active 
      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-brand-200 dark:ring-brand-800' 
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
    }`}
  >
    <Icon className={`mb-2 ${active ? 'text-brand-500' : 'text-slate-400'}`} size={20} />
    <span className="text-xs font-semibold text-center leading-tight">{label}</span>
  </button>
);

const SliderControl = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  onChange 
}: { label: string, value: number, min: number, max: number, step?: number, unit?: string, onChange: (val: number) => void }) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <span className="text-sm font-mono font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
        {value.toFixed(step < 1 ? 2 : 0)}{unit}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
      />
    </div>
  </div>
);

const FormulaBox = ({ title, formula }: { title: string, formula: string }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 mb-6">
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-2">
      <Calculator size={12} /> {title}
    </p>
    <p className="font-mono text-sm text-slate-700 dark:text-slate-200">{formula}</p>
  </div>
);

// --- Main Calculator Component ---

type ModuleType = 'heating' | 'antoine' | 'conductivity' | 'flow' | 'power' | 'mccabe' | 'batch';

interface CalculatorPanelProps {
  isDarkMode: boolean;
}

const CalculatorPanel: React.FC<CalculatorPanelProps> = ({ isDarkMode }) => {
  const [module, setModule] = useState<ModuleType>('heating');

  // -- Heating State (Temperature) --
  const [t0, setT0] = useState(20);
  const [tMax, setTMax] = useState(100);
  const [k, setK] = useState(0.10);
  const heatingData = useMemo(() => generateHeatingData(t0, tMax, k), [t0, tMax, k]);

  // -- Antoine State (Pressure) --
  const [selectedSubstance, setSelectedSubstance] = useState<AntoineParams>(SUBSTANCES[0]);
  const [pressureTempRange, setPressureTempRange] = useState(120);
  const antoineData = useMemo(() => generateAntoineData(selectedSubstance, 0, pressureTempRange), [selectedSubstance, pressureTempRange]);

  // -- Conductivity State --
  const [condInit, setCondInit] = useState(150);
  const [condFinal, setCondFinal] = useState(2);
  const [condRate, setCondRate] = useState(0.15);
  const condData = useMemo(() => generateConductivityData(condInit, condFinal, condRate), [condInit, condFinal, condRate]);

  // -- Flow State --
  const [flowPower, setFlowPower] = useState(2000);
  const [flowEff, setFlowEff] = useState(0.85);
  const flowData = useMemo(() => generateFlowData(flowPower, flowEff), [flowPower, flowEff]);

  // -- Power State --
  const [powerWatts, setPowerWatts] = useState(2000);
  const [powerCost, setPowerCost] = useState(0.15);
  const powerData = useMemo(() => generatePowerData(powerWatts, powerCost), [powerWatts, powerCost]);

  // -- McCabe-Thiele State --
  const [alpha, setAlpha] = useState(2.5);
  const [refluxRatio, setRefluxRatio] = useState(2.0);
  const [distillatePurity, setDistillatePurity] = useState(0.95);
  const mccabeData = useMemo(() => generateMcCabeThieleData(alpha, refluxRatio, distillatePurity), [alpha, refluxRatio, distillatePurity]);

  // -- Batch State --
  const [batchAlpha, setBatchAlpha] = useState(3.0);
  const [batchXf, setBatchXf] = useState(0.5);
  const batchData = useMemo(() => generateRayleighData(batchAlpha, 100, batchXf), [batchAlpha, batchXf]);


  // Helper Functions
  const handleReset = () => {
    if (module === 'heating') { setT0(20); setTMax(100); setK(0.10); }
    if (module === 'antoine') { setSelectedSubstance(SUBSTANCES[0]); setPressureTempRange(120); }
    if (module === 'conductivity') { setCondInit(150); setCondFinal(2); setCondRate(0.15); }
    if (module === 'flow') { setFlowPower(2000); setFlowEff(0.85); }
    if (module === 'power') { setPowerWatts(2000); setPowerCost(0.15); }
    if (module === 'mccabe') { setAlpha(2.5); setRefluxRatio(2.0); setDistillatePurity(0.95); }
    if (module === 'batch') { setBatchAlpha(3.0); setBatchXf(0.5); }
  };

  const MetricItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="flex flex-col">
       <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{label}</span>
       <span className={`text-lg font-bold ${color}`}>{value ?? '-'}</span>
    </div>
  );

  // Theme Constants for Charts
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const axisTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipColor = isDarkMode ? '#f8fafc' : '#1e293b';
  const tooltipBorder = isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0';

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
               Distillation Formulas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Interactive parameter modeling and visualization
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Operational Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <NavButton 
            active={module === 'heating'} 
            onClick={() => setModule('heating')} 
            icon={Thermometer} 
            label="Temperature" 
          />
          <NavButton 
            active={module === 'antoine'} 
            onClick={() => setModule('antoine')} 
            icon={Gauge} 
            label="Pressure" 
          />
          <NavButton 
            active={module === 'conductivity'} 
            onClick={() => setModule('conductivity')} 
            icon={Activity} 
            label="Conductivity" 
          />
          <NavButton 
            active={module === 'flow'} 
            onClick={() => setModule('flow')} 
            icon={Droplets} 
            label="Flow Rate" 
          />
          <NavButton 
            active={module === 'power'} 
            onClick={() => setModule('power')} 
            icon={Zap} 
            label="Power Use" 
          />
        </div>
        
        {/* Advanced Tools Section */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center mr-2 hidden md:block">Advanced:</span>
           <button 
             onClick={() => setModule('mccabe')} 
             className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
               module === 'mccabe' 
               ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
               : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
             }`}
           >
             McCabe-Thiele
           </button>
           <button 
             onClick={() => setModule('batch')} 
             className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
               module === 'batch' 
               ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800' 
               : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
             }`}
           >
             Batch Distillation
           </button>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Controls Panel */}
          <Card className="lg:col-span-4 p-6 lg:sticky lg:top-6 z-10 h-fit">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {module === 'heating' && <><Thermometer className="text-brand-500" size={20}/> Temperature</>}
                {module === 'antoine' && <><Gauge className="text-purple-500" size={20}/> Vapor Pressure</>}
                {module === 'conductivity' && <><Activity className="text-emerald-500" size={20}/> Conductivity</>}
                {module === 'flow' && <><Droplets className="text-blue-500" size={20}/> Flow Rate</>}
                {module === 'power' && <><Zap className="text-yellow-500" size={20}/> Power Consumption</>}
                {module === 'mccabe' && <><FlaskConical className="text-indigo-500" size={20}/> Column Design</>}
                {module === 'batch' && <><TrendingUp className="text-pink-500" size={20}/> Batch Process</>}
              </h2>
            </div>

            {/* Dynamic Controls based on Module */}
            <div className="space-y-6">
              
              {module === 'heating' && (
                <>
                  <FormulaBox title="Heating Law" formula="T(t) = T₀ + (Tₘₐₓ - T₀) × (1 - e⁻ᵏᵗ)" />
                  <SliderControl label="Initial Temp (T₀)" value={t0} min={0} max={100} unit="°C" onChange={setT0} />
                  <SliderControl label="Max Temp (Tₘₐₓ)" value={tMax} min={50} max={150} unit="°C" onChange={setTMax} />
                  <SliderControl label="Rate Constant (k)" value={k} min={0.01} max={0.3} step={0.01} onChange={setK} />
                </>
              )}

              {module === 'antoine' && (
                <>
                  <FormulaBox title="Antoine Equation" formula="log₁₀(P) = A - (B / (T + C))" />
                   <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Select Substance</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBSTANCES.map(s => (
                        <button
                          key={s.name}
                          onClick={() => setSelectedSubstance(s)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                            selectedSubstance.name === s.name 
                            ? 'bg-purple-600 text-white shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SliderControl label="Max Temp (°C)" value={pressureTempRange} min={50} max={250} step={10} onChange={setPressureTempRange} />
                </>
              )}

              {module === 'conductivity' && (
                <>
                  <FormulaBox title="Purification Model" formula="C(t) = Cₛ + (C₀ - Cₛ) × e⁻ᵏᵗ" />
                  <SliderControl label="Initial Conductivity (µS)" value={condInit} min={50} max={500} unit="µS" onChange={setCondInit} />
                  <SliderControl label="Steady State (µS)" value={condFinal} min={0} max={10} step={0.1} unit="µS" onChange={setCondFinal} />
                  <SliderControl label="Cleaning Rate (k)" value={condRate} min={0.05} max={0.5} step={0.01} onChange={setCondRate} />
                </>
              )}

              {module === 'flow' && (
                <>
                  <FormulaBox title="Production Rate" formula="Flow ∝ (Power × Efficiency) / Hᵥₐₚ" />
                  <SliderControl label="Heater Power" value={flowPower} min={500} max={5000} step={100} unit="W" onChange={setFlowPower} />
                  <SliderControl label="System Efficiency" value={flowEff} min={0.5} max={0.99} step={0.01} unit="" onChange={setFlowEff} />
                </>
              )}

              {module === 'power' && (
                <>
                  <FormulaBox title="Cost Accumulation" formula="Cost = ∫(P × Price) dt" />
                  <SliderControl label="Power Usage" value={powerWatts} min={500} max={5000} step={100} unit="W" onChange={setPowerWatts} />
                  <SliderControl label="Elec. Cost ($/kWh)" value={powerCost} min={0.05} max={0.50} step={0.01} unit="$" onChange={setPowerCost} />
                </>
              )}

              {module === 'mccabe' && (
                <>
                  <FormulaBox title="Operating Line" formula="y = (R/(R+1))x + (x_d/(R+1))" />
                  <SliderControl label="Relative Volatility (α)" value={alpha} min={1.1} max={5.0} step={0.1} onChange={setAlpha} />
                  <SliderControl label="Reflux Ratio (R)" value={refluxRatio} min={0.5} max={10.0} step={0.1} onChange={setRefluxRatio} />
                  <SliderControl label="Distillate Purity (x_D)" value={distillatePurity} min={0.5} max={0.99} step={0.01} onChange={setDistillatePurity} />
                </>
              )}

              {module === 'batch' && (
                <>
                   <FormulaBox title="Rayleigh Equation" formula="ln(F/W) = ∫(dx / (y - x))" />
                  <SliderControl label="Relative Volatility (α)" value={batchAlpha} min={1.5} max={8.0} step={0.1} onChange={setBatchAlpha} />
                  <SliderControl label="Initial Feed (x_F)" value={batchXf} min={0.1} max={0.9} step={0.05} onChange={setBatchXf} />
                </>
              )}

            </div>
          </Card>

          {/* RIGHT: Visualization Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Chart Card */}
            <Card className="p-6 h-[500px] flex flex-col">
               <div className="flex items-center justify-between mb-2">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Real-Time Visualization</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {module === 'heating' && "Time vs Temperature (°C)"}
                      {module === 'antoine' && `Temperature vs Vapor Pressure (${selectedSubstance.name})`}
                      {module === 'conductivity' && "Time vs Distillate Conductivity (µS/cm)"}
                      {module === 'flow' && "Time vs Flow Rate & Total Volume"}
                      {module === 'power' && "Time vs Cost & Energy"}
                      {module === 'mccabe' && "McCabe-Thiele Diagram"}
                      {module === 'batch' && "Residue Composition vs % Distilled"}
                    </p>
                 </div>
               </div>

               <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   {module === 'heating' ? (
                     <AreaChart data={heatingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" isAnimationActive={false} />
                     </AreaChart>
                   ) : module === 'antoine' ? (
                      <AreaChart data={antoineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="temperature" label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis label={{ value: 'Pressure (mmHg)', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Area type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorPress)" isAnimationActive={false} />
                        <ReferenceLine y={760} stroke="#ef4444" label="1 atm" strokeDasharray="3 3" />
                      </AreaChart>
                   ) : module === 'conductivity' ? (
                      <AreaChart data={condData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorCond" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis label={{ value: 'Conductivity (µS/cm)', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Area type="monotone" dataKey="conductivity" stroke="#10b981" strokeWidth={3} fill="url(#colorCond)" isAnimationActive={false} />
                      </AreaChart>
                   ) : module === 'flow' ? (
                      <ComposedChart data={flowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" label={{ value: 'Flow (mL/min)', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Total (L)', angle: 90, position: 'insideRight', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Legend verticalAlign="top" height={36}/>
                        <Area yAxisId="left" type="monotone" dataKey="flowRate" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} name="Flow Rate" isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="totalVolume" stroke="#f59e0b" strokeWidth={3} dot={false} name="Total Volume" isAnimationActive={false} />
                      </ComposedChart>
                   ) : module === 'power' ? (
                      <ComposedChart data={powerData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Cost ($)', angle: 90, position: 'insideRight', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Legend verticalAlign="top" height={36}/>
                        <Bar yAxisId="left" dataKey="energy" fill="#eab308" name="Energy (kWh)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#22c55e" strokeWidth={3} dot={false} name="Cost ($)" isAnimationActive={false} />
                      </ComposedChart>
                   ) : module === 'mccabe' ? (
                     <LineChart data={mccabeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.5} />
                        <XAxis dataKey="x" type="number" domain={[0, 1]} label={{ value: 'x (Liquid Phase)', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
                        <YAxis domain={[0, 1]} label={{ value: 'y (Vapor Phase)', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Legend verticalAlign="top" height={36}/>
                        <Line name="y=x" type="monotone" dataKey="xLine" stroke={axisTextColor} strokeDasharray="5 5" strokeWidth={1} dot={false} isAnimationActive={false} />
                        <Line name="Equilibrium" type="monotone" dataKey="yEq" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                        <Line name="Operating Line" type="monotone" dataKey="yOp" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                     </LineChart>
                   ) : (
                      <LineChart data={batchData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="percentDistilled" label={{ value: '% Distilled', position: 'bottom', offset: 0, fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Mole Fraction', angle: -90, position: 'insideLeft', fill: axisTextColor, fontSize: 12 }} tick={{ fill: axisTextColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: tooltipBorder, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} />
                        <Legend verticalAlign="top" height={36}/>
                        <Line name="Residue (x_w)" type="monotone" dataKey="residueComposition" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                        <Line name="Distillate (x_d)" type="monotone" dataKey="distillateComposition" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                      </LineChart>
                   )}
                 </ResponsiveContainer>
               </div>
            </Card>

            {/* Bottom Stats Squares */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 flex items-center justify-between">
                 <MetricItem 
                   label={
                    module === 'heating' ? "Final Temp" :
                    module === 'antoine' ? "Boiling Point" :
                    module === 'conductivity' ? "Final Purity" :
                    module === 'flow' ? "Output Rate" :
                    module === 'power' ? "Total Energy" :
                    module === 'mccabe' ? "Min Reflux (est)" : "Final Purity"
                   }
                   value={
                    module === 'heating' ? `${tMax.toFixed(1)}°C` :
                    module === 'antoine' ? `${(selectedSubstance.B / (selectedSubstance.A - Math.log10(760)) - selectedSubstance.C).toFixed(1)}°C` :
                    module === 'conductivity' ? `${condData[condData.length-1]?.conductivity ?? 0} µS` :
                    module === 'flow' ? `${flowData[flowData.length-1]?.flowRate ?? 0} mL/m` :
                    module === 'power' ? `${powerData[powerData.length-1]?.energy ?? 0} kWh` :
                    module === 'mccabe' ? `${(1/(alpha-1)).toFixed(2)}` :
                    (batchData[batchData.length-1]?.residueComposition ?? 0).toFixed(3)
                   }
                   color="text-slate-800 dark:text-white"
                 />
                 <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full text-slate-500">
                    <Activity size={18} />
                 </div>
              </Card>
              <Card className="p-4 flex items-center justify-between">
                 <MetricItem 
                   label={
                    module === 'heating' ? "Time Constant" :
                    module === 'antoine' ? "Max Pressure" :
                    module === 'conductivity' ? "Reduction" :
                    module === 'flow' ? "Total Vol" :
                    module === 'power' ? "Total Cost" :
                    module === 'mccabe' ? "Alpha" : "Yield"
                   }
                   value={
                    module === 'heating' ? `${(1/k).toFixed(1)} min` :
                    module === 'antoine' ? `${antoineData[antoineData.length-1]?.pressure.toFixed(0)} mmHg` :
                    module === 'conductivity' ? `${((1 - condFinal/condInit)*100).toFixed(0)}%` :
                    module === 'flow' ? `${flowData[flowData.length-1]?.totalVolume ?? 0} L` :
                    module === 'power' ? `$${powerData[powerData.length-1]?.cost ?? 0}` :
                    module === 'mccabe' ? alpha.toFixed(1) :
                    `${(100 - ((batchData[batchData.length-1]?.residueComposition ?? 0) / batchXf * 100)).toFixed(1)}%`
                   }
                   color="text-slate-800 dark:text-white"
                 />
                 <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full text-slate-500">
                    <ArrowRight size={18} />
                 </div>
              </Card>
              <Card className="p-4 flex items-center justify-between">
                 <MetricItem 
                   label="Efficiency"
                   value={module === 'flow' ? `${(flowEff*100).toFixed(0)}%` : "High"}
                   color="text-brand-600 dark:text-brand-400"
                 />
                 <div className="bg-brand-50 dark:bg-brand-900/30 p-2 rounded-full text-brand-600 dark:text-brand-400">
                    <TrendingUp size={18} />
                 </div>
              </Card>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPanel;