
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
  Gauge,
  Smartphone,
  Laptop,
  Timer,
  StretchHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface PerformanceTableProps {
  data: PagePerformance[];
}

function VitalsRow({ performance }: { performance: NetworkPerformance }) {
  return (
    <>
      <TableCell className="text-center">
        <ScoreBadge score={performance['4g'].performanceScore} />
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance['4g'].fcp}s
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance['4g'].lcp}s
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance['4g'].tbt}ms
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance['4g'].cls}
      </TableCell>
      <TableCell className="text-center">
        <ScoreBadge score={performance.fast3g.performanceScore} />
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance.fast3g.fcp}s
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance.fast3g.lcp}s
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance.fast3g.tbt}ms
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {performance.fast3g.cls}
      </TableCell>
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



export function PerformanceTable({ data }: PerformanceTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof PagePerformance | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    null
  );

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle timestamp sorting separately
      if (sortColumn === 'timestamp') {
        const getTimestamp = (value: any) => {
          if (value && typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') {
            return new Date(value.seconds * 1000).getTime();
          }
          return 0;
        };
        const aTime = getTimestamp(aValue);
        const bTime = getTimestamp(bValue);
        if (aTime < bTime) return sortDirection === 'asc' ? -1 : 1;
        if (aTime > bTime) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: keyof PagePerformance) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <TooltipProvider>
      <Tabs defaultValue="mobile">
        <TabsList className="grid w-full grid-cols-2 md:w-96">
          <TabsTrigger value="mobile">
            <Smartphone className="mr-2 h-4 w-4" /> Mobile
          </TabsTrigger>
          <TabsTrigger value="desktop">
            <Laptop className="mr-2 h-4 w-4" /> Desktop
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mobile">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] font-bold">Page</TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      Timestamp <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <VitalsHeader />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((page) => (
                  <TableRow key={page.id}>
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
                      {typeof page.timestamp === 'object' && page.timestamp !== null && 'seconds' in page.timestamp
                        ? new Date((page.timestamp as { seconds: number }).seconds * 1000).toLocaleString()
                        : typeof page.timestamp === 'string'
                        ? page.timestamp
                        : ''}
                    </TableCell>
                    <VitalsRow performance={page.mobile} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="desktop">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] font-bold">Page</TableHead>
                   <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      Timestamp <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <VitalsHeader />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((page) => (
                  <TableRow key={page.id}>
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
                      {typeof page.timestamp === 'object' && page.timestamp !== null && 'seconds' in page.timestamp
                        ? new Date((page.timestamp as { seconds: number }).seconds * 1000).toLocaleString()
                        : typeof page.timestamp === 'string'
                        ? page.timestamp
                        : ''}
                    </TableCell>
                    <VitalsRow performance={page.desktop} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
