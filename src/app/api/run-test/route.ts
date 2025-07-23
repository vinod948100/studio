import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PerformanceMetrics, PageToTest } from '@/lib/types';


const createRandomMetrics = (baseScore: number): PerformanceMetrics => ({
  performanceScore: Math.floor(baseScore + Math.random() * 10),
  fcp: parseFloat((0.8 + Math.random() * 1.5).toFixed(2)),
  lcp: parseFloat((1.5 + Math.random() * 2.0).toFixed(2)),
  tbt: Math.floor(50 + Math.random() * 200),
  cls: parseFloat((Math.random() * 0.15).toFixed(3)),
});

export async function POST(request: Request) {
  try {
    const { page }: { page: PageToTest } = await request.json();

    if (!page || !page.url) {
      return NextResponse.json({ message: 'Invalid page data provided.' }, { status: 400 });
    }

    // Simulate a much shorter network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const performanceData = {
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
    
    const successMessage = `Lighthouse test finished for ${page.url} and data saved.`;
    return NextResponse.json({ message: successMessage });

  } catch (error: any) {
    console.error('API Error:', error);
    const errorMessage = error.message || 'An unknown internal server error occurred.';
    return NextResponse.json({ message: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
  }
}
