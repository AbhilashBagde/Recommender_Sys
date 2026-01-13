'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type ProductMatch } from '@/app/actions/search';

interface PriceChartProps {
  results: ProductMatch[];
}

export default function PriceChart({ results }: PriceChartProps) {
  // Take top 8 results for the chart to keep it readable
  const data = results.slice(0, 8).map(item => ({
    name: item.source.length > 10 ? item.source.substring(0, 10) + '...' : item.source,
    price: item.price.amount,
    fullTitle: item.title,
    fullSource: item.source
  }));

  const minPrice = Math.min(...data.map(d => d.price));

  return (
    <div className="w-full h-[300px] bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-10">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        Price Distribution Across Stores
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            interval={0}
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
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
          />
          <Bar dataKey="price" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.price === minPrice ? '#22d3ee' : '#3b82f6'} 
                fillOpacity={entry.price === minPrice ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
