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
