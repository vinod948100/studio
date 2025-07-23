import type { PagePerformance, PerformanceMetrics } from './types';

const createRandomMetrics = (baseScore: number): PerformanceMetrics => ({
  performanceScore: Math.floor(baseScore + Math.random() * 10),
  fcp: parseFloat((0.8 + Math.random() * 1.5).toFixed(2)),
  lcp: parseFloat((1.5 + Math.random() * 2.0).toFixed(2)),
  tbt: Math.floor(50 + Math.random() * 200),
  cls: parseFloat((Math.random() * 0.15).toFixed(3)),
});

const mockData: PagePerformance[] = [
  {
    id: '1',
    reportPath: 'homepage',
    url: 'https://www.truckopedia.com/',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    mobile: {
      '4g': createRandomMetrics(85),
      fast3g: createRandomMetrics(75),
    },
    desktop: {
      '4g': createRandomMetrics(92),
      fast3g: createRandomMetrics(88),
    },
  },
  {
    id: '2',
    reportPath: 'about-us',
    url: 'https://www.truckopedia.com/about-us',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    mobile: {
      '4g': createRandomMetrics(78),
      fast3g: createRandomMetrics(68),
    },
    desktop: {
      '4g': createRandomMetrics(90),
      fast3g: createRandomMetrics(85),
    },
  },
  {
    id: '3',
    reportPath: 'contact',
    url: 'https://www.truckopedia.com/contact',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    mobile: {
      '4g': createRandomMetrics(90),
      fast3g: createRandomMetrics(82),
    },
    desktop: {
      '4g': createRandomMetrics(95),
      fast3g: createRandomMetrics(91),
    },
  },
    {
    id: '4',
    reportPath: 'blog/best-trucks-2024',
    url: 'https://www.truckopedia.com/blog/best-trucks-2024',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    mobile: {
      '4g': createRandomMetrics(65),
      fast3g: createRandomMetrics(55),
    },
    desktop: {
      '4g': createRandomMetrics(80),
      fast3g: createRandomMetrics(75),
    },
  },
  {
    id: '5',
    reportPath: 'gallery',
    url: 'https://www.truckopedia.com/gallery',
    lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    mobile: {
      '4g': createRandomMetrics(50),
      fast3g: createRandomMetrics(40),
    },
    desktop: {
      '4g': createRandomMetrics(70),
      fast3g: createRandomMetrics(65),
    },
  },
];

export async function getPerformanceData(): Promise<PagePerformance[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData;
}
