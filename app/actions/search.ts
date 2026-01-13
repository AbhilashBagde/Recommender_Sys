'use server';

import { createClient } from '@/lib/supabase/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// Define the interface so TypeScript doesn't complain
export interface ProductMatch {
  title: string;
  price: { amount: number; currency: string };
  thumbnail: string;
  source: string;
  link: string;
}

export async function searchProduct(imageBase64: string): Promise<ProductMatch[]> {
  if (!SERPAPI_API_KEY) throw new Error('SERPAPI_API_KEY is not configured');

  try {
    const supabase = await createClient();
    
    // --- 1. Upload ---
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    // FIX: Handle both "data:image..." prefix and raw base64
    const base64Data = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('product-images') // ✅ Correct bucket name
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    // --- 2. Call SerpApi ---
    const params = new URLSearchParams({
      engine: 'google_lens',
      url: publicUrl,
      api_key: SERPAPI_API_KEY,
      country: 'in',
      currency: 'INR'
    });

    // 🔴 BUG FIX 1: Added ".json" to get data, not HTML
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    // --- 3. Cleanup ---
    await supabase.storage.from('product-images').remove([fileName]);

    // 🔴 BUG FIX 2: Parse the data for the frontend
    if (!data.visual_matches) return [];

    const cleanResults: ProductMatch[] = data.visual_matches
      .filter((item: any) => item.price) // Only keep items with price
      .map((item: any) => ({
        title: item.title,
        price: {
          amount: item.price.extracted_value,
          currency: item.price.currency
        },
        thumbnail: item.thumbnail,
        source: item.source,
        link: item.link
      }));

    return cleanResults; // ✅ Return the clean list

  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search for product');
  }
}
