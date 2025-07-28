import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { frequency, time, timezone } = await request.json();

    if (!frequency || !time || !timezone) {
      return NextResponse.json({ message: 'Missing required schedule data.' }, { status: 400 });
    }

    // In a real application, you would save this to a database
    // and have a cron job or scheduled task trigger the tests.
    // For this example, we'll just log it to the server console.
    console.log(`Received schedule: Run tests ${frequency} at ${time} ${timezone}.`);


    // You could potentially integrate with a service like Google Cloud Scheduler here.
    
    return NextResponse.json({ message: `Schedule saved successfully. Tests will run ${frequency} at ${time} ${timezone}.` });

  } catch (error: any) {
    console.error(`API Error:`, error);
    
    let errorMessage = 'An unknown internal server error occurred.';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
