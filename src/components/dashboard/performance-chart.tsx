
'use client';
import { useMemo, useState } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PagePerformance } from '@/lib/types';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

interface PerformanceChartProps {
  data: PagePerformance[];
  dateRange?: DateRange;
}

// Helper to generate a color from a string.
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// This is the core data processing logic.
const processChartData = (data: PagePerformance[], dateRange?: DateRange, selectedPage?: string) => {
    // 1. Generate all days in the selected date range
    const allDaysInRange =
      dateRange && dateRange.from && dateRange.to
        ? eachDayOfInterval({
            start: startOfDay(dateRange.from),
            end: startOfDay(dateRange.to),
          })
        : [];

    // 2. Get a list of unique pages
    const uniquePages = Array.from(
      new Map(data.map((item) => [item.reportPath, item])).values()
    );

    // 3. Filter data for the selected page
    const filteredData = selectedPage ? data.filter(item => item.reportPath === selectedPage) : [];

    // 4. Create the final chart data structure, grouped by attribute and device/connection
    const chartData: Record<string, any>[] = [];

    allDaysInRange.forEach((date) => {
        const dayKey = format(date, 'yyyy-MM-dd');
        const record: { name: string; [key: string]: any } = {
          name: format(date, 'MMM d'),
        };

        if (selectedPage) {
            const pageDataForDay = filteredData.filter(d => format(new Date(d.lastUpdated), 'yyyy-MM-dd') === dayKey);

            ['cls', 'fcp', 'lcp', 'performanceScore', 'tbt'].forEach(attribute => {
                ['mobile-4g', 'mobile-fast3g', 'desktop-4g', 'desktop-fast3g'].forEach(connectionType => {
                    const [device, connection] = connectionType.split('-');
                    const key = `${attribute}-${device}-${connection}`;

                    // Type-safe access
                    type DeviceType = 'mobile' | 'desktop';
                    type ConnectionType = '4g' | 'fast3g';

                    function getDeviceData(d: PagePerformance, device: DeviceType) {
                        return device === 'mobile' ? d.mobile : d.desktop;
                    }

                    function getConnectionData(deviceData: any, connection: ConnectionType) {
                        return deviceData ? deviceData[connection] : undefined;
                    }

                    const attributeData = pageDataForDay.filter(d => {
                        const deviceData = getDeviceData(d, device as DeviceType);
                        const connectionData = getConnectionData(deviceData, connection as ConnectionType);
                        return connectionData && connectionData[attribute] !== undefined;
                    });

                    if (attributeData.length > 0) {
                        const avgAttributeValue = attributeData.reduce((acc, curr) => {
                            const deviceData = getDeviceData(curr, device as DeviceType);
                            const connectionData = getConnectionData(deviceData, connection as ConnectionType);
                            return acc + (connectionData ? connectionData[attribute] : 0);
                        }, 0) / attributeData.length;
                        // For certain attributes, values can be small, round to fewer decimal places
                        record[key] = (attribute === 'cls') ? parseFloat(avgAttributeValue.toFixed(3)) : Math.round(avgAttributeValue);
                    } else {
                        record[key] = null;
                    }
                });
            });
        }
        chartData.push(record);
    });

    // 5. Create dynamic chart config for colors and labels
    const chartConfig: any = {};
     ['cls', 'fcp', 'lcp', 'performanceScore', 'tbt'].forEach(attribute => {
        ['mobile-4g', 'mobile-fast3g', 'desktop-4g', 'desktop-fast3g'].forEach(connectionType => {
            const [device, connection] = connectionType.split('-');
            const key = `${attribute}-${device}-${connection}`;
            chartConfig[key] = {
                label: `${attribute} (${device} ${connection})`,
                color: stringToColor(key),
            };
        });
    });

    return { chartData, uniquePages, chartConfig };
}


