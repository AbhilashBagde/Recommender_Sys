'use server';

import * as cheerio from 'cheerio';

export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try OpenGraph image first
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) return ogImage;
    
    // Fallback to Twitter image
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage) return twitterImage;
    
    // Fallback to first large image
    const firstImg = $('img').filter(function() {
      const width = parseInt($(this).attr('width') || '0');
      return width > 200;
    }).first().attr('src');
    
    if (firstImg) {
      if (firstImg.startsWith('http')) return firstImg;
      const baseUrl = new URL(url).origin;
      return new URL(firstImg, baseUrl).toString();
    }

    return null;
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}
