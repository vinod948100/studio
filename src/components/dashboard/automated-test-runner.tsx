
'use client';
import { useState, useEffect } from 'react';
import type { TestResult, PageToTest, SiteKey } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  CircleDashed,
  Loader,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { extractSitemapUrls } from '@/ai/flows/sitemap-flow';
import { SITES } from '@/lib/sites';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface AutomatedTestRunnerProps {
  site: SiteKey;
  onComplete: () => void;
}

export function AutomatedTestRunner({ site, onComplete }: AutomatedTestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFetchingPages, setIsFetchingPages] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        let errorMessage = `An internal server error occurred. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // ignore
        }
        updateResult(index, { status: 'failed', log: errorMessage });
        return; 
      }
      
      const responseBody = await response.json();
      updateResult(index, { status: 'success', log: responseBody.message });

    } catch (error: any) {
      updateResult(index, { status: 'failed', log: error.message || 'An unknown error occurred.' });
    }
  };


  useEffect(() => {
    const handleFetchAndRun = async () => {
        setIsFetchingPages(true);
        setIsRunning(true);
        setError(null);
        setResults([]);
        
        try {
            const sitemapUrl = SITES[site].sitemapUrl;
            const pages = await extractSitemapUrls(sitemapUrl);
            if (pages.length === 0) {
                const fetchError = "Could not fetch any pages from the sitemap. Please check the URL and try again.";
                setError(fetchError);
                toast({ variant: "destructive", title: "Sitemap Error", description: fetchError });
                setIsRunning(false);
                setIsFetchingPages(false);
                return;
            }

            const initialResults = pages.map(page => ({ page, status: 'pending', log: 'Waiting to start...', attempt: 0 }));
            setResults(initialResults);
            setIsFetchingPages(false);

            // Run tests in parallel
            const testPromises = initialResults.map((result, index) => runTest(result, index));
            await Promise.all(testPromises);

            setIsRunning(false);
            onComplete();

        } catch (error: any) {
            setError(error.message);
            toast({
                variant: "destructive",
                title: "Failed to Fetch Sitemap",
                description: `An error occurred while fetching the sitemap. Details: ${error.message}`,
            })
            setIsRunning(false);
            setIsFetchingPages(false);
        }
    }
    
    handleFetchAndRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);


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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Running Performance Tests for {SITES[site].name}
        </CardTitle>
        <CardDescription>
          Fetching pages from the sitemap and running Lighthouse tests automatically. Please wait...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
       
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isFetchingPages && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader className="animate-spin" /> Fetching pages from sitemap...
            </div>
        )}

        {!isFetchingPages && !error && (
            <>
                <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">
                    Running tests... ({completedTests}/{totalTests} complete)
                    </p>
                </div>

                <ScrollArea className="h-72 rounded-md border">
                    <div className="p-4 space-y-4">
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
                        </div>
                        ))}
                    </div>
                </ScrollArea>
            </>
        )}

      </CardContent>
    </Card>
  );
}
