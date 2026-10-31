import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useWorkforce } from '@/hooks/useGroupedDashboard';
import { Users, UserCheck, UserX, ChevronRight, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardFilterOptions } from '@/hooks/useDashboardFilterOptions';
import type { SiteOption } from '@/hooks/useDashboardFilterOptions';

type ChartType =
  | 'bar-horizontal'
  | 'bar-vertical'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'radar';

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar-horizontal', label: 'Horizontal Bar' },
  { value: 'bar-vertical', label: 'Vertical Bar' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'pie', label: 'Pie' },
  { value: 'donut', label: 'Donut' },
  { value: 'radar', label: 'Radar' },
];

const TOOLTIP_STYLE = { fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' };

function isChartType(value: unknown): value is ChartType {
  return typeof value === 'string' && CHART_TYPE_OPTIONS.some((o) => o.value === value);
}

function SiteFilterSelect({
  siteId,
  groupId,
  sites,
  onChange,
}: {
  siteId: string | null;
  groupId: string | null;
  sites: SiteOption[];
  onChange: (siteId: string | null) => void;
}) {
  return (
    <Select
      value={siteId || 'all'}
      onValueChange={(value) =>
        onChange(value === 'all' ? null : value)
      }
    >
      <SelectTrigger className="w-32 sm:w-44 h-8 text-xs shrink-0">
        <SelectValue placeholder="All Sites" />
      </SelectTrigger>

      <SelectContent className="max-h-64">
        <SelectItem value="all" className="text-xs">
          All Sites
        </SelectItem>

        {sites
          .filter(
            (site) =>
              site.name !== 'HO' &&
              (!groupId || site.group_id === groupId)
          )
          .map((site) => (
            <SelectItem
              key={site.id}
              value={site.id}
              className="text-xs"
            >
              {site.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

function getInitialChartType(storageKey: string, fallback: ChartType): ChartType {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return isChartType(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

/** Persists chart type selection to localStorage so it survives a page refresh */
function usePersistedChartType(storageKey: string, fallback: ChartType) {
  const [value, setValue] = useState<ChartType>(() => getInitialChartType(storageKey, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // localStorage unavailable - selection just won't persist across refresh
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}

/** Small self-contained dropdown matching the app's chart-type selector style */
function ChartTypeDropdown({
  value,
  onChange,
}: {
  value: ChartType;
  onChange: (value: ChartType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = CHART_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? 'Chart Type';

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-2xs gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {selectedLabel}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-md border bg-popover shadow-lg z-20 overflow-hidden">
          {CHART_TYPE_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-2xs flex items-center justify-between transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                {opt.label}
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function WorkforceTracking() {
  const { currentRole, filters, openSlideOver, updateFilter } = useDashboard();
  const { data, isPending: isLoading } = useWorkforce(filters);
  const { sites } = useDashboardFilterOptions(filters);

  const [vendorChartType, setVendorChartType] = usePersistedChartType(
    'workforceTracking.vendorChartType',
    'bar-vertical'
  );
  const [workTypeChartType, setWorkTypeChartType] = usePersistedChartType(
    'workforceTracking.workTypeChartType',
    'donut'
  );

  const summary = data?.summary;
  const byVendor = data?.by_vendor ?? [];
  const byWorkType = data?.by_work_type ?? [];

  const availabilityRate = summary?.availability_percentage ?? 0;

  const vendorChartData = byVendor.map(v => ({
    name: v.vendor ?? '—',
    present: v.present ?? 0,
    absent: v.absent ?? 0,
    total: v.total ?? 0,
  }));

  const workTypeChartData = byWorkType.map((wt, i) => ({
    name: wt.work_type ?? 'Unspecified',
    value: wt.count ?? 0,
    color: ['hsl(213, 56%, 24%)', 'hsl(213, 40%, 45%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'][i % 5],
  }));

  const shortfallVendors = byVendor
    .map(v => ({ ...v, availability: (v.total ?? 0) > 0 ? Math.round(((v.present ?? 0) / (v.total ?? 1)) * 100) : 0 }))
    .filter(v => v.availability < 80)
    .sort((a, b) => a.availability - b.availability)
    .slice(0, 5);

  const handleVendorClick = (name?: string) => {
    if (name) openSlideOver('drill_workforce', { type: 'vendor', value: name });
  };

  const handleWorkTypeClick = (name?: string) => {
    if (name) openSlideOver('drill_workforce', { type: 'work_type', value: name });
  };

  const renderVendorChart = () => {
    if (vendorChartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No vendor data available
        </div>
      );
    }

    switch (vendorChartType) {
      case 'bar-vertical':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={9} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar
                dataKey="present"
                name="Present"
                fill="hsl(142, 71%, 45%)"
                radius={[4, 4, 0, 0]}
                onClick={(d) => handleVendorClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="hsl(0, 84%, 60%)"
                radius={[4, 4, 0, 0]}
                onClick={(d) => handleVendorClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar-horizontal':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorChartData} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="name" fontSize={9} width={80} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar
                dataKey="present"
                name="Present"
                fill="hsl(142, 71%, 45%)"
                radius={[0, 4, 4, 0]}
                onClick={(d) => handleVendorClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="hsl(0, 84%, 60%)"
                radius={[0, 4, 4, 0]}
                onClick={(d) => handleVendorClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vendorChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={9} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="present" name="Present" stroke="hsl(142, 71%, 45%)" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" name="Absent" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vendorChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={9} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={vendorChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar name="Present" dataKey="present" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.35} />
              <Radar name="Absent" dataKey="absent" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.25} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        );

      // Pie/Donut can't show two series (present + absent) as one ring meaningfully,
      // so these modes show "Present" per vendor as slices.
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vendorChartData}
                dataKey="present"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name }) => name}
                onClick={(d) => handleVendorClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {vendorChartData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${(i * 47) % 360}, 65%, 50%)`} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Present']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vendorChartData}
                dataKey="present"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={70}
                onClick={(d) => handleVendorClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {vendorChartData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${(i * 47) % 360}, 65%, 50%)`} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Present']} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderWorkTypeChart = () => {
    if (workTypeChartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No work type data available
        </div>
      );
    }

    const showCenterLabel = workTypeChartType === 'donut';

    switch (workTypeChartType) {
      case 'donut':
        return (
          <div className="relative h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workTypeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(d) => handleWorkTypeClick(d?.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {workTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            {showCenterLabel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground">Total :</span>
                <span className="text-lg font-bold">{summary?.total ?? 0}</span>
              </div>
            )}
          </div>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={workTypeChartData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name }) => name}
                onClick={(d) => handleWorkTypeClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {workTypeChartData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar-vertical':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workTypeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={9} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="value"
                name="Count"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                onClick={(d) => handleWorkTypeClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {workTypeChartData.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar-horizontal':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workTypeChartData} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} allowDecimals={false} />
              <YAxis type="category" dataKey="name" fontSize={9} width={80} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="value"
                name="Count"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
                onClick={(d) => handleWorkTypeClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {workTypeChartData.map((entry, index) => (
                  <Cell key={`barh-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={workTypeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={9} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="value" name="Count" stroke="hsl(213, 56%, 24%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={workTypeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={9} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="value" name="Count" stroke="hsl(213, 56%, 24%)" fill="hsl(213, 56%, 24%)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={workTypeChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Radar name="Count" dataKey="value" stroke="hsl(213, 56%, 24%)" fill="hsl(213, 56%, 24%)" fillOpacity={0.4} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-4 sm:py-6 border-t">
      <div className="container">
        <SectionHeader
          title="Workforce Tracking"
          subtitle={
            isLoading
              ? 'Loading...'
              : `${summary?.total ?? 0} employees across all sites`
          }
          icon={<Users className="h-4 w-4" />}
          actions={
            <SiteFilterSelect
              siteId={filters.site_id}
              groupId={filters.group_id}
              sites={sites}
              onChange={(siteId) =>
                updateFilter('site_id', siteId)
              }
            />
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Attendance Summary */}
              <div className="sm:col-span-1 lg:col-span-3 space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1">Overall Availability</div>
                  <div className={cn('text-3xl font-bold', availabilityRate >= 90 ? 'text-healthy' : availabilityRate >= 80 ? 'text-warning' : 'text-critical')}>
                    {availabilityRate}%
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', availabilityRate >= 90 ? 'bg-healthy' : availabilityRate >= 80 ? 'bg-warning' : 'bg-critical')}
                      style={{ width: `${availabilityRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="border rounded-lg p-3 bg-healthy-bg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openSlideOver('drill_workforce', { type: 'attendance', value: 'present' })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'attendance', value: 'present' })}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <UserCheck className="h-3.5 w-3.5 text-healthy" />
                      <span className="text-xs">Present</span>
                    </div>
                    <div className="text-xl font-bold">{summary?.present ?? 0}</div>
                  </div>
                  <div
                    className="border rounded-lg p-3 bg-critical-bg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openSlideOver('drill_workforce', { type: 'attendance', value: 'absent' })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'attendance', value: 'absent' })}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <UserX className="h-3.5 w-3.5 text-critical" />
                      <span className="text-xs">Absent</span>
                    </div>
                    <div className="text-xl font-bold">{summary?.absent ?? 0}</div>
                  </div>
                  <div className="border rounded-lg p-3 bg-muted col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Total Workforce</div>
                    <div className="text-xl font-bold">{summary?.total ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* By Vendor Chart */}
              <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Vendor</h4>
                  <ChartTypeDropdown value={vendorChartType} onChange={setVendorChartType} />
                </div>
                <div className="h-[180px]">
                  {renderVendorChart()}
                </div>
              </div>

              {/* By Work Type */}
              <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Work Type</h4>
                  <ChartTypeDropdown value={workTypeChartType} onChange={setWorkTypeChartType} />
                </div>
                <div className="h-[140px]">
                  {renderWorkTypeChart()}
                </div>
                <div className="space-y-1 mt-2">
                  {workTypeChartData.map(item => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 py-0.5 transition-colors group"
                      onClick={() => openSlideOver('drill_workforce', { type: 'work_type', value: item.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'work_type', value: item.name })}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground truncate group-hover:text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item.value}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Shortfall Alerts */}
              <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Low Availability Vendors</h4>
                <div className="space-y-2">
                  {shortfallVendors.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">All vendors at good capacity</div>
                  ) : (
                    shortfallVendors.map(vendor => (
                      <div
                        key={vendor.vendor}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-md cursor-pointer hover:opacity-90 transition-opacity group',
                          vendor.availability < 70 ? 'bg-critical-bg' : 'bg-warning-bg'
                        )}
                        onClick={() => openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                      >
                        <div>
                          <div className="text-sm font-medium">{vendor.vendor}</div>
                          <div className="text-xs text-muted-foreground">{(vendor.present ?? 0)}/{(vendor.total ?? 0)} present</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <StatusBadge status={vendor.availability < 70 ? 'critical' : 'warning'} label={`${vendor.availability}%`} />
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Full Vendor Breakdown (FM Head & Ops) */}
            {currentRole !== 'ceo' && byVendor.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {byVendor.slice(0, 6).map(vendor => {
                  const total = vendor.total ?? 0;
                  const present = vendor.present ?? 0;
                  const availability = total > 0 ? Math.round((present / total) * 100) : 0;
                  return (
                    <div
                      key={vendor.vendor}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors group"
                      onClick={() => openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">{vendor.vendor ?? '—'}</span>
                        <span className="text-xs text-muted-foreground">{present}/{total}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', availability >= 90 ? 'bg-healthy' : availability >= 80 ? 'bg-warning' : 'bg-critical')}
                          style={{ width: `${availability}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground text-right">{availability}% availability</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}