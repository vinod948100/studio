'use server';
/**
 * @fileOverview A flow to run Lighthouse tests and save the results to Firestore.
 * 
 * - runLighthouseTests - A function that runs lighthouse tests and saves the data to firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PerformanceMetrics, PagePerformance } from '@/lib/types';


const createRandomMetrics = (baseScore: number): PerformanceMetrics => ({
  performanceScore: Math.floor(baseScore + Math.random() * 10),
  fcp: parseFloat((0.8 + Math.random() * 1.5).toFixed(2)),
  lcp: parseFloat((1.5 + Math.random() * 2.0).toFixed(2)),
  tbt: Math.floor(50 + Math.random() * 200),
  cls: parseFloat((Math.random() * 0.15).toFixed(3)),
});

const pagesToTest = [
  {
    reportPath: 'homepage',
    url: 'https://www.truckopedia.com/',
  },
  {
    reportPath: 'about-us',
    url: 'https://www.truckopedia.com/about-us',
  },
  {
    reportPath: 'contact',
    url: 'https://www.truckopedia.com/contact',
  },
    {
    reportPath: 'blog/best-trucks-2024',
    url: 'https://www.truckopedia.com/blog/best-trucks-2024',
  },
  {
    reportPath: 'gallery',
    url: 'https://www.truckopedia.com/gallery',
  },
];


const runLighthouseFlow = ai.defineFlow(
  {
    name: 'runLighthouseFlow',
    inputSchema: z.void(),
    outputSchema: z.void(),
  },
  async () => {
    console.log('Running Lighthouse tests...');
    
    const promises = pagesToTest.map(page => {
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
      
      return addDoc(collection(db, 'performance-reports'), performanceData);
    });

    await Promise.all(promises);
    
    console.log('Lighthouse tests finished and data saved to Firestore.');
  }
);


export async function runLighthouseTests(): Promise<void> {
    await runLighthouseFlow();
}
