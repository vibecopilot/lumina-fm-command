import { useMemo, useRef, useState, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAssetPortfolio } from '@/hooks/useGroupedDashboard';
import { Wrench, ChevronRight, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

function healthColor(pct: number) {
  return pct >= 85 ? 'hsl(142, 71%, 45%)' : pct >= 70 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)';
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
        className="h-7 px-2.5 text-2xs gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {selectedLabel}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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

export function AssetPortfolioHealth() {
  const { openSlideOver, currentRole, filters, updateFilter, } = useDashboard();
  const { data, isPending: isLoading } = useAssetPortfolio(filters);
  const { sites } = useDashboardFilterOptions(filters);

  const [categoryChartType, setCategoryChartType] = useState<ChartType>('bar-vertical');
  const [statusChartType, setStatusChartType] = useState<ChartType>('donut');

  const summary = data?.summary;
  const categoryBreakdown = data?.category_breakdown ?? [];
  const criticalAssets = data?.critical_assets ?? [];

  const pieData = summary
    ? [
      { name: 'Operational', value: summary.operational, color: 'hsl(142, 71%, 45%)' },
      { name: 'BreakDown', value: summary.maintenance, color: 'hsl(38, 92%, 50%)' },
      // { name: 'Offline', value: summary.offline, color: 'hsl(215, 16%, 47%)' },
      { name: 'Critical', value: summary.critical, color: 'hsl(0, 84%, 60%)' },
    ]
    : [];

  const getHealthStatus = (pct: number): 'healthy' | 'warning' | 'critical' =>
    pct >= 85 ? 'healthy' : pct >= 70 ? 'warning' : 'critical';

  const handleStatusClick = (name?: string) => {
    if (name) openSlideOver('drill_asset', { type: 'status', value: name.toLowerCase() });
  };

  const renderStatusChart = () => {
    if (pieData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No status data available
        </div>
      );
    }

    switch (statusChartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name }) => name}
                onClick={(d) => handleStatusClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`status-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
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
                nameKey="name"
                onClick={(d) => handleStatusClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`status-donut-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar-vertical':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Bar
                dataKey="value"
                name="Assets"
                radius={[5, 5, 0, 0]}
                maxBarSize={40}
                cursor="pointer"
                onClick={(d) => handleStatusClick(d?.name)}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`status-bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar-horizontal':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Bar
                dataKey="value"
                name="Assets"
                radius={[0, 5, 5, 0]}
                maxBarSize={28}
                cursor="pointer"
                onClick={(d) => handleStatusClick(d?.name)}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`status-barh-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pieData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="value" name="Assets" stroke="#8f53a1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pieData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Area type="monotone" dataKey="value" name="Assets" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={pieData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar name="Assets" dataKey="value" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.4} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const categoryChartData = useMemo(
    () =>
      categoryBreakdown.map((cat) => ({
        category: cat.category,
        health_percentage: cat.health_percentage,
        total: cat.total,
        fill: healthColor(cat.health_percentage),
      })),
    [categoryBreakdown]
  );

  const chartWidth = Math.max(categoryChartData.length * 75, 450);

  const renderCategoryChart = () => {
    if (categoryChartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No category data available
        </div>
      );
    }

    switch (categoryChartType) {
      case 'bar-vertical':
        return (
          <div style={{ width: `${chartWidth}px`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 15, right: 20, left: 5, bottom: 55 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={65}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Health']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar
                  dataKey="health_percentage"
                  name="Health"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={35}
                  cursor="pointer"
                  onClick={(d) => d?.category && openSlideOver('drill_asset', { type: 'category', value: d.category })}
                >
                  {categoryChartData.map((cat, index) => (
                    <Cell key={`category-${index}`} fill={cat.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'bar-horizontal':
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={100}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Health']}
                />
                <Bar
                  dataKey="health_percentage"
                  name="Health"
                  radius={[0, 5, 5, 0]}
                  maxBarSize={28}
                  cursor="pointer"
                  onClick={(d) => d?.category && openSlideOver('drill_asset', { type: 'category', value: d.category })}
                >
                  {categoryChartData.map((cat, index) => (
                    <Cell key={`category-h-${index}`} fill={cat.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line':
        return (
          <div style={{ width: `${chartWidth}px`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryChartData} margin={{ top: 15, right: 20, left: 5, bottom: 55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={65}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Health']} />
                <Line type="monotone" dataKey="health_percentage" name="Health" stroke="#8f53a1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'area':
        return (
          <div style={{ width: `${chartWidth}px`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryChartData} margin={{ top: 15, right: 20, left: 5, bottom: 55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={65}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Health']} />
                <Area
                  type="monotone"
                  dataKey="health_percentage"
                  name="Health"
                  stroke="#8f53a1"
                  fill="#8f53a1"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                dataKey="health_percentage"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ category }) => category}
                onClick={(d) => d?.category && openSlideOver('drill_asset', { type: 'category', value: d.category })}
                style={{ cursor: 'pointer' }}
              >
                {categoryChartData.map((cat, index) => (
                  <Cell key={`pie-${index}`} fill={cat.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Health']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                dataKey="health_percentage"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                label={({ category }) => category}
                onClick={(d) => d?.category && openSlideOver('drill_asset', { type: 'category', value: d.category })}
                style={{ cursor: 'pointer' }}
              >
                {categoryChartData.map((cat, index) => (
                  <Cell key={`donut-${index}`} fill={cat.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Health']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={categoryChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Health" dataKey="health_percentage" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.4} />
              <Legend />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Health']} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Charts that need horizontal scroll (categorical x-axis charts); pie/donut/radar/horizontal-bar fit the container
  const needsScroll = ['bar-vertical', 'line', 'area'].includes(categoryChartType);

  return (
    <section className="py-4 sm:py-6 border-t">
      <div className="container">
        <SectionHeader
          title="Asset Portfolio & Health"
          subtitle={
            isLoading
              ? 'Loading...'
              : `${summary?.total ?? 0} assets across all sites`
          }
          icon={<Wrench className="h-4 w-4" />}
          actions={
            <SiteFilterSelect
              siteId={filters.site_id}
              groupId={filters.group_id}
              sites={sites}
              onChange={(siteId) =>
                updateFilter("site_id", siteId)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Status Overview Chart */}
            <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status Distribution
                </h4>
                <ChartTypeDropdown value={statusChartType} onChange={setStatusChartType} />
              </div>
              <div className="h-[180px]">
                {renderStatusChart()}
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

            {/* Category Performance */}
            <div className="sm:col-span-1 lg:col-span-5 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category Performance
                </h4>
                <ChartTypeDropdown value={categoryChartType} onChange={setCategoryChartType} />
              </div>

              <div className={cn('h-[240px] w-full', needsScroll ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden')}>
                {renderCategoryChart()}
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