'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const getScoreColorClasses = () => {
    if (score >= 90) {
      return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
    }
    if (score >= 50) {
      return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
    }
    return 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20';
  };

  return (
    <Badge
      className={cn(
        'text-base font-bold tabular-nums',
        getScoreColorClasses()
      )}
    >
      {score}
    </Badge>
  );
}