export function PerformanceChart({ data, dateRange }: PerformanceChartProps) {
  const uniquePagesList = useMemo(() => Array.from(new Set(data.map(item => item.reportPath))), [data]);
  const [selectedPage, setSelectedPage] = useState<string | undefined>(uniquePagesList[0]); // Select the first page by default

  const { chartData, uniquePages, chartConfig } = useMemo(() => processChartData(data, dateRange, selectedPage), [data, dateRange, selectedPage]);

  const attributes = ['cls', 'fcp', 'lcp', 'tbt']; // Attributes for separate charts
  const devices = ['mobile', 'desktop'];
  const connections = ['4g', 'fast3g'];

  if (!selectedPage || chartData.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Trend of performance attributes for selected pages.</CardDescription>
                    <div className="mt-4 flex items-center gap-4">
                        <Select onValueChange={setSelectedPage} value={selectedPage}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a page" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniquePagesList.map(page => (
                                    <SelectItem key={page} value={page}>{page}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!selectedPage && <p className="text-muted-foreground">Select a page to view data.</p>}
                    </div>
              </CardHeader>
              <CardContent className='h-96 flex items-center justify-center'>
                  {selectedPage ? <p className='text-muted-foreground'>No data available for the selected page and date range.</p> : null}
              </CardContent>
          </Card>
      )
  }

  return (
    <div className='flex flex-col gap-6'>
        <Card>
            <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Trend of performance attributes for the selected page.</CardDescription>
                <div className="mt-4 flex items-center gap-4">
                    <Select onValueChange={setSelectedPage} value={selectedPage}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a page" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniquePagesList.map(page => (
                                <SelectItem key={page} value={page}>{page}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map(device => (
                attributes.map(attribute => {
                    const dataKeysToShow = connections.map(connection => `${attribute}-${device}-${connection}`);
                    // Check if there is data available for any of the keys for this chart
                    const hasData = chartData.some(dayData => dataKeysToShow.some(key => dayData[key] !== null && dayData[key] !== undefined));

                    if (!hasData) return null; // Don't render chart if no data

                    return (
                        <Card key={`${device}-${attribute}-chart`}>
                            <CardHeader>
                                <CardTitle>{`${attribute.toUpperCase()} Trend (${device})`}</CardTitle>
                                <CardDescription>Trend for {attribute} on {device} for {selectedPage}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart
                                            accessibilityLayer
                                            data={chartData}
                                            margin={{
                                                top: 5,
                                                right: 20,
                                                left: 10,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <YAxis
                                                // domain={[0, 'auto']} // Dynamic Y-axis domain
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            >
                                                <Label
                                                    value={attribute.toUpperCase()}
                                                    angle={-90}
                                                    position="insideLeft"
                                                    style={{ textAnchor: 'middle' }}
                                                />
                                            </YAxis>
                                            <ChartTooltip
                                                cursor={{
                                                    strokeDasharray: '3 3',
                                                }}
                                                content={<ChartTooltipContent indicator="line" />}
                                            />
                                            {dataKeysToShow.map((key) => (
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
                })
            ))}

            {/* Optional: Add a separate chart for Performance Score if needed */}
             {devices.map(device => {
                const attribute = 'performanceScore';
                 const dataKeysToShow = connections.map(connection => `${attribute}-${device}-${connection}`);
                 const hasData = chartData.some(dayData => dataKeysToShow.some(key => dayData[key] !== null && dayData[key] !== undefined));

                 if (!hasData) return null;

                 return (
                     <Card key={`${device}-${attribute}-chart`}>
                         <CardHeader>
                             <CardTitle>{`${attribute.toUpperCase()} Trend (${device})`}</CardTitle>
                             <CardDescription>Trend for {attribute} on {device} for {selectedPage}.</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                 <ResponsiveContainer width="100%" height={300}>
                                     <LineChart
                                         accessibilityLayer
                                         data={chartData}
                                         margin={{
                                             top: 5,
                                             right: 20,
                                             left: 10,
                                             bottom: 20,
                                         }}
                                     >
                                         <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                         <XAxis
                                             dataKey="name"
                                             tickLine={false}
                                             axisLine={false}
                                             tickMargin={8}
                                         />
                                         <YAxis
                                             domain={[0, 100]} // Performance score is 0-100
                                             tickLine={false}
                                             axisLine={false}
                                             tickMargin={8}
                                         >
                                             <Label
                                                 value="Score"
                                                 angle={-90}
                                                 position="insideLeft"
                                                 style={{ textAnchor: 'middle' }}
                                             />
                                         </YAxis>
                                         <ChartTooltip
                                             cursor={{
                                                 strokeDasharray: '3 3',
                                             }}
                                             content={<ChartTooltipContent indicator="line" />}
                                         />
                                         {dataKeysToShow.map((key) => (
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