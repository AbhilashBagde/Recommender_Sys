'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Flame, ShoppingCart } from 'lucide-react';

export default function DealsCarousel() {
  const [deals, setDeals] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('daily_deals').select('*').limit(10).then(({ data }) => {
      if (data) setDeals(data);
    });
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-orange-500 w-6 h-6" />
        <h3 className="text-xl font-black text-white">HOT DEALS TODAY</h3>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
        {deals.map((deal) => (
          <div key={deal.id} className="min-w-[250px] bg-white/5 border border-white/10 rounded-3xl p-4 snap-start">
            <img src={deal.image_url} className="w-full h-40 object-contain bg-white rounded-2xl mb-4 p-2" />
            <h4 className="text-white font-bold text-sm line-clamp-1">{deal.title}</h4>
            <div className="flex justify-between items-center mt-4">
              <span className="text-cyan-400 font-black">₹{deal.price}</span>
              <a href={deal.link} target="_blank" className="bg-white p-2 rounded-xl"><ShoppingCart className="w-4 h-4 text-black" /></a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
