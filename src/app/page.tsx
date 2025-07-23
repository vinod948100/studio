'use client';
import { getPerformanceData } from '@/lib/data';
import { PerformanceTable } from '@/components/dashboard/performance-table';
import { ScheduleDialog } from '@/components/dashboard/schedule-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PagePerformance } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [data, setData] = useState<PagePerformance[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const performanceData = await getPerformanceData();
      setData(performanceData);
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter">
            Web Vitals Watcher
          </h1>
        </div>
        <div className="ml-auto">
          <ScheduleDialog />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Performance Reports
            </CardTitle>
            <CardDescription>
              Latest web vitals and performance scores for your pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <PerformanceTable data={data} />
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="border-t bg-background/80 p-4 text-center text-sm text-muted-foreground">
        <p>Built for performance monitoring.</p>
      </footer>
    </div>
  );
}
