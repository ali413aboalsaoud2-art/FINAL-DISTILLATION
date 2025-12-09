import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { formatTime } from '../utils/helpers';
import { Bot, User, Globe, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Helper to determine keys for charting
  const renderChart = () => {
    if (!message.chartData || message.chartData.length === 0) return null;

    const data = message.chartData;
    const keys = Object.keys(data[0]);
    if (keys.length < 2) return null;

    // Heuristic: Try to find a 'time' or 'date' key for X-Axis, otherwise use first key
    const xAxisKey = keys.find(k => /time|date|hour|minute/i.test(k)) || keys[0];
    const dataKeys = keys.filter(k => k !== xAxisKey);
    const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <div className="mt-3 mb-2 w-full h-64 bg-slate-50 dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1">
           <FileSpreadsheet size={12} /> Data Visualization
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{fontSize: 10, fill: '#64748b'}} 
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{fontSize: 10, fill: '#64748b'}} 
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              width={30}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
              itemStyle={{ fontSize: '12px', color: '#e2e8f0' }}
              labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            {dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-brand-600' : 'bg-slate-700 dark:bg-slate-600'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden w-full ${
            isUser 
              ? 'bg-brand-600 text-white rounded-tr-none' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
          }`}>
            
            {/* Attached Images */}
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.images.map((img, idx) => (
                  <img key={idx} src={img} alt="Attached" className="h-32 w-auto rounded-lg object-cover border border-white/20" />
                ))}
              </div>
            )}

            {/* Attached Chart Data */}
            {renderChart()}

            {/* Text */}
            <div className={`markdown-content ${isUser ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
            
            {/* Grounding / Sources */}
            {message.groundingMetadata?.groundingChunks && message.groundingMetadata.groundingChunks.length > 0 && (
               <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                   <Globe size={12} /> Sources
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {message.groundingMetadata.groundingChunks.map((chunk, idx) => {
                     if (chunk.web?.uri) {
                       return (
                         <a 
                           key={idx} 
                           href={chunk.web.uri} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-md transition-colors truncate max-w-[200px]"
                         >
                           <ExternalLink size={10} />
                           {chunk.web.title || new URL(chunk.web.uri).hostname}
                         </a>
                       );
                     }
                     return null;
                   })}
                 </div>
               </div>
            )}

          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
