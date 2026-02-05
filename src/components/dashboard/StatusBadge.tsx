import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, label, size = 'sm', className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        size === 'sm' ? 'text-2xs px-1.5 py-0' : 'text-xs px-2 py-0.5',
        status === 'healthy' && 'border-healthy bg-healthy-bg text-healthy-foreground',
        status === 'warning' && 'border-warning bg-warning-bg text-warning-foreground',
        status === 'critical' && 'border-critical bg-critical-bg text-critical-foreground',
        status === 'neutral' && 'border-muted bg-muted text-muted-foreground',
        className
      )}
    >
      {label}
    </Badge>
  );
}