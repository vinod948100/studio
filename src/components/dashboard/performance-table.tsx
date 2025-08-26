// performance-table.tsx (modified)
'use client';

import type { PagePerformance, NetworkPerformance } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScoreBadge } from './score-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowRight,
  Blocks,
  ExternalLink,
  GanttChart,
  BookOpen,
  ShoppingBag,
  Workflow,
  Building,
  Gauge,
  Smartphone,
  Laptop,
  Timer,
  StretchHorizontal,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';

interface PerformanceTableProps {
  data: PagePerformance[];
  uniquePages: string[];
  selectedPage: string | 'all';
  onPageChange: (value: string | 'all') => void;
}

function VitalsRow({ performance }: { performance: NetworkPerformance }) {
  const formatValue = (value: number | undefined, isCls = false) => {
    if (value === undefined || value === null) return '-';
    return isCls ? value.toFixed(2) : value.toFixed(4);
  };
  
  return performance ? (
    <>
      <TableCell className="text-center align-middle">
        <ScoreBadge
          score={performance?.fourG?.performanceScore ?? 0}
          metricType="performance"
          deviceType="mobile"
        />
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fourG?.fcp !== undefined && performance?.fourG?.fcp !== null ? (
          <ScoreBadge
            score={performance.fourG.fcp}
            metricType="fcp"
            deviceType="mobile"
          />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fourG?.lcp !== undefined && performance?.fourG?.lcp !== null ? (
          <ScoreBadge
            score={performance.fourG.lcp}
            metricType="lcp"
            deviceType="mobile"
          />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fourG?.tbt !== undefined && performance?.fourG?.tbt !== null ? (
          <ScoreBadge
            score={performance.fourG.tbt}
            metricType="tbt"
            deviceType="mobile"
          />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fourG?.cls !== undefined && performance?.fourG?.cls !== null ? (
          <ScoreBadge
            score={performance.fourG.cls}
            metricType="cls"
            deviceType="mobile"
          />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center align-middle">
        <ScoreBadge
          score={performance?.fast3g?.performanceScore ?? 0}
          metricType="performance"
          deviceType="desktop"
        />
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fast3g?.fcp !== undefined && performance?.fast3g?.fcp !== null ? (
          <ScoreBadge score={performance.fast3g.fcp} metricType="fcp" deviceType="desktop" />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fast3g?.lcp !== undefined && performance?.fast3g?.lcp !== null ? (
          <ScoreBadge score={performance.fast3g.lcp} metricType="lcp" deviceType="desktop" />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fast3g?.tbt !== undefined && performance?.fast3g?.tbt !== null ? (
          <ScoreBadge score={performance.fast3g.tbt} metricType="tbt" deviceType="desktop" />
        ) : ('-')}
      </TableCell>
      <TableCell className="text-center tabular-nums align-middle">
        {performance?.fast3g?.cls !== undefined && performance?.fast3g?.cls !== null ? (
          <ScoreBadge score={performance.fast3g.cls} metricType="cls" deviceType="desktop" />
        ) : ('-')}
      </TableCell>
    </>
  ) : (
    <>
      <TableCell className="text-center">-</TableCell>
      <TableCell className="text-center tabular-nums">-</TableCell>
      <TableCell className="text-center tabular-nums">-</TableCell>
      <TableCell className="text-center tabular-nums">-</TableCell>
      <TableCell className="text-center tabular-nums">-</TableCell>
    </>
  );
}

function VitalsHeader() {
  const vitals = [
    { icon: Gauge, label: 'Performance Score', unit: '' },
    { icon: Timer, label: 'First Contentful Paint', unit: '(s)' },
    { icon: ArrowRight, label: 'Largest Contentful Paint', unit: '(s)' },
    { icon: Blocks, label: 'Total Blocking Time', unit: '(ms)' },
    { icon: StretchHorizontal, label: 'Cumulative Layout Shift', unit: '' },
  ];

  return (
    <>
      {vitals.map((vital, index) => (
        <TableHead key={`4g-${index}`} className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center justify-center gap-2">
                <vital.icon className="h-4 w-4" />
                <span>4G</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{vital.label} (4G)</p>
            </TooltipContent>
          </Tooltip>
        </TableHead>
      ))}
      {vitals.map((vital, index) => (
        <TableHead key={`3g-${index}`} className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center justify-center gap-2">
                <vital.icon className="h-4 w-4" />
                <span>3G</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{vital.label} (Fast 3G)</p>
            </TooltipContent>
          </Tooltip>
        </TableHead>
      ))}
    </>
  );
}

export function PerformanceTable({ data, uniquePages, selectedPage, onPageChange }: PerformanceTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof PagePerformance | 'lastUpdated'>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      if (sortColumn === 'lastUpdated') {
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: keyof PagePerformance | 'lastUpdated') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: keyof PagePerformance | 'lastUpdated') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? '▲' : '▼';
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <TooltipProvider>
      <Tabs defaultValue="mobile">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <Select onValueChange={onPageChange} value={selectedPage}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {uniquePages.map((path) => (
                  <SelectItem key={path} value={path}>
                    {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="mobile">
              <Smartphone className="mr-2 h-4 w-4" /> Mobile
            </TabsTrigger>
            <TabsTrigger value="desktop">
              <Laptop className="mr-2 h-4 w-4" /> Desktop
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="overflow-x-auto rounded-lg border mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] font-bold">Page</TableHead>
                <TableHead
                  className="font-bold cursor-pointer"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center gap-1">
                    Last Updated {getSortIndicator('lastUpdated')}
                  </div>
                </TableHead>
                <VitalsHeader />
              </TableRow>
            </TableHeader>
            <TabsContent value="mobile">
              <TableBody>
                {sortedData.map((page) => (
                  <TableRow key={page.id + '-mobile'}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-bold">{page.reportPath}</span>
                        <Link
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {page.url}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(page.lastUpdated).toLocaleString()}
                    </TableCell>
                    <VitalsRow performance={page.mobile} />
                  </TableRow>
                ))}
              </TableBody>
            </TabsContent>
            <TabsContent value="desktop">
              <TableBody>
                {sortedData.map((page) => (
                  <TableRow key={page.id + '-desktop'}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-bold">{page.reportPath}</span>
                        <Link
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {page.url}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(page.lastUpdated).toLocaleString()}
                    </TableCell>
                    <VitalsRow performance={page.desktop} />
                  </TableRow>
                ))}
              </TableBody>
            </TabsContent>
          </Table>
        </div>
      </Tabs>
    </TooltipProvider>
  );
}