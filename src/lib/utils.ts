import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PagePerformance, NetworkPerformance } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function exportToCsv(data: PagePerformance[], filename: string) {
  const headers = [
    'URL', 'Report Path', 'Last Updated',
    'Mobile 4G Perf', 'Mobile 4G FCP (s)', 'Mobile 4G LCP (s)', 'Mobile 4G TBT (ms)', 'Mobile 4G CLS',
    'Mobile 3G Perf', 'Mobile 3G FCP (s)', 'Mobile 3G LCP (s)', 'Mobile 3G TBT (ms)', 'Mobile 3G CLS',
    'Desktop 4G Perf', 'Desktop 4G FCP (s)', 'Desktop 4G LCP (s)', 'Desktop 4G TBT (ms)', 'Desktop 4G CLS',
    'Desktop 3G Perf', 'Desktop 3G FCP (s)', 'Desktop 3G LCP (s)', 'Desktop 3G TBT (ms)', 'Desktop 3G CLS',
  ];

  const formatVitals = (vitals?: NetworkPerformance['fourG']) => {
    if (!vitals) return Array(5).fill('N/A');
    return [
      vitals.performanceScore,
      vitals.fcp.toFixed(2),
      vitals.lcp.toFixed(2),
      vitals.tbt,
      vitals.cls.toFixed(4)
    ];
  };

  const rows = data.map(item => {
    const mobile4G = formatVitals(item.mobile?.fourG);
    const mobile3G = formatVitals(item.mobile?.fast3g);
    const desktop4G = formatVitals(item.desktop?.fourG);
    const desktop3G = formatVitals(item.desktop?.fast3g);
    
    return [
      `"${item.url}"`,
      `"${item.reportPath}"`,
      `"${new Date(item.lastUpdated).toISOString()}"`,
      ...mobile4G,
      ...mobile3G,
      ...desktop4G,
      ...desktop3G
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
