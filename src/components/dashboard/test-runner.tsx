'use client';
import { useState } from 'react';
import { runLighthouseTestForPage } from '@/ai/flows/run-lighthouse-flow';
import type { TestResult, PageToTest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Loader,
  Play,
  RefreshCw,
  Rocket,
  Search,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { extractSitemapUrls } from '@/lib/sitemap';

interface TestRunnerProps {
  onComplete: () => void;
}

export function TestRunner({ onComplete }: TestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sitemapUrl, setSitemapUrl] = useState('https://www.truckopedia.com/sitemap.xml');
  const [isFetchingPages, setIsFetchingPages] = useState(false);

  const totalTests = results.length;
  const completedTests = results.filter(
    (r) => r.status === 'success' || r.status === 'failed'
  ).length;
  const progress =
    totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
  const isComplete = !isRunning && completedTests > 0 && completedTests === totalTests;

  const updateResult = (index: number, newResult: Partial<TestResult>) => {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...newResult } : r))
    );
  };

  const runTest = async (test: TestResult, index: number) => {
    updateResult(index, { status: 'running', log: 'Starting test...', attempt: test.attempt + 1 });
    try {
      const log = await runLighthouseTestForPage(test.page);
      updateResult(index, { status: 'success', log });
    } catch (error: any) {
      updateResult(index, { status: 'failed', log: error.message || 'An unknown error occurred.' });
    }
  };

  const handleFetchPages = async () => {
    setIsFetchingPages(true);
    setResults([]);
    try {
      const pages = await extractSitemapUrls(sitemapUrl);
      setResults(pages.map(page => ({ page, status: 'pending', log: 'Waiting to start...', attempt: 0 })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingPages(false);
    }
  }

  const handleRunAll = async () => {
    setIsRunning(true);
    const pendingTests = results.map((_, i) => i);
    for (const index of pendingTests) {
      if (results[index].status !== 'success') {
         await runTest(results[index], index);
      }
    }
    setIsRunning(false);
  };

  const handleRetryFailed = async () => {
    setIsRunning(true);
    const failedTestIndices = results
      .map((r, i) => (r.status === 'failed' ? i : -1))
      .filter((i) => i !== -1);
    
    for (const index of failedTestIndices) {
      await runTest(results[index], index);
    }
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setResults([]);
    setIsRunning(false);
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <CircleDashed className="text-muted-foreground" />;
      case 'running':
        return <Loader className="animate-spin text-primary" />;
      case 'success':
        return <CheckCircle2 className="text-success" />;
      case 'failed':
        return <XCircle className="text-danger" />;
    }
  };
  
  const failedTests = results.filter(r => r.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Run Performance Tests
        </CardTitle>
        <CardDescription>
          Enter a sitemap URL to fetch pages, then run the Lighthouse tests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
            <Input 
                placeholder="Enter sitemap.xml URL" 
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                disabled={isFetchingPages || isRunning}
            />
            <Button onClick={handleFetchPages} disabled={isFetchingPages || isRunning || !sitemapUrl}>
                {isFetchingPages ? <Loader className="animate-spin" /> : <Search />}
                Fetch Pages
            </Button>
        </div>

        {isComplete ? (
           <Alert variant={failedTests > 0 ? "destructive" : "default"}>
            <Rocket className="h-4 w-4" />
            <AlertTitle>Test Run Complete!</AlertTitle>
            <AlertDescription>
              {totalTests - failedTests} tests passed out of {totalTests}.
              {failedTests > 0 && " Some tests failed and may need to be retried."}
            </AlertDescription>
          </Alert>
        ) : (
          totalTests > 0 && <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              {isRunning ? `Running test ${completedTests + 1} of ${totalTests}...` : `Completed ${completedTests} of ${totalTests} tests.`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
           {!isRunning && !isComplete && totalTests > 0 && (
            <Button onClick={handleRunAll}>
              <Play /> Run All Tests
            </Button>
          )}
          {isRunning && (
            <Button disabled>
              <Loader className="animate-spin" /> Running...
            </Button>
          )}
           {!isRunning && isComplete && failedTests > 0 && (
             <Button onClick={handleRetryFailed} variant="destructive">
              <RefreshCw /> Retry {failedTests} Failed Test{failedTests > 1 ? 's' : ''}
             </Button>
           )}
          {!isRunning && isComplete && (
            <>
             <Button onClick={() => onComplete()}>
                <ChevronRight/> View Reports
            </Button>
             <Button onClick={handleReset} variant="outline">
                <RefreshCw/> Run Again
            </Button>
            </>
          )}
        </div>

        <ScrollArea className="h-72 rounded-md border">
          <div className="p-4 space-y-4">
             {results.length === 0 && !isFetchingPages && <div className="text-center text-muted-foreground">Enter a sitemap URL and click "Fetch Pages" to begin.</div>}
             {results.map((result, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(result.status)}</div>
                <div className="flex-1">
                  <p className="font-medium">{result.page.reportPath}</p>
                  <p className={cn("text-sm", 
                     result.status === 'failed' ? 'text-danger' : 'text-muted-foreground'
                  )}>
                    {result.log}
                  </p>
                </div>
                 {!isRunning && result.status === 'failed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => runTest(result, index)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
