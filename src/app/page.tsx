'use client';
import { PerformanceTable } from '@/components/dashboard/performance-table';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestRunner } from '@/components/dashboard/test-runner';
import { getPerformanceData } from '@/lib/data';

export default function Home() {
  const [data, setData] = useState<PagePerformance[] | null>(null);
  const [activeTab, setActiveTab] = useState('runner');

  const fetchData = async () => {
    setData(null); // Set to null to show skeleton while refetching
    const performanceData = await getPerformanceData();
    setData(performanceData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTestRunCompletion = () => {
    fetchData();
    setActiveTab('reports');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter">
            Web Vitals Watcher
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="runner">Run Tests</TabsTrigger>
            <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="runner">
            <TestRunner onComplete={handleTestRunCompletion} />
          </TabsContent>
          <TabsContent value="reports">
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
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t bg-background/80 p-4 text-center text-sm text-muted-foreground">
        <p>Built for performance monitoring.</p>
      </footer>
    </div>
  );
}
