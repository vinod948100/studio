import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PageToTest } from '@/lib/types';
import { runLighthouseTest } from '@/ai/flows/run-lighthouse-flow';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';


export async function POST(request: Request) {
  try {
    const { page }: { page: PageToTest } = await request.json();

    if (!page || !page.url) {
      return NextResponse.json({ message: 'Invalid page data provided.' }, { status: 400 });
    }

    // Run the actual Lighthouse test using the Genkit flow
    const lighthouseData = await runLighthouseTest({ url: page.url });

    // Handle the case where the Lighthouse flow failed for the URL
    if (!lighthouseData) {
      const errorMessage = `Lighthouse tests failed for ${page.url}. The page may be inaccessible or timed out.`;
      console.error(errorMessage);
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
    
    const performanceData = {
      reportPath: page.reportPath,
      url: page.url,
      lastUpdated: new Date().toISOString(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Add server timestamp
      ...lighthouseData,
    };
    
    await addDoc(collection(db, 'performance-reports'), performanceData);
    
    const successMessage = `Lighthouse test finished for ${page.url} and data saved.`;
    return NextResponse.json({ message: successMessage });

  } catch (error: any) {
    console.error(`API Error:`, error);
    
    let errorMessage = 'An unknown internal server error occurred.';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.details) {
      errorMessage = error.details;
    }
    
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
