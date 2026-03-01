import { useDashboard } from '@/contexts/DashboardContext';
import { useAssetDrill, useWorkforceDrill, usePPMDrill, useVisitorsDrill } from '@/hooks/useGroupedDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToXLSX } from '@/utils/exportData';
import { Download, RefreshCw, Wrench, Users, ClipboardCheck, UserCheck } from 'lucide-react';

const COLORS = {
  operational: '#22c55e',
  maintenance: '#f59e0b',
  critical: '#ef4444',
  offline: '#6b7280',
  present: '#22c55e',
  absent: '#ef4444',
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

export function AssetDrillPanel() {
  const { filters, slideOver } = useDashboard();
  const data = slideOver.data as { type: 'status' | 'category'; value: string } | null;

  const status = data?.type === 'status' ? data.value : undefined;
  const category = data?.type === 'category' ? data.value : undefined;

  const { data: drillData, isPending, dataUpdatedAt, refetch, isFetching } = useAssetDrill(filters, { status, category });
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleExport = () => {
    if (!drillData?.records.length) return;
    const data = drillData.records.map((r) => ({
      asset_number: r.asset_number,
      name: r.name,
      category: r.category,
      status: r.status,
      location: r.location,
      site_name: r.site_name,
    }));
    exportToXLSX({
      summary: { total: drillData.total, drill_type: status || category || 'drill' },
      sheets: [{ name: 'Assets', data }],
      filename: `assets_${status || category || 'drill'}`,
    });
  };

  const statusCounts = drillData?.records
    ? (() => {
        const m: Record<string, number> = {};
        drillData.records.forEach((r) => {
          m[r.status] = (m[r.status] || 0) + 1;
        });
        return Object.entries(m).map(([name, count]) => ({ name, count, fill: COLORS[name as keyof typeof COLORS] || '#6b7280' }));
      })()
    : [];

  if (!data) return <p className="text-sm text-muted-foreground">No drill context</p>;
  if (isPending) return <Skeleton className="h-64" />;

  const title = data.type === 'status'
    ? `Assets — ${data.value.charAt(0).toUpperCase() + data.value.slice(1)}`
    : `Assets — Category: ${data.value}`;

  return (
    <div>
      <PanelHeader
        title={title}
        icon={Wrench}
        lastUpdated={lastUpdated}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExport={handleExport}
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Total</div>
          <div className="text-xl font-bold">{drillData?.total ?? 0}</div>
        </div>
        {statusCounts.length > 0 && (
          statusCounts.slice(0, 2).map((s, i) => (
            <div key={i} className="bg-muted/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-0.5">{s.name}</div>
              <div className={cn('text-xl font-bold', s.name === 'operational' && 'text-healthy', s.name === 'maintenance' && 'text-warning', s.name === 'critical' && 'text-critical')}>{s.count}</div>
            </div>
          ))
        )}
      </div>

      {statusCounts.length > 0 && (
        <>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status Distribution</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={statusCounts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" name="Assets" radius={[4, 4, 0, 0]}>
                {statusCounts.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-4">Asset List</h4>
      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {(drillData?.records ?? []).map((r, i) => (
          <div
            key={i}
            className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-mono text-muted-foreground">{r.asset_number}</span>
                <Badge variant="outline" className={cn('text-2xs px-1 py-0',
                  r.status === 'operational' && 'border-healthy text-healthy',
                  r.status === 'maintenance' && 'border-warning text-warning',
                  r.status === 'critical' && 'border-critical text-critical',
                  r.status === 'offline' && 'border-muted-foreground text-muted-foreground',
                )}>
                  {r.status}
                </Badge>
              </div>
              <div className="text-xs font-medium truncate">{r.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.location} · {r.category} · {r.site_name || '—'}</div>
            </div>
          </div>
        ))}
        {(!drillData?.records?.length) && (
          <p className="text-sm text-muted-foreground text-center py-8">No assets found</p>
        )}
      </div>
    </div>
  );
}

export function PPMDrillPanel() {
  const { filters, slideOver } = useDashboard();
  const data = slideOver.data as { type: 'category'; value: string } | null;
  const category = data?.type === 'category' ? data.value : null;

  const { data: drillData, isPending, dataUpdatedAt, refetch, isFetching } = usePPMDrill(filters, category);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleExport = () => {
    if (!drillData?.records.length) return;
    const data = drillData.records.map((r) => ({
      asset_number: r.asset_number,
      asset_name: r.asset_name,
      category: r.category,
      location: r.location,
      status: r.status,
      start_time: r.start_time,
      end_time: r.end_time,
      site_name: r.site_name,
    }));
    exportToXLSX({
      summary: { total: drillData.total, completed: drillData.completed, category: category || 'drill' },
      sheets: [{ name: 'PPM Tasks', data }],
      filename: `ppm_${category || 'drill'}`,
    });
  };

  if (!data || !category) return <p className="text-sm text-muted-foreground">No drill context</p>;
  if (isPending) return <Skeleton className="h-64" />;

  const title = `PPM — Category: ${category}`;

  return (
    <div>
      <PanelHeader
        title={title}
        icon={ClipboardCheck}
        lastUpdated={lastUpdated}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExport={handleExport}
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Total</div>
          <div className="text-xl font-bold">{drillData?.total ?? 0}</div>
        </div>
        <div className="bg-healthy/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Completed</div>
          <div className="text-xl font-bold text-healthy">{drillData?.completed ?? 0}</div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Pending</div>
          <div className="text-xl font-bold">{(drillData?.total ?? 0) - (drillData?.completed ?? 0)}</div>
        </div>
      </div>

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">PPM Task List</h4>
      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {(drillData?.records ?? []).map((r, i) => (
          <div key={i} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-mono text-muted-foreground">{r.asset_number ?? r.asset_name ?? '—'}</span>
                <Badge variant="outline" className={cn('text-2xs px-1 py-0',
                  r.status === 'completed' && 'border-healthy text-healthy',
                  r.status === 'missed' && 'border-critical text-critical',
                  r.status === 'overdue' && 'border-critical text-critical',
                  (r.status === 'pending' || !r.status) && 'border-warning text-warning',
                )}>
                  {r.status || 'pending'}
                </Badge>
              </div>
              <div className="text-xs font-medium truncate">{r.asset_name ?? '—'}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.location} · {r.category} · {r.site_name || '—'}</div>
              <div className="text-2xs text-muted-foreground mt-0.5">
                {r.start_time ? new Date(r.start_time).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        ))}
        {(!drillData?.records?.length) && (
          <p className="text-sm text-muted-foreground text-center py-8">No PPM tasks found</p>
        )}
      </div>
    </div>
  );
}

export function WorkforceDrillPanel() {
  const { filters, slideOver } = useDashboard();
  const data = slideOver.data as { type: 'vendor' | 'work_type' | 'attendance'; value: string } | null;

  const vendor = data?.type === 'vendor' ? data.value : undefined;
  const work_type = data?.type === 'work_type' ? data.value : undefined;
  const attendance = (data?.type === 'attendance' && (data.value === 'present' || data.value === 'absent')) ? data.value as 'present' | 'absent' : undefined;

  const { data: drillData, isPending, dataUpdatedAt, refetch, isFetching } = useWorkforceDrill(filters, { vendor, work_type, attendance });
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleExport = () => {
    if (!drillData?.records.length) return;
    const data = drillData.records.map((r) => ({
      name: r.name,
      employee_no: r.employee_no,
      work_type: r.work_type,
      vendor: r.vendor,
      present_today: r.present_today ? 'Yes' : 'No',
      site_name: r.site_name,
    }));
    exportToXLSX({
      summary: { total: drillData.total, present: drillData.present, absent: drillData.absent },
      sheets: [{ name: 'Staff', data }],
      filename: `workforce_${vendor || work_type || attendance || 'drill'}`,
    });
  };

  const presentAbsentData = drillData
    ? [
        { name: 'Present', value: drillData.present, fill: COLORS.present },
        { name: 'Absent', value: drillData.absent, fill: COLORS.absent },
      ].filter((d) => d.value > 0)
    : [];

  if (!data) return <p className="text-sm text-muted-foreground">No drill context</p>;
  if (isPending) return <Skeleton className="h-64" />;

  const title = data.type === 'vendor'
    ? `Workforce — Vendor: ${data.value}`
    : data.type === 'attendance'
      ? `Workforce — ${data.value === 'present' ? 'Present Today' : 'Absent'}`
      : `Workforce — Work Type: ${data.value}`;

  return (
    <div>
      <PanelHeader
        title={title}
        icon={Users}
        lastUpdated={lastUpdated}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExport={handleExport}
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Total</div>
          <div className="text-xl font-bold">{drillData?.total ?? 0}</div>
        </div>
        <div className="bg-healthy/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Present Today</div>
          <div className="text-xl font-bold text-healthy">{drillData?.present ?? 0}</div>
        </div>
        <div className="bg-critical/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Absent</div>
          <div className="text-xl font-bold text-critical">{drillData?.absent ?? 0}</div>
        </div>
      </div>

      {presentAbsentData.length > 0 && (
        <>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Attendance Today</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={presentAbsentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {presentAbsentData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-4">Staff Details ({(drillData?.records ?? []).length})</h4>
      <div className="border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
        {(drillData?.records ?? []).length > 0 ? (
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-2 font-medium">Name</th>
                <th className="text-left p-2 font-medium">Employee #</th>
                <th className="text-left p-2 font-medium">Work Type</th>
                <th className="text-left p-2 font-medium">Vendor</th>
                <th className="text-center p-2 font-medium">Today</th>
                <th className="text-left p-2 font-medium">Site</th>
              </tr>
            </thead>
            <tbody>
              {(drillData?.records ?? []).map((r, i) => (
                <tr key={i} className="border-t hover:bg-muted/20">
                  <td className="p-2 font-medium">{r.name ?? '—'}</td>
                  <td className="p-2 font-mono text-muted-foreground">{r.employee_no ?? '—'}</td>
                  <td className="p-2">{r.work_type ?? '—'}</td>
                  <td className="p-2">{r.vendor ?? '—'}</td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className={cn('text-2xs px-1 py-0', r.present_today ? 'border-healthy text-healthy' : 'border-critical text-critical')}>
                      {r.present_today ? 'Present' : 'Absent'}
                    </Badge>
                  </td>
                  <td className="p-2 text-muted-foreground">{r.site_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8 p-4">No staff found</p>
        )}
      </div>
    </div>
  );
}

export function VisitorDrillPanel() {
  const { filters, slideOver, openSlideOver } = useDashboard();
  const data = slideOver.data as { category?: string } | null;
  const category = data?.category;

  const { data: drillData, isPending, dataUpdatedAt, refetch, isFetching } = useVisitorsDrill(filters, { category });
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleExport = () => {
    if (!drillData?.records?.length) return;
    const rows = drillData.records.map((r) => ({
      visitor_name: r.visitor_name,
      contact_no: r.contact_no,
      category: r.category,
      visit_type: r.visit_type,
      purpose: r.purpose,
      check_in: r.check_in ? new Date(r.check_in).toLocaleString() : '—',
      check_out: r.check_out ? new Date(r.check_out).toLocaleString() : '—',
      created_by: r.created_by ?? '—',
      host_name: r.host_name ?? '—',
      approved: r.approved ?? '—',
      site_name: r.site_name ?? '—',
      status: r.status,
    }));
    exportToXLSX({
      summary: { total: drillData.total, ...drillData.today, filter_category: category || 'all' },
      sheets: [{ name: 'Visitors', data: rows }],
      filename: `visitors_${category || 'all'}`,
    });
  };

  const records = drillData?.records ?? [];
  const today = drillData?.today ?? { checked_in: 0, checked_out: 0, currently_inside: 0 };

  const title = category
    ? `Visitors — Category: ${category}`
    : 'Visitors — All visits';

  return (
    <div className="min-w-0 overflow-hidden">
      <PanelHeader
        title={title}
        icon={UserCheck}
        lastUpdated={lastUpdated}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExport={handleExport}
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Total (period)</div>
          <div className="text-xl font-bold">{drillData?.total ?? 0}</div>
        </div>
        <div className="bg-healthy/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Checked in today</div>
          <div className="text-xl font-bold text-healthy">{today.checked_in}</div>
        </div>
        <div className="bg-critical/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Inside now</div>
          <div className="text-xl font-bold text-warning">{today.currently_inside}</div>
        </div>
      </div>

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Visit details ({records.length})
      </h4>
      <div className="border rounded-lg overflow-hidden max-h-[400px] flex flex-col min-h-0">
        {isPending ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : records.length > 0 ? (
          <div className="overflow-auto min-h-0 flex-1">
            <table className="w-full text-xs border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium" style={{ width: '12%' }}>Visitor</th>
                  <th className="text-left p-2 font-medium" style={{ width: '10%' }}>Category</th>
                  <th className="text-left p-2 font-medium" style={{ width: '14%' }}>Check-in</th>
                  <th className="text-left p-2 font-medium" style={{ width: '14%' }}>Check-out</th>
                  <th className="text-left p-2 font-medium" style={{ width: '10%' }}>Purpose</th>
                  <th className="text-left p-2 font-medium" style={{ width: '12%' }}>Created by</th>
                  <th className="text-left p-2 font-medium" style={{ width: '10%' }}>Host</th>
                  <th className="text-center p-2 font-medium" style={{ width: '10%' }}>Approved</th>
                  <th className="text-left p-2 font-medium" style={{ width: '8%' }}>Site</th>
                  <th className="text-center p-2 pr-4 font-medium" style={{ width: '%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-muted/20">
                    <td className="p-2 font-medium overflow-hidden" title={r.visitor_name ?? ''}>
                      <span className="block truncate">{r.visitor_name ?? '—'}</span>
                    </td>
                    <td className="p-2 overflow-hidden" title={r.category ?? r.visit_type ?? ''}>
                      <span className="block truncate">{r.category ?? r.visit_type ?? '—'}</span>
                    </td>
                    <td className="p-2 text-muted-foreground overflow-hidden">
                      <span className="block truncate">
                        {r.check_in ? new Date(r.check_in).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </span>
                    </td>
                    <td className="p-2 text-muted-foreground overflow-hidden">
                      <span className="block truncate">
                        {r.check_out ? new Date(r.check_out).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </span>
                    </td>
                    <td className="p-2 overflow-hidden" title={r.purpose ?? ''}>
                      <span className="block truncate">{r.purpose ?? '—'}</span>
                    </td>
                    <td className="p-2 text-muted-foreground overflow-hidden" title={r.created_by ?? ''}>
                      <span className="block truncate">{r.created_by ?? '—'}</span>
                    </td>
                    <td className="p-2 text-muted-foreground overflow-hidden" title={r.host_name ?? ''}>
                      <span className="block truncate">{r.host_name ?? '—'}</span>
                    </td>
                    <td className="p-2 text-center overflow-hidden">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-2xs px-1 py-0 inline-block max-w-full truncate',
                          r.approved === 'approved' && 'border-healthy text-healthy',
                          r.approved === 'rejected' && 'border-critical text-critical',
                          (r.approved === 'pending' || !r.approved) && 'border-warning text-warning'
                        )}
                        title={r.approved ?? ''}
                      >
                        {r.approved ?? '—'}
                      </Badge>
                    </td>
                    <td className="p-2 overflow-hidden" title={r.site_name ?? ''}>
                      {r.site_id && r.site_name ? (
                        <button
                          type="button"
                          className="text-left text-muted-foreground hover:text-primary hover:underline block w-full min-w-0 truncate"
                          onClick={(e) => { e.stopPropagation(); openSlideOver('drill_site', { id: r.site_id, name: r.site_name }); }}
                          title={`View site: ${r.site_name}`}
                        >
                          {r.site_name}
                        </button>
                      ) : (
                        <span className="text-muted-foreground block truncate">{r.site_name ?? '—'}</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className={cn('text-2xs px-1 py-0', r.status === 'inside' ? 'border-healthy text-healthy' : 'border-muted text-muted-foreground')}>
                        {r.status === 'inside' ? 'Inside' : 'Out'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8 p-4">No visits in this period</p>
        )}
      </div>
    </div>
  );
}
