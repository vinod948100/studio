/**
 * @fileoverview A flow that runs a Lighthouse performance test on a URL.
 */
'use server';

import { ai } from '@/ai/genkit';
import axios from 'axios';
import {
  RunLighthouseTestInputSchema,
  RunLighthouseTestOutputSchema,
  PerformanceMetrics,
  type RunLighthouseTestInput,
  type RunLighthouseTestOutput,
} from '@/lib/lighthouse-types';


/**
 * Runs a Lighthouse test for a given page URL using the PageSpeed Insights API.
 * This function is a wrapper around the Genkit flow.
 * @param input The URL to test.
 * @returns The performance data from the Lighthouse test.
 */
export async function runLighthouseTest(
  input: RunLighthouseTestInput
): Promise<RunLighthouseTestOutput | null> {
  return runLighthouseTestFlow(input);
}


// Helper function to call PageSpeed Insights and extract metrics
async function getLighthouseMetrics(url: string, strategy: 'mobile' | 'desktop'): Promise<PerformanceMetrics | null> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('PAGESPEED_API_KEY environment variable is not set.');
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&strategy=${strategy}&key=${apiKey}&category=PERFORMANCE`;
  
  try {
    const response = await axios.get(apiUrl, { timeout: 120000 }); // 90 second timeout
    const lighthouseResult = response.data.lighthouseResult;
    
    // If lighthouseResult is missing, the test likely failed.
    if (!lighthouseResult) {
        console.error(`PageSpeed API request did not return a lighthouseResult for ${url} (${strategy}):`, response.data?.error?.message || 'No result object');
        return null;
    }
        
    const audits = lighthouseResult.audits;

    const getAuditNumericValue = (id: string) => audits[id]?.numericValue || 0;
    
    // Convert scores to a 0-100 scale
    const performanceScore = (lighthouseResult.categories.performance.score || 0) * 100;
    
    return {
      performanceScore: Math.round(performanceScore),
      fcp: getAuditNumericValue('first-contentful-paint') / 1000, // ms to s
      lcp: getAuditNumericValue('largest-contentful-paint') / 1000, // ms to s
      tbt: getAuditNumericValue('total-blocking-time'), // ms
      cls: parseFloat(getAuditNumericValue('cumulative-layout-shift').toFixed(4)),
    };
  } catch (error: any) {
    console.error(`PageSpeed API request failed for ${url} (${strategy}):`, error.response?.data?.error?.message || error.message);
    // Instead of throwing, we return null to indicate failure for this specific test
    return null;
  }
}

/**
 * Genkit flow to orchestrate Lighthouse tests for a URL on both mobile and desktop.
 */
const runLighthouseTestFlow = ai.defineFlow(
  {
    name: 'runLighthouseTestFlow',
    inputSchema: RunLighthouseTestInputSchema,
    outputSchema: RunLighthouseTestOutputSchema.nullable(),
  },
  async ({ url }) => {
    // Run tests for mobile and desktop in parallel
    const [mobileMetrics, desktopMetrics] = await Promise.all([
        getLighthouseMetrics(url, 'mobile'),
        getLighthouseMetrics(url, 'desktop')
    ]);

    // If both tests failed, return null to signify failure for this URL.
    if (!mobileMetrics && !desktopMetrics) {
        return null;
    }

    // The PageSpeed API doesn't differentiate between 4G and Fast 3G.
    // We will return the same results for both as a simplification.
    // If a test failed, use a default empty/zeroed metric object.
    const emptyMetrics: PerformanceMetrics = { performanceScore: 0, fcp: 0, lcp: 0, tbt: 0, cls: 0 };

    return {
      mobile: {
        fourG: mobileMetrics || emptyMetrics,
        fast3g: mobileMetrics || emptyMetrics,
      },
      desktop: {
        fourG: desktopMetrics || emptyMetrics,
        fast3g: desktopMetrics || emptyMetrics,
      },
    };
  }
);
