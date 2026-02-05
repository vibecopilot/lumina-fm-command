import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  status?: 'healthy' | 'warning' | 'critical';
  onClick?: () => void;
  drillDownType?: string;
  className?: string;
  subtitle?: string;
  breakdown?: { label: string; value: number; status?: 'healthy' | 'warning' | 'critical' | 'neutral' }[];
}

export function KPICard({
  title,
  value,
  unit = '%',
  trend,
  trendDirection = 'neutral',
  trendLabel,
  status,
  onClick,
  className,
  subtitle,
  breakdown,
}: KPICardProps) {
  const { currentRole } = useDashboard();
  
  const getStatusColor = () => {
    if (!status) {
      const numValue = typeof value === 'number' ? value : parseFloat(value as string);
      if (numValue >= 85) return 'healthy';
      if (numValue >= 70) return 'warning';
      return 'critical';
    }
    return status;
  };

  const statusColor = getStatusColor();

  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return <TrendingUp className="h-3.5 w-3.5" />;
    }
    if (trendDirection === 'down') {
      return <TrendingDown className="h-3.5 w-3.5" />;
    }
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    // For resolution time, down is good
    if (title.toLowerCase().includes('resolution')) {
      return trendDirection === 'down' ? 'text-healthy' : trendDirection === 'up' ? 'text-critical' : 'text-muted-foreground';
    }
    return trendDirection === 'up' ? 'text-healthy' : trendDirection === 'down' ? 'text-critical' : 'text-muted-foreground';
  };

  const getBreakdownDotColor = (breakdownStatus?: 'healthy' | 'warning' | 'critical') => {
    if (breakdownStatus === 'healthy') return 'bg-healthy';
    if (breakdownStatus === 'warning') return 'bg-warning';
    if (breakdownStatus === 'critical') return 'bg-critical';
    return 'bg-muted-foreground';
  };

  return (
    <div
      className={cn(
        'kpi-card bg-card border rounded-lg p-4 cursor-pointer group',
        'hover:border-primary/30',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
      
      <div className="flex items-baseline gap-1 mb-1">
        <span className={cn(
          'text-2xl font-bold',
          statusColor === 'healthy' && 'text-healthy',
          statusColor === 'warning' && 'text-warning',
          statusColor === 'critical' && 'text-critical',
        )}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      )}

      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
          {getTrendIcon()}
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
        </div>
      )}

      {breakdown && currentRole !== 'ops' && (
        <div className="mt-3 pt-3 border-t space-y-1.5">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  item.status === 'healthy' && 'bg-healthy',
                  item.status === 'warning' && 'bg-warning',
                  item.status === 'critical' && 'bg-critical',
                  (!item.status || item.status === 'neutral') && 'bg-muted-foreground'
                )} />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}