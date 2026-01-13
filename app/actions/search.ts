'use server';

import { createClient } from '@/lib/supabase/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export interface ProductMatch {
  title: string;
  price: { amount: number; currency: string };
  thumbnail: string;
  source: string;
  link: string;
  trustScore?: number;
}

export async function searchProduct(imageInput: string, isUrl: boolean = false): Promise<ProductMatch[]> {
  if (!SERPAPI_API_KEY) throw new Error('SERPAPI_API_KEY is not configured');

  try {
    const supabase = await createClient();
    let finalImageUrl = '';

    if (isUrl) {
      finalImageUrl = imageInput;
    } else {
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

    const params = new URLSearchParams({
      engine: 'google_lens',
      url: finalImageUrl,
      api_key: SERPAPI_API_KEY,
      country: 'in',
      currency: 'INR'
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    if (!isUrl) {
      const fileName = finalImageUrl.split('/').pop();
      if (fileName) await supabase.storage.from('product-images').remove([fileName]);
    }

    if (!data.visual_matches) return [];

    const trustedKeywords = ["amazon", "flipkart", "myntra", "ajio", "tata", "reliance"];

    const cleanResults: ProductMatch[] = data.visual_matches
      // 🚨 BUG FIX 1: STRICT CURRENCY FILTERING
      .filter((item: any) => {
        const currency = item.price?.currency;
        return currency === 'INR' || currency === '₹';
      })
      .map((item: any) => {
        const price = item.price.extracted_value;
        const source = item.source?.toLowerCase() || '';
        
        // Feature 1: TrustRank Logic
        let trustScore = (10000 / (price || 1));
        if (trustedKeywords.some(kw => source.includes(kw))) {
          trustScore += 50;
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
          trustScore
        };
      })
      // 🚨 BUG FIX 2: SORT BY PRICE (LOW TO HIGH) TO FIND BEST DEALS
      .sort((a, b) => a.price.amount - b.price.amount);

    return cleanResults;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search for product');
  }
}
