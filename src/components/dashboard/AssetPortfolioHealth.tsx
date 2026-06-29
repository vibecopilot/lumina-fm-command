import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAssetPortfolio } from '@/hooks/useGroupedDashboard';
import { Wrench, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function AssetPortfolioHealth() {
  const { openSlideOver, currentRole, filters } = useDashboard();
  const { data, isPending: isLoading } = useAssetPortfolio(filters);

  const summary = data?.summary;
  const categoryBreakdown = data?.category_breakdown ?? [];
  const criticalAssets = data?.critical_assets ?? [];

  const pieData = summary
    ? [
        { name: 'Operational', value: summary.operational, color: 'hsl(142, 71%, 45%)' },
        { name: 'BreakDown', value: summary.maintenance, color: 'hsl(38, 92%, 50%)' },
        { name: 'Offline', value: summary.offline, color: 'hsl(215, 16%, 47%)' },
        { name: 'Critical', value: summary.critical, color: 'hsl(0, 84%, 60%)' },
      ]
    : [];

  const getHealthStatus = (pct: number): 'healthy' | 'warning' | 'critical' =>
    pct >= 85 ? 'healthy' : pct >= 70 ? 'warning' : 'critical';

  return (
    <section className="py-4 sm:py-6 border-t">
      <div className="container">
        <SectionHeader
          title="Asset Portfolio & Health"
          subtitle={isLoading ? 'Loading...' : `${summary?.total ?? 0} assets across all sites`}
          icon={<Wrench className="h-4 w-4" />}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Status Overview Chart */}
            <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Status Distribution
              </h4>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(data) => data?.name && openSlideOver('drill_asset', { type: 'status', value: data.name.toLowerCase() })}
                      style={{ cursor: 'pointer' }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {pieData.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 py-0.5 transition-colors group"
                    onClick={() => openSlideOver('drill_asset', { type: 'status', value: item.name.toLowerCase() })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_asset', { type: 'status', value: item.name.toLowerCase() })}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-2xs text-muted-foreground">{item.name}</span>
                    <span className="text-2xs font-medium ml-auto group-hover:text-primary">{item.value}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="sm:col-span-1 lg:col-span-5 border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Category Breakdown
              </h4>
              <div className="space-y-3">
                {categoryBreakdown.map(cat => (
                  <div
                    key={cat.category}
                    className="space-y-1.5 cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors group"
                    onClick={() => openSlideOver('drill_asset', { type: 'category', value: cat.category })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_asset', { type: 'category', value: cat.category })}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{cat.total} assets</span>
                        <StatusBadge status={getHealthStatus(cat.health_percentage)} label={`${cat.health_percentage}%`} />
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', cat.health_percentage >= 85 ? 'bg-healthy' : cat.health_percentage >= 70 ? 'bg-warning' : 'bg-critical')}
                        style={{ width: `${cat.health_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Assets */}
            <div className="sm:col-span-2 lg:col-span-4 border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Critical Assets Requiring Attention
              </h4>
              <div className="space-y-2">
                {criticalAssets.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">No critical assets</div>
                ) : (
                  criticalAssets.map(asset => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2 bg-critical-bg rounded-md cursor-pointer hover:bg-critical/10 group"
                      onClick={() => openSlideOver('asset', asset as never)}
                    >
                      <div>
                        <div className="text-sm font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.location}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Asset Hierarchy */}
        {!isLoading && currentRole !== 'ceo' && (
          <div className="mt-4 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Asset Hierarchy (Category → Site → Asset)
            </h4>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 bg-primary/10 rounded">All Categories</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="px-2 py-1 bg-primary/10 rounded">All Sites</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="px-2 py-1 bg-muted rounded">{summary?.total ?? 0} Assets</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
