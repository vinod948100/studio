'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number | null | undefined;
  metricType: 'performance' | 'fcp' | 'lcp' | 'tbt' | 'cls';
  deviceType: 'mobile' | 'desktop';
}

export function ScoreBadge({ score, metricType, deviceType }: ScoreBadgeProps) {
  const getScoreColorClasses = () => {
    if (score === null || score === undefined) {
      return 'bg-gray-100 text-gray-800 border-gray-200'; // Neutral color for no data
    }

    if (metricType === 'performance') {
      if (score >= 90) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      if (score >= 50) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
    } else if (metricType === 'fcp') {
      if (deviceType === 'mobile') {
        if (score <= 1.8) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
        if (score <= 3) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
        return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
      } else { // desktop
        if (score <= 0.9) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
        if (score <= 1.6) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
        return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
      }
    } else if (metricType === 'lcp') {
      if (deviceType === 'mobile') {
        if (score <= 2.5) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
        if (score <= 4) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
        return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
      } else { // desktop
        if (score <= 1.2) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
        if (score <= 2.4) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
        return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
      }
    } else if (metricType === 'tbt') {
       if (deviceType === 'mobile') {
        if (score <= 200) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
        if (score <= 600) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
        return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
      } else { // desktop
        if (score <= 150) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
        if (score <= 350) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
        return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
      }
    } else if (metricType === 'cls') {
      if (score <= 0.1) return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      if (score <= 0.25) return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Default neutral color
  };

  return (
    <Badge
      className={cn(
        'text-base font-bold tabular-nums',
        getScoreColorClasses()
      )}
    >
      {score !== null && score !== undefined ? score.toFixed(metricType === 'cls' ? 2 : 2) : '-'}
    </Badge>
  );
}
