import { useDashboard } from '@/contexts/DashboardContext';
import { useSiteDrill } from '@/hooks/useGroupedDashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { exportToXLSX } from '@/utils/exportData';
import { Download, RefreshCw, MapPin, AlertTriangle } from 'lucide-react';

const COLORS = {
  operational: '#22c55e',
  maintenance: '#f59e0b',
  critical: '#ef4444',
  offline: '#6b7280',
  healthy: '#22c55e',
  warning: '#f59e0b',
};

function PanelHeader({
  title,
  icon: Icon,
  lastUpdated,
  onRefresh,
  isRefreshing,
  onExport,
}: {
  title: string;
  icon: React.ElementType;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {onExport && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onExport}>
            <Download className="h-3 w-3" /> Export
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} /> Refresh
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={cn('text-xl font-bold', color)}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{children}</h4>;
}

export function SiteDrillPanel() {
  const { filters, slideOver } = useDashboard();
  const siteData = slideOver.data as { id: number; name?: string } | null;
  const siteId = siteData?.id ?? null;

  const { data, isPending, dataUpdatedAt, refetch, isFetching } = useSiteDrill(filters, siteId);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleExport = () => {
    if (!data) return;
    const base = `site_${(data.site.name || 'site').replace(/\s+/g, '_')}`;
    const arr = (x: unknown) => (Array.isArray(x) && x.length > 0 ? x : []) as Record<string, unknown>[];
    const summary = {
      site: data.site?.name,
      region: data.site?.region,
      health_score: data.summary?.health_score,
      sla_percentage: data.summary?.sla_percentage,
      ppm_percentage: data.summary?.ppm_percentage,
      workforce_percentage: data.summary?.workforce_percentage,
      open_tickets: data.summary?.open_tickets,
      breached_tickets: data.summary?.breached_tickets,
      total_assets: data.summary?.total_assets,
      total_staff: data.summary?.total_staff,
    };
    const sheets = [
      { name: 'Blocks', data: arr(data.blocks) },
      { name: 'Tickets', data: arr(data.tickets?.recent) },
      { name: 'Critical Assets', data: arr(data.assets?.critical_assets) },
      { name: 'Assets by Category', data: arr(data.assets?.by_category) },
      { name: 'PPM by Category', data: arr(data.ppm?.by_category) },
      { name: 'Workforce by Vendor', data: arr(data.workforce?.by_vendor) },
      { name: 'Workforce by Type', data: arr(data.workforce?.by_work_type) },
      { name: 'Vendors', data: arr(data.vendors) },
      { name: 'Asset Breakdown', data: arr(data.assets?.breakdown) },
    ];
    exportToXLSX({ summary, sheets, filename: base });
  };

  const assetBreakdownData = data?.assets.breakdown.map((b, i) => ({
    name: b.status.charAt(0).toUpperCase() + b.status.slice(1),
    value: b.count,
    fill: COLORS[b.status as keyof typeof COLORS] || '#6b7280',
  })) ?? [];

  const ppmCategoryData = data?.ppm.by_category ?? [];
  const workforceVendorData = data?.workforce.by_vendor ?? [];
  const workforceTypeData = data?.workforce.by_work_type ?? [];

  if (!siteId) return <p className="text-sm text-muted-foreground">No site selected</p>;
  if (isPending) return <Skeleton className="h-96" />;
  if (!data) return <p className="text-sm text-muted-foreground">Failed to load site data</p>;

  const getStatus = (pct: number) => (pct >= 85 ? 'healthy' : pct >= 70 ? 'warning' : 'critical');

  return (
    <div>
      <PanelHeader
        title={data.site.name}
        icon={MapPin}
        lastUpdated={lastUpdated}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExport={handleExport}
      />

      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <MapPin className="h-3.5 w-3.5" />
        <span>{data.site.region}</span>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="tickets" className="flex-1 text-xs">Tickets</TabsTrigger>
          <TabsTrigger value="assets" className="flex-1 text-xs">Assets</TabsTrigger>
          <TabsTrigger value="ppm" className="flex-1 text-xs">PPM</TabsTrigger>
          <TabsTrigger value="workforce" className="flex-1 text-xs">Workforce</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SectionTitle>Key Metrics</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Health Score" value={`${data.summary.health_score}%`} color={getStatus(data.summary.health_score) === 'healthy' ? 'text-healthy' : getStatus(data.summary.health_score) === 'warning' ? 'text-warning' : 'text-critical'} />
            <StatCard label="SLA %" value={`${data.summary.sla_percentage}%`} color={getStatus(data.summary.sla_percentage) === 'healthy' ? 'text-healthy' : getStatus(data.summary.sla_percentage) === 'warning' ? 'text-warning' : 'text-critical'} />
            <StatCard label="PPM %" value={`${data.summary.ppm_percentage}%`} color={getStatus(data.summary.ppm_percentage) === 'healthy' ? 'text-healthy' : getStatus(data.summary.ppm_percentage) === 'warning' ? 'text-warning' : 'text-critical'} />
            <StatCard label="Workforce %" value={`${data.summary.workforce_percentage}%`} color={getStatus(data.summary.workforce_percentage) === 'healthy' ? 'text-healthy' : getStatus(data.summary.workforce_percentage) === 'warning' ? 'text-warning' : 'text-critical'} />
            <StatCard label="Open Tickets" value={data.summary.open_tickets} />
            <StatCard label="Breached" value={data.summary.breached_tickets} color="text-critical" />
            <StatCard label="Total Assets" value={data.summary.total_assets} />
            <StatCard label="Total Staff" value={data.summary.total_staff} />
          </div>

          <SectionTitle>Blocks</SectionTitle>
          {data.blocks.length > 0 ? (
            <div className="space-y-2">
              {data.blocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.floor_count} levels · {b.units_count} units</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No blocks</p>
          )}

          {data.vendors.length > 0 && (
            <>
              <SectionTitle>Vendors ({data.vendors.length})</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {data.vendors.slice(0, 10).map((v) => (
                  <Badge key={v.id} variant="outline" className="text-xs">
                    {v.name}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Total" value={data.tickets.summary.total} />
            <StatCard label="Open" value={data.tickets.summary.open} color="text-warning" />
            <StatCard label="Breached" value={data.tickets.summary.breached} color="text-critical" />
            <StatCard label="SLA %" value={`${data.tickets.summary.sla_percentage}%`} />
          </div>
          <SectionTitle>Recent Tickets</SectionTitle>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {data.tickets.recent.map((t) => (
              <div key={t.id} className="flex items-start justify-between p-2 border rounded-md">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">{t.ticket_number}</div>
                  <div className="text-sm font-medium truncate">{t.heading}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.category ?? '—'} · {new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <Badge variant="outline" className={cn('text-2xs shrink-0',
                  t.sla_status === 'Breached' && 'border-critical text-critical',
                  t.sla_status === 'At Risk' && 'border-warning text-warning',
                  t.sla_status === 'Within SLA' && 'border-healthy text-healthy',
                )}>
                  {t.sla_status}
                </Badge>
              </div>
            ))}
            {data.tickets.recent.length === 0 && <p className="text-xs text-muted-foreground">No tickets</p>}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Total" value={data.assets.summary.total} />
            <StatCard label="Health %" value={`${data.assets.summary.health_percentage}%`} />
            <StatCard label="Operational" value={data.assets.summary.operational} color="text-healthy" />
            <StatCard label="Maintenance" value={data.assets.summary.maintenance} color="text-warning" />
            <StatCard label="Critical" value={data.assets.summary.critical} color="text-critical" />
            <StatCard label="Offline" value={data.assets.summary.offline} />
          </div>
          {assetBreakdownData.filter((d) => d.value > 0).length > 0 && (
            <>
              <SectionTitle>Status Distribution</SectionTitle>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={assetBreakdownData.filter((d) => d.value > 0)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Assets" radius={[4, 4, 0, 0]}>
                    {assetBreakdownData.filter((d) => d.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
          {data.assets.by_category.length > 0 && (
            <>
              <SectionTitle>By Category</SectionTitle>
              <div className="space-y-1.5">
                {data.assets.by_category.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{c.category}</span>
                    <span className="font-medium">{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {data.assets.critical_assets.length > 0 && (
            <>
              <SectionTitle>Critical Assets</SectionTitle>
              <div className="space-y-2">
                {data.assets.critical_assets.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-critical/10 rounded-md">
                    <div>
                      <div className="text-xs font-mono">{a.asset_number}</div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.location} · {a.category ?? '—'}</div>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-critical shrink-0" />
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="ppm" className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Total" value={data.ppm.total} />
            <StatCard label="Completed" value={data.ppm.completed} color="text-healthy" />
            <StatCard label="Completion %" value={`${data.ppm.percentage}%`} />
          </div>
          {ppmCategoryData.length > 0 && (
            <>
              <SectionTitle>PPM by Category</SectionTitle>
              <ResponsiveContainer width="100%" height={Math.max(ppmCategoryData.length * 36, 120)}>
                <BarChart data={ppmCategoryData} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="percentage" name="Completion %" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </TabsContent>

        <TabsContent value="workforce" className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Total" value={data.workforce.total} />
            <StatCard label="Present Today" value={data.workforce.present} color="text-healthy" />
            <StatCard label="Availability %" value={`${data.workforce.percentage}%`} />
          </div>
          {workforceVendorData.length > 0 && (
            <>
              <SectionTitle>By Vendor</SectionTitle>
              <div className="space-y-1.5">
                {workforceVendorData.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <span className="text-sm">{v.vendor}</span>
                    <span className="text-sm font-medium">{v.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {workforceTypeData.length > 0 && (
            <>
              <SectionTitle>By Work Type</SectionTitle>
              <div className="space-y-1.5">
                {workforceTypeData.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <span className="text-sm">{w.work_type}</span>
                    <span className="text-sm font-medium">{w.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
