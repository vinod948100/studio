import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PageToTest } from '@/lib/types';
import { runLighthouseTest } from '@/ai/flows/run-lighthouse-flow';


export async function POST(request: Request) {
  try {
    const { page }: { page: PageToTest } = await request.json();

    if (!page || !page.url) {
      return NextResponse.json({ message: 'Invalid page data provided.' }, { status: 400 });
    }

    // Run the actual Lighthouse test using the Genkit flow
    const lighthouseData = await runLighthouseTest({ url: page.url });
    
    const performanceData = {
      reportPath: page.reportPath,
      url: page.url,
      lastUpdated: new Date().toISOString(),
      ...lighthouseData,
    };
    
    await addDoc(collection(db, 'performance-reports'), performanceData);
    
    const successMessage = `Lighthouse test finished for ${page.url} and data saved.`;
    return NextResponse.json({ message: successMessage });

  } catch (error: any) {
    console.error(`API Error for ${request.url}:`, error);
    
    const errorMessage = error.message || 'An unknown internal server error occurred.';
    const statusCode = error.code === 'permission-denied' ? 403 : 500;
    
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
