
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
} from 'lucide-react';
import Link from 'next/link';

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
                  <VitalsHeader />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((page) => (
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
                  <VitalsHeader />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((page) => (
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
