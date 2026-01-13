'use server';

import * as cheerio from 'cheerio';

export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) throw new Error('Failed to fetch URL');

    const html = await response.text();
    const $ = cheerio.load(html);

    // Priority list for finding the product image
    const selectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[property="og:image:secure_url"]',
      'link[rel="image_src"]'
    ];

    for (const selector of selectors) {
      const content = $(selector).attr('content');
      if (content) return content;
    }

    // Fallback: Look for large images in the body if meta tags fail
    const bodyImages = $('img').map((i, el) => $(el).attr('src')).get();
    const productImg = bodyImages.find(src => 
      src?.includes('product') || 
      src?.includes('media') || 
      src?.includes('assets')
    );

    return productImg || null;
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}
