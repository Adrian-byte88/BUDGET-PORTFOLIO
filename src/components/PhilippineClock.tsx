import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function PhilippineClock() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const timeFormatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);

      const dateFormatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(now);

      setTimeStr(timeFormatted);
      setDateStr(dateFormatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900/90 dark:bg-slate-950 text-slate-200 border border-slate-700/60 dark:border-white/10 rounded-full shadow-lg backdrop-blur-md text-[11px] font-mono font-medium select-none transition-all hover:border-indigo-500/50">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      <span className="font-bold text-white tracking-wider">{timeStr}</span>
      <span className="text-slate-400 text-[10px] hidden sm:inline">{dateStr}</span>
      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
        UTC +8 PHILIPPINES
      </span>
    </div>
  );
}
