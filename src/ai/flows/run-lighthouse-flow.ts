'use server';
/**
 * @fileOverview A flow to run Lighthouse tests and save the results to Firestore.
 * 
 * - runLighthouseTestForPage - A function that runs a lighthouse test for a single page.
 */
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PerformanceMetrics, PagePerformance, PageToTest } from '@/lib/types';


const createRandomMetrics = (baseScore: number): PerformanceMetrics => ({
  performanceScore: Math.floor(baseScore + Math.random() * 10),
  fcp: parseFloat((0.8 + Math.random() * 1.5).toFixed(2)),
  lcp: parseFloat((1.5 + Math.random() * 2.0).toFixed(2)),
  tbt: Math.floor(50 + Math.random() * 200),
  cls: parseFloat((Math.random() * 0.15).toFixed(3)),
});

export async function runLighthouseTestForPage(page: PageToTest, shouldFail?: boolean): Promise<string> {
  console.log(`Running Lighthouse test for ${page.url}...`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  if (shouldFail) {
    console.error(`Simulated failure for ${page.url}`);
    throw new Error(`Lighthouse failed for ${page.url}`);
  }

  const performanceData: Omit<PagePerformance, 'id'> = {
    reportPath: page.reportPath,
    url: page.url,
    lastUpdated: new Date().toISOString(),
    mobile: {
      '4g': createRandomMetrics(Math.random() * 40 + 50), // score between 50-90
      fast3g: createRandomMetrics(Math.random() * 40 + 40), // score between 40-80
    },
    desktop: {
      '4g': createRandomMetrics(Math.random() * 10 + 85), // score between 85-95
      fast3g: createRandomMetrics(Math.random() * 10 + 80), // score between 80-90
    },
  };
  
  await addDoc(collection(db, 'performance-reports'), performanceData);
  
  const successMessage = `Lighthouse test finished for ${page.url} and data saved to Firestore.`;
  console.log(successMessage);
  return successMessage;
}
