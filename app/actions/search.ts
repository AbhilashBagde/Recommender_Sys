'use server';

import { createClient } from '@/lib/supabase/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY; // Insert your SerpApi API Key in .env

export async function searchProduct(imageBase64: string) {
  if (!SERPAPI_API_KEY) {
    throw new Error('SERPAPI_API_KEY is not configured');
  }

  try {
    const supabase = await createClient();
    
    // 1. Upload image to Supabase Storage to get a public URL
    // SerpApi Google Lens works best with a public URL
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    // 2. Call SerpApi Google Lens
    const params = new URLSearchParams({
      engine: 'google_lens',
      url: publicUrl,
      api_key: SERPAPI_API_KEY,
      country: 'in',
      currency: 'INR'
    });

    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    const data = await response.json();

    // 3. Cleanup: Delete the image from storage after search (optional, but good practice)
    await supabase.storage.from('product-images').remove([fileName]);

    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search for product');
  }
}
