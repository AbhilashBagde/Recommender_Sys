import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export async function GET(request: Request) {
  // Optional: Add a secret key check to prevent unauthorized calls
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  if (!SERPAPI_API_KEY) {
    return NextResponse.json({ error: 'SERPAPI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const supabase = await createClient();

    // Fetch trending deals from Google Shopping via SerpApi
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: 'best sneaker deals india',
      google_domain: 'google.co.in',
      gl: 'in',
      hl: 'en',
      currency: 'INR',
      api_key: SERPAPI_API_KEY
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    if (!data.shopping_results) {
      return NextResponse.json({ message: 'No deals found' });
    }

    // Map and clean the results
    const deals = data.shopping_results.slice(0, 10).map((item: any) => ({
      title: item.title,
      price: item.extracted_price,
      image_url: item.thumbnail,
      link: item.link,
      source: item.source,
      currency: 'INR'
    }));

    // Upsert into Supabase (using title as a simple unique constraint or just clearing and inserting)
    // For simplicity in this MVP, we'll clear old deals and insert new ones
    await supabase.from('daily_deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const { error } = await supabase.from('daily_deals').insert(deals);

    if (error) throw error;

    return NextResponse.json({ success: true, count: deals.length });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
