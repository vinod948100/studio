import type { RunLighthouseTestOutput } from './lighthouse-types';

export type PerformanceMetrics = RunLighthouseTestOutput['mobile']['fourG'];

export type NetworkPerformance = {
  fourG: PerformanceMetrics;
  fast3g: PerformanceMetrics;
}

export type PagePerformance = {
  id: string;
  reportPath: string;
  url: string;
  lastUpdated: string;
  application: SiteKey;
  mobile: NetworkPerformance;
  desktop: NetworkPerformance;
  timestamp: string; 
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

export type SiteKey = 'truckopedia' | 'eform2290' | 'emcs150';
