'use client';
import { useState } from 'react';
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
  Search,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { extractSitemapUrls } from '@/lib/sitemap';
import { useToast } from '@/hooks/use-toast';

interface TestRunnerProps {
  onComplete: () => void;
}

export function TestRunner({ onComplete }: TestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sitemapUrl, setSitemapUrl] = useState('https://www.truckopedia.com/sitemap.xml');
  const [isFetchingPages, setIsFetchingPages] = useState(false);
  const { toast } = useToast();

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
      const response = await fetch('/api/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: test.page }),
      });

      if (!response.ok) {
        // Try to parse error response as JSON, but fallback if it's not
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'An unknown API error occurred.');
        } catch (e) {
          console.error(`Received non-JSON error response from server for ${test.page.url}. Status: ${response.status}`);
          throw new Error('An internal server error occurred. Check server logs for details.');
        }
      }

      const data = await response.json();
      updateResult(index, { status: 'success', log: data.message });

    } catch (error: any) {
      console.error(`Test failed for ${test.page.url}:`, error);
      updateResult(index, { status: 'failed', log: error.message || 'An unknown error occurred.' });
    }
  };


  const handleFetchPages = async () => {
    setIsFetchingPages(true);
    setResults([]);
    try {
      const pages = await extractSitemapUrls(sitemapUrl);
       if (pages.length === 0) {
        toast({
          variant: "destructive",
          title: "Sitemap Error",
          description: "Could not fetch any pages from the sitemap. Please check the URL and try again.",
        })
      }
      setResults(pages.map(page => ({ page, status: 'pending', log: 'Waiting to start...', attempt: 0 })));
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to Fetch Sitemap",
        description: `An error occurred while fetching the sitemap. Please check if the URL is correct and accessible. Details: ${error.message}`,
      })
    } finally {
      setIsFetchingPages(false);
    }
  }

  const handleRunAll = async () => {
    setIsRunning(true);
    const testsToRun = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status !== 'success');

    // Run tests in parallel
    const testPromises = testsToRun.map(({ result, index }) => runTest(result, index));
    
    await Promise.all(testPromises);
    setIsRunning(false);
  };

  const handleRetryFailed = async () => {
    setIsRunning(true);
    const failedTests = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'failed');

    const testPromises = failedTests.map(({ result, index }) => runTest(result, index));
    
    await Promise.all(testPromises);
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
                <span className="ml-2 hidden md:inline">Fetch Pages</span>
            </Button>
        </div>

        {isComplete ? (
           <Alert variant={failedTests > 0 ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
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
              {isRunning ? `Running tests... (${completedTests}/${totalTests} complete)` : `Completed ${completedTests} of ${totalTests} tests.`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
           {!isRunning && !isComplete && totalTests > 0 && (
            <Button onClick={handleRunAll} disabled={results.every(r => r.status === 'success')}>
              <Play /> Run All Tests
            </Button>
          )}
          {isRunning && (
            <Button disabled>
              <Loader className="animate-spin" /> Running...
            </Button>
          )}
           {!isRunning && isComplete && failedTests > 0 && (
             <Button onClick={handleRetryFailed} variant="outline">
              <RefreshCw /> Retry {failedTests} Failed Test{failedTests > 1 ? 's' : ''}
             </Button>
           )}
          {(isComplete || (totalTests > 0 && !isRunning)) && (
            <>
             <Button onClick={() => onComplete()} variant="secondary">
                <ChevronRight/> View Reports
            </Button>
             <Button onClick={handleReset} variant="outline">
                <RefreshCw/> Run New Test
            </Button>
            </>
          )}
        </div>

        <ScrollArea className="h-72 rounded-md border">
          <div className="p-4 space-y-4">
             {results.length === 0 && !isFetchingPages && <div className="text-center text-muted-foreground py-10">Enter a sitemap URL and click "Fetch Pages" to begin.</div>}
             {isFetchingPages && <div className="text-center text-muted-foreground py-10 flex items-center justify-center gap-2"><Loader className="animate-spin" /> Fetching pages...</div>}
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

    