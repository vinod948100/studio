'use client';
import { PerformanceTable } from '@/components/dashboard/performance-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Flame, LineChart, Table, BotMessageSquare, FileDown } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import type { PagePerformance, SiteKey } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPerformanceData } from '@/lib/data';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { ScheduleDialog } from '@/components/dashboard/schedule-dialog';
import { SITES } from '@/lib/sites';
import { Button } from '@/components/ui/button';
import { AutomatedTestRunner } from '@/components/dashboard/automated-test-runner';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/utils';

export default function Home() {
  const [activeSite, setActiveSite] = useState<SiteKey | null>(null);
  const [allData, setAllData] = useState<PagePerformance[] | null>(null);
  const [reportView, setReportView] = useState('table'); // 'table' or 'chart'
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Fetch all data once when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const performanceData = await getPerformanceData();
      setAllData(performanceData);
      setIsLoading(false);
    };
    fetchAllData();
  }, []);

  const handleTestComplete = useCallback(async () => {
    setIsTestRunning(false);
    setIsLoading(true);
    // Refetch all data to include the new test results
    const performanceData = await getPerformanceData();
    setAllData(performanceData);
    setIsLoading(false);
  }, []);

  // Memoized and filtered data based on the active site and date range
  const siteFilteredData = useMemo(() => {
    if (!allData || !activeSite) {
      return [];
    }

    const sitePrefix = SITES[activeSite].reportPathPrefix;

    return allData.filter((item) => {
      // 1. Filter by site
      if (!item.reportPath.startsWith(sitePrefix)) {
        return false;
      }
      
      // 2. Filter by date range
      const itemDate = new Date(item.lastUpdated);
      if (dateRange?.from && itemDate < dateRange.from) return false;
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }
      
      return true;
    });
  }, [allData, activeSite, dateRange]);

  const handleSiteSelect = (site: SiteKey) => {
    setActiveSite(site);
    // If we have history, don't auto-run tests. Let user decide.
    // For this implementation, we will auto-run.
    setIsTestRunning(true);
  };
  
  const handleExport = () => {
    if (!activeSite) return;
    
    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : 'start';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : 'today';
    const filename = `${activeSite}-performance-report-${from}-to-${to}.csv`;
    
    exportToCsv(siteFilteredData, filename);
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
        <nav className="ml-8 flex items-center gap-2">
            {(Object.keys(SITES) as SiteKey[]).map((siteKey) => (
                <Button 
                    key={siteKey}
                    variant={activeSite === siteKey ? "secondary" : "ghost"}
                    onClick={() => handleSiteSelect(siteKey)}
                    className={cn(
                        "font-semibold",
                        activeSite === siteKey && "shadow-sm"
                    )}
                >
                    {SITES[siteKey].name}
                </Button>
            ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <ScheduleDialog />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {!activeSite && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <BotMessageSquare className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-2xl font-bold tracking-tight font-headline">
                        Welcome to Web Vitals Watcher
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Select a site above to run tests and view performance reports.
                    </p>
                </div>
            </div>
        )}
        
        {isTestRunning && activeSite && (
            <AutomatedTestRunner site={activeSite} onComplete={handleTestComplete} />
        )}
        
        {!isTestRunning && activeSite && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Performance Report: {SITES[activeSite].name}
                </CardTitle>
                <CardDescription>
                  Web vitals and performance scores for your pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
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
                    <Button variant="outline" onClick={handleExport} disabled={siteFilteredData.length === 0}>
                      <FileDown className="mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <DateRangePicker
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : siteFilteredData.length > 0 ? (
                  reportView === 'table' ? (
                    <PerformanceTable data={siteFilteredData} />
                  ) : (
                    <PerformanceChart data={siteFilteredData} dateRange={dateRange} />
                  )
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No performance data found for {SITES[activeSite].name} in the selected date range.
                  </div>
                )}
              </CardContent>
            </Card>
        )}
        
      </main>
      <footer className="border-t bg-background/80 p-4 text-center text-sm text-muted-foreground">
        <p>Built for performance monitoring.</p>
      </footer>
    </div>
  );
}
