import { NextResponse } from 'next/server';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export async function POST(request: Request) {
  try {
    const { frequency, time, timezone } = await request.json();

    if (!frequency || !time || !timezone) {
      return NextResponse.json({ message: 'Missing required schedule data.' }, { status: 400 });
    }

    // Save the schedule to a "schedules" collection in Firestore.
    // We'll use a fixed document ID to always have only one schedule.
    const scheduleRef = doc(db, 'schedules', 'main-schedule');
    await setDoc(scheduleRef, {
      frequency,
      time,
      timezone,
      lastUpdated: new Date().toISOString(),
    });
    
    const successMessage = `Schedule saved successfully. Tests will run ${frequency} at ${time} ${timezone}.`;
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
