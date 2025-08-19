import type { PageToTest, SiteKey } from './types';
import { SITES } from './sites';


// Helper to convert a URL string to a PageToTest object
export const toPageToTest = (urlStr: string, siteKey: SiteKey): PageToTest | null => {
  try {
    const url = new URL(urlStr);
    const segments = url.pathname.split('/').filter(Boolean); // removes empty segments
    
    // Construct a unique report path with a site prefix
    const pagePath = segments.length > 0 ? segments.join('/') : 'homepage';
    const reportPath = `${SITES[siteKey].reportPathPrefix}${pagePath}`;
    
    return { url: urlStr, reportPath };
  } catch (e) {
    console.warn(`Invalid URL found in sitemap, skipping: ${urlStr}`);
    return null;
  }
};
