'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Flame, ShoppingCart } from 'lucide-react';

export default function DealsCarousel() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const supabase = createClient();

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('daily_deals')
          .select('*')
          .limit(10);

        if (error) {
          // This prevents the app from crashing if the table is missing
          console.log('Deals table not ready yet, skipping.'); 
          return;
        }

        if (data) setDeals(data);
      } catch (err) {
        console.error('Unexpected error fetching deals:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  // 1. Loading State (Prevents flicker)
  if (loading) return null;

  // 2. Empty State (Prevents showing a blank section)
  if (deals.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-orange-500 w-6 h-6 animate-pulse" /> {/* Added pulse animation */}
        <h3 className="text-xl font-black text-white">HOT DEALS TODAY</h3>
      </div>
      
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
        {deals.map((deal) => (
          <div key={deal.id} className="min-w-[250px] bg-white/5 border border-white/10 rounded-3xl p-4 snap-start hover:border-cyan-400 transition-colors group">
            <div className="relative aspect-square mb-4 bg-white rounded-2xl overflow-hidden p-2">
              <img 
                src={deal.image_url} 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                alt={deal.title}
              />
            </div>
            
            <h4 className="text-white font-bold text-sm line-clamp-2 min-h-[2.5rem] mb-2">
              {deal.title}
            </h4>
            
            <div className="flex justify-between items-center mt-auto">
              {/* FIX: Format the price with commas (e.g., ₹2,299) */}
              <span className="text-cyan-400 font-black text-lg">
                ₹{Number(deal.price).toLocaleString('en-IN')}
              </span>
              
              <a 
                href={deal.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-xl hover:bg-cyan-400 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-black" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
