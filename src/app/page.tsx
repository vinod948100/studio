// page.tsx (modified)
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
import { ScoreBadge } from '@/components/dashboard/score-badge';

export default function Home() {
  const [activeSite, setActiveSite] = useState<SiteKey | null>(null);
  const [allData, setAllData] = useState<PagePerformance[] | null>(null);
  const [reportView, setReportView] = useState('table'); // 'table' or 'chart'
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedPage, setSelectedPage] = useState<string | 'all'>('all');
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
    const performanceData = await getPerformanceData();
    setAllData(performanceData);
    setIsLoading(false);
  }, []);

  // Memoized data filtered by site and date range (before page filter)
  const siteDataBeforePageFilter = useMemo(() => {
    if (!allData || !activeSite) {
      return [];
    }

    const sitePrefix = SITES[activeSite].reportPathPrefix;

    return allData.filter((item) => {
      if (!item.reportPath.startsWith(sitePrefix)) {
        return false;
      }
      
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

  // Unique report paths for dropdown
  const uniquePages = useMemo(() => {
    const paths = new Set(siteDataBeforePageFilter.map((item) => item.reportPath));
    return Array.from(paths).sort();
  }, [siteDataBeforePageFilter]);

  // Memoized and filtered data based on the active site, date range, and selected page
  const siteFilteredData = useMemo(() => {
    return siteDataBeforePageFilter.filter((item) => {
      if (selectedPage !== 'all' && item.reportPath !== selectedPage) {
        return false;
      }
      return true;
    });
  }, [siteDataBeforePageFilter, selectedPage]);

  // Calculate average performance scores for mobile and desktop
  const averageScores = useMemo(() => {
    if (!siteFilteredData.length) {
      return { mobile: null, desktop: null };
    }

    let mobileTotal = 0;
    let desktopTotal = 0;
    let mobileCount = 0;
    let desktopCount = 0;

    siteFilteredData.forEach((item) => {
      if (item.mobile?.fourG?.performanceScore !== undefined && item.mobile?.fourG?.performanceScore !== null) {
        mobileTotal += item.mobile.fourG.performanceScore;
        mobileCount++;
      }
      if (item.desktop?.fast3g?.performanceScore !== undefined && item.desktop?.fast3g?.performanceScore !== null) {
        desktopTotal += item.desktop.fast3g.performanceScore;
        desktopCount++;
      }
    });

    return {
      mobile: mobileCount > 0 ? Number((mobileTotal / mobileCount).toFixed(2)) : null,
      desktop: desktopCount > 0 ? Number((desktopTotal / desktopCount).toFixed(2)) : null,
    };
  }, [siteFilteredData]);

  const handleSiteSelect = (site: SiteKey) => {
    setActiveSite(site);
    setSelectedPage('all'); // Reset page selection when site changes
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
              {/* Display Average Scores */}
              {siteFilteredData.length > 0 && (
                <div className="flex flex-col gap-2 border rounded-lg p-4 bg-background">
                  <h3 className="text-lg font-semibold">Average Performance Scores</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Mobile: </span>
                      {averageScores.mobile !== null ? (
                        <ScoreBadge
                          score={averageScores.mobile}
                          metricType="performance"
                          deviceType="mobile"
                        />
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Desktop: </span>
                      {averageScores.desktop !== null ? (
                        <ScoreBadge
                          score={averageScores.desktop}
                          metricType="performance"
                          deviceType="desktop"
                        />
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
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
                  <PerformanceTable 
                    data={siteFilteredData} 
                    uniquePages={uniquePages}
                    selectedPage={selectedPage}
                    onPageChange={setSelectedPage}
                  />
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