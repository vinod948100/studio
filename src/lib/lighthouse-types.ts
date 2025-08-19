import { z } from 'zod';

// Define input schema for the Lighthouse flow
export const RunLighthouseTestInputSchema = z.object({
  url: z.string().url(),
});
export type RunLighthouseTestInput = z.infer<
  typeof RunLighthouseTestInputSchema
>;

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
    fourG: PerformanceMetricsSchema,
    fast3g: PerformanceMetricsSchema,
  }),
  desktop: z.object({
    fourG: PerformanceMetricsSchema,
    fast3g: PerformanceMetricsSchema,
  }),
});
export type RunLighthouseTestOutput = z.infer<
  typeof RunLighthouseTestOutputSchema
>;
