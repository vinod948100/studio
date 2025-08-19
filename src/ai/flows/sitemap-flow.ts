/**
 * @fileoverview A flow that fetches and parses a sitemap.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { PageToTest, SiteKey } from '@/lib/types';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { toPageToTest } from '@/lib/sitemap';


export async function extractSitemapUrls(sitemapUrl: string): Promise<PageToTest[]> {
    try {
        const url = new URL(sitemapUrl);
        // This is a hacky way to determine the site from the URL.
        // A more robust solution might pass the siteKey explicitly.
        const siteKey: SiteKey | undefined = 
          url.hostname.includes('truckopedia') ? 'truckopedia' :
          url.hostname.includes('eform2290') ? 'eform2290' :
          url.hostname.includes('emcs150') ? 'emcs150' : undefined;
        
        if (!siteKey) {
            throw new Error(`Could not determine site from sitemap URL: ${sitemapUrl}`);
        }

        const pages = await sitemapFetcherFlow({sitemapUrl, siteKey});
        const flatPages = pages.flat();
        const uniquePages = Array.from(new Map(flatPages.map(p => [p.url, p])).values());
        return uniquePages;
    } catch (error) {
        console.error(`Failed to execute sitemap fetcher flow for ${sitemapUrl}:`, error);
        throw new Error('Failed to fetch or parse sitemap. Check the URL and if it is accessible.');
    }
}


const sitemapFetcherFlow = ai.defineFlow(
  {
    name: 'sitemapFetcherFlow',
    inputSchema: z.object({
        sitemapUrl: z.string().url(),
        siteKey: z.enum(['truckopedia', 'eform2290', 'emcs150']),
    }),
    outputSchema: z.array(z.object({
        url: z.string(),
        reportPath: z.string(),
    })),
  },
  async ({ sitemapUrl, siteKey }) => {
    try {
      const response = await axios.get(sitemapUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/xml, text/xml, application/xhtml+xml, text/html;q=0.9, */*;q=0.8',
        },
        timeout: 15000, 
      });
      const xml = response.data;
      const result = await parseStringPromise(xml);

      let urls: string[] = [];

      if (result.sitemapindex && result.sitemapindex.sitemap) {
        const sitemapUrls = result.sitemapindex.sitemap.map((entry: any) => entry.loc[0]);
        const allPagesArrays = await Promise.all(sitemapUrls.map((url: string) => sitemapFetcherFlow({ sitemapUrl: url, siteKey })));
        urls = allPagesArrays.flat().map(p => p.url); 
      }
      else if (result.urlset && result.urlset.url) {
        urls = result.urlset.url
          .map((entry: any) => entry.loc && entry.loc[0])
          .filter((loc: string | undefined): loc is string => !!loc);
      } else {
         throw new Error('Sitemap format not recognized.');
      }
      
      const uniqueUrls = Array.from(new Set(urls));
      return uniqueUrls.map(url => toPageToTest(url, siteKey)).filter((p): p is PageToTest => p !== null);

    } catch (error: any) {
      console.error(`Error processing sitemap ${sitemapUrl}:`, error.message);
      if (error.response) {
        console.error(`Sitemap fetch failed with status: ${error.response.status}`);
      }
      return []; 
    }
  }
);
