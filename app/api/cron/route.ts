import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
  // Always good to have a cache control so Vercel doesn't serve old deals
  const dynamic = 'force-dynamic'; 
  
  if (!SERPAPI_KEY) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
  }

  try {
    const supabase = await createClient();
    
    // 1. Fetch Deals from Google Shopping
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: 'best running shoes deals india',
      google_domain: 'google.co.in',
      gl: 'in',
      hl: 'en',
      currency: 'INR',
      api_key: SERPAPI_KEY
    });

    // Add { cache: 'no-store' } to ensure we always get fresh data
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, { cache: 'no-store' });
    const data = await response.json();

    if (data.shopping_results) {
      // 2. Format Data
      const deals = data.shopping_results.slice(0, 10).map((item: any) => ({
        title: item.title,
        // Robust Price Logic: Use extracted_price if available, else clean the string
        price: item.extracted_price ?? (item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0),
        image_url: item.thumbnail,
        link: item.link,
        source: item.source || 'Google Shopping'
        // REMOVED: currency: 'INR' (because your DB table doesn't have this column)
      }));

      // 3. Clear Old Deals (TRUNCATE logic)
      // Fix: Compare 'id' (bigint) to a number (0), not a string
      const { error: deleteError } = await supabase
        .from('daily_deals')
        .delete()
        .neq('id', 0); // Delete everything where ID is not 0 (which is everything)

      if (deleteError) {
        console.error("Error clearing old deals:", deleteError);
      }

      // 4. Insert New Deals
      const { error: insertError } = await supabase
        .from('daily_deals')
        .insert(deals);
        
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: data.shopping_results?.length || 0 });
    
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
