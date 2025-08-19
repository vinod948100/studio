import { NextResponse } from 'next/server';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export async function POST(request: Request) {
  try {
    const { site, frequency, time, timezone } = await request.json();

    if (!site || !frequency || !time || !timezone) {
      return NextResponse.json({ message: 'Missing required schedule data.' }, { status: 400 });
    }

    // Save the schedule to a "schedules" collection in Firestore.
    // We'll use the site name as the document ID to have a schedule per site.
    const scheduleRef = doc(db, 'schedules', site);
    await setDoc(scheduleRef, {
      site,
      frequency,
      time,
      timezone,
      lastUpdated: new Date().toISOString(),
    });
    
    const successMessage = `Schedule saved for ${site}. Tests will run ${frequency} at ${time} ${timezone}.`;
    return NextResponse.json({ message: successMessage });

  } catch (error: any) {
    console.error(`API Error:`, error);
    
    let errorMessage = 'An unknown internal server error occurred.';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
