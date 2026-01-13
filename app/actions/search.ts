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
  score?: number; // Added score for ranking
}

export async function searchProduct(imageInput: string, isUrl: boolean = false): Promise<ProductMatch[]> {
  if (!SERPAPI_API_KEY) throw new Error('SERPAPI_API_KEY is not configured');

  try {
    const supabase = await createClient();
    let finalImageUrl = '';

    if (isUrl) {
      // If it's already a URL, we can pass it directly to SerpApi
      finalImageUrl = imageInput;
    } else {
      // --- 1. Upload Base64 ---
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const base64Data = imageInput.includes('base64,') ? imageInput.split('base64,')[1] : imageInput;
      const buffer = Buffer.from(base64Data, 'base64');

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      finalImageUrl = publicUrl;
    }

    // --- 2. Call SerpApi ---
    const params = new URLSearchParams({
      engine: 'google_lens',
      url: finalImageUrl,
      api_key: SERPAPI_API_KEY,
      country: 'in',
      currency: 'INR'
    });

    // 🔴 BUG FIX 1: Added ".json" to get data, not HTML
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    // --- 3. Cleanup (Only if we uploaded a file) ---
    if (!isUrl) {
      const fileName = finalImageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('product-images').remove([fileName]);
      }
    }

    // 🔴 BUG FIX 2: Parse the data for the frontend
    if (!data.visual_matches) return [];

    const verifiedStores = ['amazon', 'flipkart', 'myntra', 'ajio', 'tata'];

    const cleanResults: ProductMatch[] = data.visual_matches
      .filter((item: any) => item.price)
      .map((item: any) => {
        const price = item.price.extracted_value;
        const source = item.source?.toLowerCase() || '';
        
        // Ranking Algorithm
        let score = (10000 / (price || 1));
        
        // Bonus Points for Verified Stores
        if (verifiedStores.some(store => source.includes(store))) {
          score += 20;
        }

        return {
          title: item.title,
          price: {
            amount: price,
            currency: item.price.currency
          },
          thumbnail: item.thumbnail,
          source: item.source,
          link: item.link,
          score: score
        };
      });

    // Sort by score descending by default
    return cleanResults.sort((a, b) => (b.score || 0) - (a.score || 0));

  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search for product');
  }
}
