'use client';
import { PerformanceTable } from '@/components/dashboard/performance-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Flame, LineChart, Table } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PagePerformance } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestRunner } from '@/components/dashboard/test-runner';
import { getPerformanceData } from '@/lib/data';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { ScheduleDialog } from '@/components/dashboard/schedule-dialog';

export default function Home() {
  const [allData, setAllData] = useState<PagePerformance[] | null>(null);
  const [filteredData, setFilteredData] = useState<PagePerformance[] | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('runner');
  const [reportView, setReportView] = useState('table');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const fetchData = async () => {
    setAllData(null);
    setFilteredData(null);
    const performanceData = await getPerformanceData();
    setAllData(performanceData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allData) {
      const filtered = allData.filter((item) => {
        const itemDate = new Date(item.lastUpdated);
        if (dateRange?.from && itemDate < dateRange.from) return false;
        // Set 'to' date to the end of the day
        if (dateRange?.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (itemDate > toDate) return false;
        }
        return true;
      });
      setFilteredData(filtered);
    }
  }, [allData, dateRange]);

  const handleTestRunCompletion = () => {
    fetchData();
    setActiveTab('reports');
  };

  const mobileAverage =
    filteredData && filteredData.length > 0
      ? Math.round(
          filteredData.reduce(
            (acc, curr) => acc + curr.mobile['4g'].performanceScore,
            0
          ) / filteredData.length
        )
      : 0;

  const desktopAverage =
    filteredData && filteredData.length > 0
      ? Math.round(
          filteredData.reduce(
            (acc, curr) => acc + curr.desktop['4g'].performanceScore,
            0
          ) / filteredData.length
        )
      : 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
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
                  Web vitals and performance scores for your pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <Tabs
                    value={reportView}
                    onValueChange={setReportView}
                    className="w-full md:w-auto"
                  >
                    <TabsList>
                      <TabsTrigger value="table">
                        <Table className="mr-2" /> Table View
                      </TabsTrigger>
                      <TabsTrigger value="chart">
                        <LineChart className="mr-2" /> Chart View
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg. Mobile Score
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 18v-5" />
                        <path d="M12 8l-4 4" />
                        <path d="m16 8-4 4" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mobileAverage}</div>
                      <p className="text-xs text-muted-foreground">
                        Average score for selected date range
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg. Desktop Score
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 18v-5" />
                        <path d="M12 8l-4 4" />
                        <path d="m16 8-4 4" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{desktopAverage}</div>
                      <p className="text-xs text-muted-foreground">
                        Average score for selected date range
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {filteredData ? (
                  reportView === 'table' ? (
                    <PerformanceTable data={filteredData} />
                  ) : (
                    <PerformanceChart data={filteredData} dateRange={dateRange} />
                  )
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
