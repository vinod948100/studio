/**
 * @fileoverview A flow that runs a Lighthouse performance test on a URL.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

// Define input schema for the Lighthouse flow
export const RunLighthouseTestInputSchema = z.object({
  url: z.string().url(),
});
export type RunLighthouseTestInput = z.infer<typeof RunLighthouseTestInputSchema>;

// Define the structure of the performance metrics we expect back
export const PerformanceMetricsSchema = z.object({
  performanceScore: z.number().min(0).max(100),
  fcp: z.number(),
  lcp: z.number(),
  tbt: z.number(),
  cls: z.number(),
});
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// Define the output schema for the Lighthouse flow
export const RunLighthouseTestOutputSchema = z.object({
  mobile: z.object({
    '4g': PerformanceMetricsSchema,
    fast3g: PerformanceMetricsSchema,
  }),
  desktop: z.object({
    '4g': PerformanceMetricsSchema,
    fast3g: PerformanceMetricsSchema,
  }),
});
export type RunLighthouseTestOutput = z.infer<
  typeof RunLighthouseTestOutputSchema
>;

/**
 * Runs a Lighthouse test for a given page URL using the PageSpeed Insights API.
 * This function is a wrapper around the Genkit flow.
 * @param input The URL to test.
 * @returns The performance data from the Lighthouse test.
 */
export async function runLighthouseTest(
  input: RunLighthouseTestInput
): Promise<RunLighthouseTestOutput> {
  return runLighthouseTestFlow(input);
}


// Helper function to call PageSpeed Insights and extract metrics
async function getLighthouseMetrics(url: string, strategy: 'mobile' | 'desktop'): Promise<PerformanceMetrics> {
  console.log("==========================")
  console.log(url);
  console.log("==========================")
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('PAGESPEED_API_KEY environment variable is not set.');
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&strategy=${strategy}&key=${apiKey}&category=PERFORMANCE`;
  
  try {
    const response = await axios.get(apiUrl);
    console.log("====================")
    console.log(response.data);
    console.log("====================")
    const lighthouseResult = response.data.lighthouseResult;
    const audits = lighthouseResult.audits;

    const getAuditNumericValue = (id: string) => audits[id]?.numericValue || 0;
    
    // Convert scores to a 0-100 scale
    const performanceScore = (lighthouseResult.categories.performance.score || 0) * 100;
    console.log(performanceScore);
    return {
      performanceScore: Math.round(performanceScore),
      fcp: getAuditNumericValue('first-contentful-paint') / 1000, // ms to s
      lcp: getAuditNumericValue('largest-contentful-paint') / 1000, // ms to s
      tbt: getAuditNumericValue('total-blocking-time'), // ms
      cls: parseFloat(getAuditNumericValue('cumulative-layout-shift').toFixed(4)),
    };
  } catch (error: any) {
    console.error(`PageSpeed API request failed for ${url} (${strategy}):`, error.response?.data?.error?.message || error.message);
    throw new Error(`Failed to run Lighthouse test for ${url} (${strategy}).`);
  }
}

/**
 * Genkit flow to orchestrate Lighthouse tests for a URL on both mobile and desktop.
 */
export const runLighthouseTestFlow = ai.defineFlow(
  {
    name: 'runLighthouseTestFlow',
    inputSchema: RunLighthouseTestInputSchema,
    outputSchema: RunLighthouseTestOutputSchema,
  },
  async ({ url }) => {
    // Run tests for mobile and desktop in parallel
    const [mobileMetrics, desktopMetrics] = await Promise.all([
        getLighthouseMetrics(url, 'mobile'),
        getLighthouseMetrics(url, 'desktop')
    ]);

    // The PageSpeed API doesn't differentiate between 4G and Fast 3G.
    // We will return the same results for both as a simplification.
    return {
      mobile: {
        '4g': mobileMetrics,
        fast3g: mobileMetrics,
      },
      desktop: {
        '4g': desktopMetrics,
        fast3g: desktopMetrics,
      },
    };
  }
);
