'use client';
import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

import type { SiteKey } from '@/lib/types';

// Define TypeScript interfaces for type safety
interface MetricData {
  performanceScore?: number;
  fcp?: number;
  lcp?: number;
  tbt?: number;
  cls?: number;
}

interface NetworkPerformance {
  '4g'?: MetricData;
  fast3g?: MetricData;
}

interface PagePerformance {
  reportPath: string;
  lastUpdated: string | Date;
  application: SiteKey;
  mobile?: NetworkPerformance;
  desktop?: NetworkPerformance;
}

interface PerformanceChartProps {
  data: PagePerformance[];
  dateRange?: DateRange;
}

// Thresholds for coloring lines based on metric values
const THRESHOLDS = {
  performanceScore: {
    mobile: {
      green: [90, 100],
      orange: [50, 89],
      red: [0, 49],
    },
    desktop: {
      green: [90, 100],
      orange: [50, 89],
      red: [0, 49],
    },
  },
  fcp: {
    mobile: {
      green: [0, 1.8],
      orange: [1.8, 3],
      red: [3, Infinity],
    },
    desktop: {
      green: [0, 0.9],
      orange: [0.9, 1.6],
      red: [1.6, Infinity],
    },
  },
  lcp: {
    mobile: {
      green: [0, 2.5],
      orange: [2.5, 4],
      red: [4, Infinity],
    },
    desktop: {
      green: [0, 1.2],
      orange: [1.2, 2.4],
      red: [2.4, Infinity],
    },
  },
  tbt: {
    mobile: {
      green: [0, 200],
      orange: [200, 600],
      red: [600, Infinity],
    },
    desktop: {
      green: [0, 150],
      orange: [150, 350],
      red: [350, Infinity],
    },
  },
  cls: {
    mobile: {
      green: [0, 0.1],
      orange: [0.1, 0.25],
      red: [0.25, Infinity],
    },
    desktop: {
      green: [0, 0.1],
      orange: [0.1, 0.25],
      red: [0.25, Infinity],
    },
  },
};

// Function to determine color based on metric value and thresholds
const getMetricColor = (
  metric: keyof typeof THRESHOLDS,
  device: 'mobile' | 'desktop',
  value: number
): string => {
  const thresholds = THRESHOLDS[metric][device];
  if (value >= thresholds.green[0] && value <= thresholds.green[1]) {
    return '#00FF00'; // Green
  } else if (value > thresholds.orange[0] && value <= thresholds.orange[1]) {
    return '#FFA500'; // Orange
  } else {
    return '#FF0000'; // Red
  }
};

// Process chart data
const processChartData = (data: PagePerformance[], dateRange?: DateRange) => {
  const allDaysInRange =
    dateRange && dateRange.from && dateRange.to
      ? eachDayOfInterval({ start: startOfDay(dateRange.from), end: startOfDay(dateRange.to) })
      : [];

  // Calculate average values for each metric to determine line colors
  const averageValues: Record<string, number | null> = {};
  const metrics: (keyof MetricData)[] = ['performanceScore', 'fcp', 'lcp', 'tbt', 'cls'];
  const devices: ('mobile' | 'desktop')[] = ['mobile', 'desktop'];
  const networks: ('4g' | 'fast3g')[] = ['4g', 'fast3g'];

  devices.forEach((device) => {
    networks.forEach((network) => {
      metrics.forEach((metric) => {
        const key = `${device}-${network}-${metric}`;
        const relevantData = data
          .map((d) => d[device]?.[network]?.[metric])
          .filter((v): v is number => v !== undefined && v !== null);
        averageValues[key] =
          relevantData.length > 0
            ? relevantData.reduce((a, b) => a + b, 0) / relevantData.length
            : null;
      });
    });
  });

  const chartData: Record<string, any>[] = allDaysInRange.map((date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const record: { name: string; [key: string]: any } = {
      name: format(date, 'MMM d'),
    };

    const dataForDay = data.filter(
      (d) => format(new Date(d.lastUpdated), 'yyyy-MM-dd') === dayKey
    );

    devices.forEach((device) => {
      networks.forEach((network) => {
        metrics.forEach((metric) => {
          const key = `${device}-${network}-${metric}`;
          const relevantData = dataForDay
            .map((d) => d[device]?.[network]?.[metric])
            .filter((v): v is number => v !== undefined && v !== null);

          if (relevantData.length > 0) {
            const avg = relevantData.reduce((a, b) => a + b, 0) / relevantData.length;
            record[key] = metric === 'cls' ? parseFloat(avg.toFixed(4)) : Math.round(avg);
          } else {
            record[key] = null;
          }
        });
      });
    });

    return record;
  });

  const chartConfig: Record<string, { label: string; color: string }> = {};
  devices.forEach((device) => {
    networks.forEach((network) => {
      metrics.forEach((metric) => {
        const key = `${device}-${network}-${metric}`;
        const avgValue = averageValues[key];
        const color =
          avgValue !== null
            ? getMetricColor(metric, device, avgValue)
            : '#000000'; // Default to black if no data
        chartConfig[key] = {
          label: `${device.charAt(0).toUpperCase()}${device.slice(1)} ${network.toUpperCase()} ${metric.toUpperCase()}`,
          color,
        };
      });
    });
  });

  return { chartData, chartConfig };
};

// Define MetricConfig type
interface MetricConfig {
  label: string;
  unit: string;
  domain?: [number, number | 'auto'];
}

const METRIC_CONFIG: Record<keyof MetricData, MetricConfig> = {
  performanceScore: { label: 'Performance Score', unit: '', domain: [0, 100] },
  fcp: { label: 'First Contentful Paint', unit: 's' },
  lcp: { label: 'Largest Contentful Paint', unit: 's' },
  tbt: { label: 'Total Blocking Time', unit: 'ms' },
  cls: { label: 'Cumulative Layout Shift', unit: '' },
};

export function PerformanceChart({ data, dateRange }: PerformanceChartProps) {
  const { chartData, chartConfig } = useMemo(
    () => processChartData(data, dateRange),
    [data, dateRange]
  );

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Performance trend for all pages (average).</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">No data available for the selected date range.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Performance trend for all pages (average).</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {(Object.keys(METRIC_CONFIG) as (keyof typeof METRIC_CONFIG)[]).map((metric) => {
          const dataKeys = ['mobile-4g', 'mobile-fast3g', 'desktop-4g', 'desktop-fast3g'].map(
            (k) => `${k}-${metric}`
          );
          const hasData = chartData.some((dayData) =>
            dataKeys.some((key) => dayData[key] !== null && dayData[key] !== undefined)
          );

          if (!hasData) return null;

          return (
            <Card key={`${metric}-chart`}>
              <CardHeader>
                <CardTitle>{METRIC_CONFIG[metric].label} Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      accessibilityLayer
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        domain={METRIC_CONFIG[metric].domain ?? [0, 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      >
                        <Label
                          value={METRIC_CONFIG[metric].unit}
                          angle={-90}
                          position="insideLeft"
                          style={{ textAnchor: 'middle' }}
                        />
                      </YAxis>
                      <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent indicator="line" />} />
                      <Legend />
                      {dataKeys.map((key) => (
                        <Line
                          key={key}
                          dataKey={key}
                          name={chartConfig[key]?.label}
                          type="monotone"
                          stroke={chartConfig[key]?.color}
                          strokeWidth={2}
                          dot={true}
                          connectNulls={true}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}