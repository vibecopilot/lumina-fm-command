import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { usePPMOperations } from '@/hooks/useGroupedDashboard';
import { ClipboardCheck, ChevronDown, ChevronUp, Check } from 'lucide-react';
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

function isChartType(value: unknown): value is ChartType {
  return typeof value === 'string' && CHART_TYPE_OPTIONS.some((o) => o.value === value);
}

/** Reads a persisted chart type from localStorage, falling back to the given default */
function getInitialChartType(storageKey: string, fallback: ChartType): ChartType {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return isChartType(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
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

/** Persists chart type selection to localStorage under the given key */
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

const TOOLTIP_STYLE = { fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' };

/** Generic renderer for a simple two-slice completion breakdown (Completed vs Remaining) */
function CompletionChart({
  data,
  chartType,
  completedColor = 'hsl(142, 71%, 45%)',
  remainingColor = 'hsl(var(--muted))',
}: {
  data: { name: string; value: number }[];
  chartType: ChartType;
  completedColor?: string;
  remainingColor?: string;
}) {
  const colors = [completedColor, remainingColor];

  switch (chartType) {
    case 'donut':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={65}
              dataKey="value"
              label={({ name }) => name}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'bar-vertical':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case 'bar-horizontal':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={10} allowDecimals={false} />
            <YAxis type="category" dataKey="name" fontSize={10} width={70} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="value" name="Count" stroke={completedColor} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="value" name="Count" stroke={completedColor} fill={completedColor} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
            <PolarRadiusAxis tick={{ fontSize: 9 }} allowDecimals={false} />
            <Radar name="Count" dataKey="value" stroke={completedColor} fill={completedColor} fillOpacity={0.4} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </RadarChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

export function PPMSoftServices() {
  const { currentRole, filters, openSlideOver, updateFilter, } = useDashboard();
  const { data, isPending: isLoading } = usePPMOperations(filters);
  const { sites } = useDashboardFilterOptions(filters);

  const [ppmChartType, setPpmChartType] = usePersistedChartType('ppmSoftServices.ppmChartType', 'donut');
  const [softServicesChartType, setSoftServicesChartType] = usePersistedChartType(
    'ppmSoftServices.softServicesChartType',
    'donut'
  );
  const [plannedVsAchievedChartType, setPlannedVsAchievedChartType] = usePersistedChartType(
    'ppmSoftServices.plannedVsAchievedChartType',
    'bar-vertical'
  );

  const ppm = data?.ppm;
  const softServices = data?.soft_services;

  const ppmDonutData = [
    { name: 'Completed', value: ppm?.completed ?? 0 },
    { name: 'Remaining', value: Math.max((ppm?.total ?? 0) - (ppm?.completed ?? 0), 0) },
  ];

  const softServicesDonutData = [
    { name: 'Completed', value: softServices?.completed ?? 0 },
    {
      name: 'Remaining',
      value: Math.max(
        (softServices?.completed ?? 0) +
        (softServices?.pending ?? 0) +
        (softServices?.overdue ?? 0) -
        (softServices?.completed ?? 0),
        0
      ),
    },
  ];

  const plannedVsAchieved = (ppm?.by_category ?? []).map(cat => ({
    name: cat.category,
    planned: cat.total,
    achieved: cat.completed,
    compliance: cat.completion_percentage,
  }));

  const complianceRate = ppm?.completion_percentage ?? 0;

  // The center "%" overlay only makes visual sense on donut/pie; hide it for other chart types
  const showPpmCenterLabel = ppmChartType === 'donut' || ppmChartType === 'pie';
  const showSoftServicesCenterLabel = softServicesChartType === 'donut' || softServicesChartType === 'pie';

  const handleCategoryClick = (name?: string) => {
    if (name) openSlideOver('drill_ppm', { type: 'category', value: name });
  };

  const renderPlannedVsAchievedChart = () => {
    if (plannedVsAchieved.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No category data available
        </div>
      );
    }

    switch (plannedVsAchievedChartType) {
      case 'bar-vertical':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plannedVsAchieved}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar
                dataKey="planned"
                name="Planned"
                fill="hsl(213, 40%, 75%)"
                radius={[4, 4, 0, 0]}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
              <Bar
                dataKey="achieved"
                name="Achieved"
                fill="hsl(142, 71%, 45%)"
                radius={[4, 4, 0, 0]}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar-horizontal':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plannedVsAchieved} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="name" fontSize={10} width={90} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar
                dataKey="planned"
                name="Planned"
                fill="hsl(213, 40%, 75%)"
                radius={[0, 4, 4, 0]}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
              <Bar
                dataKey="achieved"
                name="Achieved"
                fill="hsl(142, 71%, 45%)"
                radius={[0, 4, 4, 0]}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={plannedVsAchieved}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="planned" name="Planned" stroke="hsl(213, 60%, 55%)" strokeWidth={2} />
              <Line type="monotone" dataKey="achieved" name="Achieved" stroke="hsl(142, 71%, 45%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={plannedVsAchieved}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area type="monotone" dataKey="planned" name="Planned" stroke="hsl(213, 60%, 55%)" fill="hsl(213, 60%, 55%)" fillOpacity={0.25} />
              <Area type="monotone" dataKey="achieved" name="Achieved" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={plannedVsAchieved}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar name="Planned" dataKey="planned" stroke="hsl(213, 60%, 55%)" fill="hsl(213, 60%, 55%)" fillOpacity={0.25} />
              <Radar name="Achieved" dataKey="achieved" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.35} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        );

      // Pie/Donut can't show two series (planned + achieved) as a single ring meaningfully,
      // so these two modes show "Achieved" per category as slices.
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={plannedVsAchieved}
                dataKey="achieved"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name }) => name}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {plannedVsAchieved.map((_, i) => (
                  <Cell key={i} fill={`hsl(${(i * 47) % 360}, 65%, 55%)`} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Achieved']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={plannedVsAchieved}
                dataKey="achieved"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {plannedVsAchieved.map((_, i) => (
                  <Cell key={i} fill={`hsl(${(i * 47) % 360}, 65%, 55%)`} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Achieved']} />
            </PieChart>
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
          title="PPM & Soft Services Operations"
          subtitle={
            isLoading
              ? 'Loading...'
              : `${ppm?.total ?? 0} scheduled tasks`
          }
          icon={<ClipboardCheck className="h-4 w-4" />}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top row: stats + chart + compliance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Overall Stats */}
              <div className="sm:col-span-1 lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">

                  {/* PPM Compliance Chart */}
                  <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="text-xs text-muted-foreground cursor-pointer"
                        onClick={() => openSlideOver('kpi_ppm', null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openSlideOver('kpi_ppm', null)}
                      >
                        PPM Compliance
                      </div>
                      <ChartTypeDropdown value={ppmChartType} onChange={setPpmChartType} />
                    </div>

                    <div
                      className="relative h-[150px] w-full cursor-pointer"
                      onClick={() => openSlideOver('kpi_ppm', null)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('kpi_ppm', null)}
                    >
                      <CompletionChart data={ppmDonutData} chartType={ppmChartType} />

                      {showPpmCenterLabel && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <div
                              className={cn(
                                'text-2xl font-bold',
                                complianceRate >= 85
                                  ? 'text-healthy'
                                  : complianceRate >= 70
                                    ? 'text-warning'
                                    : 'text-critical'
                              )}
                            >
                              {complianceRate}%
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Compliance
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PPM Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-healthy">
                          {ppm?.completed ?? 0}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Completed
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-semibold">
                          {ppm?.pending ?? 0}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Pending
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-semibold text-critical">
                          {ppm?.overdue ?? 0}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Overdue
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Soft Services Chart */}
                  {softServices && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-muted-foreground">
                          Soft Services
                        </div>
                        <ChartTypeDropdown value={softServicesChartType} onChange={setSoftServicesChartType} />
                      </div>

                      <div className="relative h-[150px] w-full">
                        <CompletionChart data={softServicesDonutData} chartType={softServicesChartType} />

                        {showSoftServicesCenterLabel && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                              <div
                                className={cn(
                                  'text-2xl font-bold',
                                  softServices.completion_percentage >= 85
                                    ? 'text-healthy'
                                    : softServices.completion_percentage >= 70
                                      ? 'text-warning'
                                      : 'text-critical'
                                )}
                              >
                                {softServices.completion_percentage}%
                              </div>

                              <div className="text-[10px] text-muted-foreground">
                                Compliance
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Soft Services Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-healthy">
                            {softServices.completed}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Completed
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm font-semibold">
                            {softServices.pending}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Pending
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm font-semibold text-critical">
                            {softServices.overdue}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Overdue
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Planned vs Achieved Chart */}
              <div className="sm:col-span-1 lg:col-span-5 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Planned vs Achieved by Category
                  </h4>
                  <ChartTypeDropdown value={plannedVsAchievedChartType} onChange={setPlannedVsAchievedChartType} />
                </div>
                <div className="h-[200px]">
                  {renderPlannedVsAchievedChart()}
                </div>
              </div>

              {/* Category Compliance */}
              <div className="sm:col-span-2 lg:col-span-4 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compliance by Category</h4>
                <div className="space-y-3 max-h-[220px] overflow-auto">
                  {plannedVsAchieved.map(cat => (
                    <div
                      key={cat.name}
                      className="space-y-1 cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{cat.achieved}/{cat.planned}</span>
                          <span className={cn('text-sm font-bold', cat.compliance >= 85 ? 'text-healthy' : cat.compliance >= 70 ? 'text-warning' : 'text-critical')}>
                            {cat.compliance}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', cat.compliance >= 85 ? 'bg-healthy' : cat.compliance >= 70 ? 'bg-warning' : 'bg-critical')}
                          style={{ width: `${cat.compliance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Compliance Grid (FM Head & Ops) */}
            {currentRole !== 'ceo' && plannedVsAchieved.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category Compliance Overview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {plannedVsAchieved.map(cat => (
                    <div
                      key={cat.name}
                      className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer"
                      onClick={() => openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                    >
                      <div className="text-sm font-medium mb-1 truncate">{cat.name}</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('text-xl font-bold', cat.compliance >= 85 ? 'text-healthy' : cat.compliance >= 70 ? 'text-warning' : 'text-critical')}>
                          {cat.compliance}%
                        </span>
                        <span className="text-xs text-muted-foreground">{cat.achieved}/{cat.planned}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', cat.compliance >= 85 ? 'bg-healthy' : cat.compliance >= 70 ? 'bg-warning' : 'bg-critical')}
                          style={{ width: `${cat.compliance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}