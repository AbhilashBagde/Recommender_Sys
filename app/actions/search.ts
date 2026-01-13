'use server';

import { createClient } from '@/lib/supabase/server';

const SERPAPI_KEY = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;

export interface ProductMatch {
  title: string;
  price: { amount: number; currency: string };
  thumbnail: string;
  source: string;
  link: string;
  trustScore?: number;
  verified?: boolean;
}

export async function searchProduct(imageInput: string, isUrl: boolean = false): Promise<ProductMatch[]> {
  if (!SERPAPI_KEY) throw new Error('SerpApi key is not configured. Please set SERPAPI_KEY in your environment.');

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
      api_key: SERPAPI_KEY,
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

    const trustedKeywords = ["amazon", "flipkart", "myntra", "ajio", "tata", "reliance", "jiomart"];

    const cleanResults: ProductMatch[] = data.visual_matches
      .filter((item: any) => {
        const currency = item.price?.currency;
        // Accept various INR representations
        return currency === 'INR' || currency === '₹' || (item.price?.extracted_value && !currency);
      })
      .map((item: any) => {
        const price = item.price?.extracted_value || 0;
        const source = item.source?.toLowerCase() || '';
        
        // Feature: TrustRank Logic
        let trustScore = 70; // Base score
        
        if (trustedKeywords.some(kw => source.includes(kw))) {
          trustScore += 25;
        }
        
        if (item.source_icon) {
          trustScore += 5;
        }

        return {
          title: item.title,
          price: {
            amount: price,
            currency: item.price?.currency || 'INR'
          },
          thumbnail: item.thumbnail,
          source: item.source || 'Unknown Store',
          link: item.link,
          trustScore: Math.min(100, trustScore),
          verified: trustedKeywords.some(kw => source.includes(kw))
        };
      })
      .filter(item => item.price.amount > 0)
      .sort((a, b) => a.price.amount - b.price.amount);

    return cleanResults;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search for product');
  }
}
