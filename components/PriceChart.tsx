'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type ProductMatch } from '@/app/actions/search';

export default function PriceChart({ data }: { data: ProductMatch[] }) {
  const chartData = data.slice(0, 8).map(item => ({
    name: item.source.length > 10 ? item.source.substring(0, 10) : item.source,
    price: item.price.amount,
    fullSource: item.source
  }));

  const minPrice = Math.min(...chartData.map(d => d.price));

  return (
    <div className="w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        Price Comparison (₹)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            cursor={{ fill: '#ffffff05' }}
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #334155', 
              borderRadius: '12px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#22d3ee' }}
          />
          <Bar dataKey="price" radius={[6, 6, 0, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.price === minPrice ? '#22c55e' : '#334155'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
