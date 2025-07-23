export type PerformanceMetrics = {
  performanceScore: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
};

export type NetworkPerformance = {
  '4g': PerformanceMetrics;
  fast3g: PerformanceMetrics;
}

export type PagePerformance = {
  id: string;
  reportPath: string;
  url: string;
  lastUpdated: string;
  mobile: NetworkPerformance;
  desktop: NetworkPerformance;
};

export type PageToTest = {
  reportPath: string;
  url: string;
}

export type TestResult = {
  page: PageToTest;
  status: 'pending' | 'running' | 'success' | 'failed';
  log: string;
  attempt: number;
}

export const pagesToTest: PageToTest[] = [
  {
    reportPath: 'homepage',
    url: 'https://www.truckopedia.com/',
  },
  {
    reportPath: 'about-us',
    url: 'https://www.truckopedia.com/about-us',
  },
  {
    reportPath: 'contact',
    url: 'https://www.truckopedia.com/contact',
  },
    {
    reportPath: 'blog/best-trucks-2024',
    url: 'https://www.truckopedia.com/blog/best-trucks-2024',
  },
  {
    reportPath: 'gallery',
    url: 'https://www.truckopedia.com/gallery',
  },
];
