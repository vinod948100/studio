
'use server';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import type { PageToTest } from './types';

export async function extractSitemapUrls(sitemapUrl: string): Promise<PageToTest[]> {
  if (!sitemapUrl) {
    return [];
  }
  try {
    // Fetch the sitemap XML
    const response = await axios.get(sitemapUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        }
    });
    const xml = response.data;

    // Parse the XML
    const result = await parseStringPromise(xml);

    // Extract URLs from <url><loc>
    if (!result.urlset || !result.urlset.url) {
        console.warn('Sitemap does not contain urlset or urls');
        return [];
    }
    const urls = result.urlset.url.map((entry: any) => entry.loc[0]);

    // create array of object of URLs
    const urlArray: PageToTest[] = urls.map((urlStr: string) => {
      try {
        const url = new URL(urlStr);
        const segments = url.pathname.split('/').filter(Boolean); // removes empty segments
        // Use the last segment as reportPath, or 'homepage' for the root
        const reportPath = segments.length > 0 ? segments.join('/') : 'homepage';
        return { url: urlStr, reportPath };
      } catch(e) {
        console.error(`Invalid URL found in sitemap: ${urlStr}`);
        return null;
      }
    }).filter((p): p is PageToTest => p !== null);

    return urlArray;
  } catch (error: any) {
    console.error('Error fetching or parsing sitemap:', error.message);
    if (error.response) {
      console.error('Sitemap fetch failed with status:', error.response.status);
    }
    return [];
  }
}
