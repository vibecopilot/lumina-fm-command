import { useState, useMemo, useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSitePerformance } from '@/hooks/useGroupedDashboard';
import { SitePerformanceSite } from '@/types/groupedDashboard';
import { MapPin, ChevronRight, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { cn, safeNumber } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardFilterOptions } from '@/hooks/useDashboardFilterOptions';
import type { SiteOption } from '@/hooks/useDashboardFilterOptions';

type SortField = 'name' | 'health_score' | 'sla_percentage' | 'ppm_percentage' | 'pending_tickets';
type SortDirection = 'asc' | 'desc';

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

const HEALTH_COLORS = {
  healthy: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
};

function getHealthStatus(score: number): 'healthy' | 'warning' | 'critical' {
  if (score >= 85) return 'healthy';
  if (score >= 70) return 'warning';
  return 'critical';
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
      value={siteId || "all"}
      onValueChange={(value) =>
        onChange(value === "all" ? null : value)
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
              site.name !== "HO" &&
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
        className="h-8 px-3 text-xs gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {selectedLabel}
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 rounded-md border bg-popover shadow-lg z-20 overflow-hidden">
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
                  'w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                {opt.label}
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SitePerformanceOverview() {
  const { openSlideOver, filters, updateFilter } = useDashboard();
  const { data, isPending: isLoading } = useSitePerformance(filters);
  const { sites } = useDashboardFilterOptions(filters);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('health_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');
  const [chartType, setChartType] = useState<ChartType>('bar-vertical');

  const filteredSites = useMemo(() => {
    let result = [...(data?.sites ?? [])];

    result = result.filter((site) => site.name?.trim().toUpperCase() !== 'HO');

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          (s.city?.toLowerCase().includes(searchLower) ?? false) ||
          s.group.toLowerCase().includes(searchLower)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string') {
        return (aVal as string).localeCompare(bVal as string) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

    return result;
  }, [data?.sites, search, sortField, sortDirection]);

  const chartData = useMemo(
    () =>
      filteredSites.map((site) => ({
        name: site.name,
        health: safeNumber(site.health_score),
        sla: safeNumber(site.sla_percentage),
        ppm: safeNumber(site.ppm_percentage),
        fill: HEALTH_COLORS[getHealthStatus(safeNumber(site.health_score))],
      })),
    [filteredSites]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'bg-healthy';
    if (score >= 70) return 'bg-warning';
    return 'bg-critical';
  };

  const totalSites = data?.total_sites ?? 0;

  const renderChart = () => {
    switch (chartType) {
      case 'bar-vertical':
        return (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={60} fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Bar dataKey="health" name="Health" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar-horizontal':
        return (
          <ResponsiveContainer width="100%" height={Math.max(360, chartData.length * 32)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} fontSize={11} />
              <YAxis type="category" dataKey="name" width={100} fontSize={11} />
              <Tooltip />
              <Bar dataKey="health" name="Health" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={60} fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="health" name="Health" stroke="#8f53a1" strokeWidth={2} />
              <Line type="monotone" dataKey="sla" name="TAT" stroke="#f47920" strokeWidth={2} />
              <Line type="monotone" dataKey="ppm" name="PPM" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={60} fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="health" name="Health" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="health"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={({ name }) => name}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="health"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={130}
                label={({ name }) => name}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" fontSize={11} />
              <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
              <Radar name="Health" dataKey="health" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.4} />
              <Radar name="TAT" dataKey="sla" stroke="#f47920" fill="#f47920" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-6">
      <div className="container">
        <SectionHeader
          title="Site Performance Overview"
          subtitle={isLoading ? 'Loading...' : `${filteredSites.length} of ${totalSites} sites`}
          icon={<MapPin className="h-4 w-4" />}
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sites..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full sm:w-48 pl-8 text-xs"
                />
              </div>
              <div
                className="flex items-center gap-0.5 text-white rounded-md p-0.5"
                style={{ background: 'linear-gradient(90deg, #8f53a1 0%, #f47920 100%)' }}
              >
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'heatmap' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setViewMode('heatmap')}
                >
                  Heatmap
                </Button>
              </div>

              {/* Chart type dropdown - only relevant/visible in heatmap (chart) view */}
              {/* {viewMode === 'heatmap' && ( */}
              <ChartTypeDropdown value={chartType} onChange={setChartType} />
              {/* )} */}

              {/* ALL SITES - Right side */}
              <SiteFilterSelect
                siteId={filters.site_id}
                groupId={filters.group_id}
                sites={sites}
                onChange={(siteId) =>
                  updateFilter("site_id", siteId)
                }
              />
            </div>
          }
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : viewMode === 'table' ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto">
                <Table className="data-table min-w-[900px]">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow
                      className="border-0 hover:bg-transparent"
                      style={{ background: 'linear-gradient(90deg, #8f53a1 0%, #f47920 100%)' }}
                    >
                      <TableHead
                        className="w-[200px] cursor-pointer !bg-transparent !text-white"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Site Name <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead className="!bg-transparent !text-white">Region</TableHead>
                      <TableHead className="!bg-transparent !text-white">City</TableHead>
                      <TableHead
                        className="text-center cursor-pointer !bg-transparent !text-white"
                        onClick={() => handleSort('health_score')}
                      >
                        <div className="flex items-center justify-center">
                          Health <SortIcon field="health_score" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer !bg-transparent !text-white"
                        onClick={() => handleSort('sla_percentage')}
                      >
                        <div className="flex items-center justify-center">
                          TAT <SortIcon field="sla_percentage" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer !bg-transparent !text-white"
                        onClick={() => handleSort('ppm_percentage')}
                      >
                        <div className="flex items-center justify-center">
                          PPM <SortIcon field="ppm_percentage" />
                        </div>
                      </TableHead>
                      <TableHead className="w-8 !bg-transparent !text-white"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.map((site: SitePerformanceSite) => (
                      <TableRow
                        key={site.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openSlideOver('drill_site', { id: site.id, name: site.name })}
                      >
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{site.group}</TableCell>
                        <TableCell className="text-muted-foreground">{site.city ?? '—'}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.health_score))}
                            label={`${safeNumber(site.health_score)}%`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.sla_percentage))}
                            label={`${safeNumber(site.sla_percentage)}%`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.ppm_percentage))}
                            label={`${safeNumber(site.ppm_percentage)}%`}
                          />
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            {chartType === 'bar-vertical' &&
              chartData.length === 0 ? null : (
              <>{renderChart()}</>
            )}

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-healthy" />
                <span className="text-xs text-muted-foreground">Healthy (≥85%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-warning" />
                <span className="text-xs text-muted-foreground">Warning (70-84%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-critical" />
                <span className="text-xs text-muted-foreground">Critical (&lt;70%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}