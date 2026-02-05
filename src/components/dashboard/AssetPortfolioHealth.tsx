import { useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { assets, Asset } from '@/data/mockData';
import { Wrench, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function AssetPortfolioHealth() {
  const { openSlideOver, filters, currentRole } = useDashboard();

  const filteredAssets = useMemo(() => {
    let result = [...assets];
    if (filters.site_id) {
      result = result.filter(a => a.site_id === filters.site_id);
    }
    if (filters.category_id) {
      result = result.filter(a => a.category === filters.category_id);
    }
    return result;
  }, [assets, filters]);

  const statusCounts = useMemo(() => {
    return {
      operational: filteredAssets.filter(a => a.status === 'operational').length,
      maintenance: filteredAssets.filter(a => a.status === 'maintenance').length,
      offline: filteredAssets.filter(a => a.status === 'offline').length,
      critical: filteredAssets.filter(a => a.status === 'critical').length,
    };
  }, [filteredAssets]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { total: number; healthy: number; critical: number }> = {};
    filteredAssets.forEach(asset => {
      if (!breakdown[asset.category]) {
        breakdown[asset.category] = { total: 0, healthy: 0, critical: 0 };
      }
      breakdown[asset.category].total++;
      if (asset.status === 'operational') breakdown[asset.category].healthy++;
      if (asset.status === 'critical' || asset.status === 'offline') breakdown[asset.category].critical++;
    });
    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      ...data,
      healthPercent: Math.round((data.healthy / data.total) * 100),
    }));
  }, [filteredAssets]);

  const pieData = [
    { name: 'Operational', value: statusCounts.operational, color: 'hsl(142, 71%, 45%)' },
    { name: 'Maintenance', value: statusCounts.maintenance, color: 'hsl(38, 92%, 50%)' },
    { name: 'Offline', value: statusCounts.offline, color: 'hsl(215, 16%, 47%)' },
    { name: 'Critical', value: statusCounts.critical, color: 'hsl(0, 84%, 60%)' },
  ];

  const criticalAssets = filteredAssets.filter(a => a.status === 'critical').slice(0, 5);

  return (
    <section className="py-6 border-t">
      <div className="container">
        <SectionHeader 
          title="Asset Portfolio & Health"
          subtitle={`${filteredAssets.length} assets across all sites`}
          icon={<Wrench className="h-4 w-4" />}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Status Overview Chart */}
          <div className="col-span-3 border rounded-lg p-4">
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
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-2xs text-muted-foreground">{item.name}</span>
                  <span className="text-2xs font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="col-span-5 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Category Breakdown
            </h4>
            <div className="space-y-3">
              {categoryBreakdown.map(cat => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{cat.total} assets</span>
                      <StatusBadge 
                        status={cat.healthPercent >= 85 ? 'healthy' : cat.healthPercent >= 70 ? 'warning' : 'critical'} 
                        label={`${cat.healthPercent}%`} 
                      />
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        cat.healthPercent >= 85 ? 'bg-healthy' : cat.healthPercent >= 70 ? 'bg-warning' : 'bg-critical'
                      )}
                      style={{ width: `${cat.healthPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Assets */}
          <div className="col-span-4 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Critical Assets Requiring Attention
            </h4>
            <div className="space-y-2">
              {criticalAssets.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No critical assets
                </div>
              ) : (
                criticalAssets.map(asset => (
                  <div 
                    key={asset.id}
                    className="flex items-center justify-between p-2 bg-critical-bg rounded-md cursor-pointer hover:bg-critical/10 group"
                    onClick={() => openSlideOver('asset', asset)}
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

        {/* Asset Hierarchy (5-Level) */}
        {currentRole !== 'ceo' && (
          <div className="mt-4 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Asset Hierarchy (Type → Category → Site → Block → Asset)
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-primary/10 rounded">All Types</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="px-2 py-1 bg-primary/10 rounded">All Categories</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="px-2 py-1 bg-primary/10 rounded">48 Sites</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="px-2 py-1 bg-muted rounded">{filteredAssets.length} Assets</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}