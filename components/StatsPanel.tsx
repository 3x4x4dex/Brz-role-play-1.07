
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ClientData } from '../types';

interface StatsPanelProps {
  data: ClientData[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ data }) => {
  const chartData = useMemo(() => data.slice(0, 10).map(c => ({
    name: (c.user || 'User').substring(0, 8),
    wealth: c.total_wealth
  })), [data]);

  const totalPool = useMemo(() => data.reduce((acc, curr) => acc + curr.total_wealth, 0), [data]);
  const pieData = useMemo(() => [
    { name: 'Top 1', value: data[0]?.total_wealth || 0 },
    { name: 'Elite (2-5)', value: data.slice(1, 5).reduce((a, b) => a + b.total_wealth, 0) },
    { name: 'Others', value: data.slice(5).reduce((a, b) => a + b.total_wealth, 0) }
  ], [data]);

  const COLORS = ['#fbbf24', '#34d399', '#60a5fa'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-emerald-500" /> Distribuição de Fortuna (Top 10)
        </h3>
        {/* Usamos um div com altura fixa para garantir que o ResponsiveContainer tenha referência */}
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#334155" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} 
              />
              <Bar dataKey="wealth" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#fbbf24' : '#10b981'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-8 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-blue-500" /> Concentração de Mercado
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-8 h-[320px]">
          <div className="w-full h-full max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4 w-full">
             {pieData.map((item, idx) => (
               <div key={item.name} className="flex justify-between items-center group">
                 <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                 </div>
                 <span className="text-sm font-black text-white italic">{((item.value/totalPool)*100).toFixed(1)}%</span>
               </div>
             ))}
             <div className="pt-6 border-t border-white/5 mt-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Market Pool</p>
                <p className="text-xl font-black text-white italic">R$ {(totalPool/1000000).toFixed(1)}M+</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
