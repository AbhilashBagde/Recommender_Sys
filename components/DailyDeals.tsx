'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Flame, ChevronRight, ShoppingCart } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  price: number;
  image_url: string;
  link: string;
  source: string;
}

export default function DailyDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase
        .from('daily_deals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setDeals(data);
      setLoading(false);
    }
    fetchDeals();
  }, []);

  if (loading) return (
    <div className="w-full h-48 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-800 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-800 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-800 rounded col-span-2"></div>
              <div className="h-2 bg-slate-800 rounded col-span-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (deals.length === 0) return null;

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">TRENDING DEALS</h3>
        </div>
        <button className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors">
          VIEW ALL <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-6 no-scrollbar snap-x">
        {deals.map((deal) => (
          <div 
            key={deal.id}
            className="min-w-[280px] md:min-w-[320px] bg-white/5 border border-white/10 rounded-3xl p-4 snap-start hover:bg-white/[0.08] transition-all group"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              <img 
                src={deal.image_url} 
                alt={deal.title}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white">
                {deal.source}
              </div>
            </div>
            <h4 className="text-white font-bold text-sm line-clamp-2 mb-3 h-10">
              {deal.title}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-cyan-400">₹{deal.price.toLocaleString('en-IN')}</span>
              <a 
                href={deal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black p-2 rounded-xl hover:bg-cyan-400 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
