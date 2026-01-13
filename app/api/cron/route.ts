import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
  if (!SERPAPI_KEY) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

  try {
    const supabase = await createClient();
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: 'best running shoes deals india',
      google_domain: 'google.co.in',
      gl: 'in',
      hl: 'en',
      currency: 'INR',
      api_key: SERPAPI_KEY
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    if (data.shopping_results) {
      const deals = data.shopping_results.slice(0, 10).map((item: any) => ({
        title: item.title,
        price: item.extracted_price,
        image_url: item.thumbnail,
        link: item.link,
        source: item.source,
        currency: 'INR'
      }));

      await supabase.from('daily_deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('daily_deals').insert(deals);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
