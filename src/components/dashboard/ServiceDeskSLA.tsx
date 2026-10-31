import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useServiceDesk } from '@/hooks/useGroupedDashboard';
import { Ticket as TicketIcon, ChevronRight, AlertTriangle, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
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

const CATEGORY_CHART_TYPE_STORAGE_KEY = 'serviceDesk.categoryChartType';

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

function isChartType(value: unknown): value is ChartType {
  return typeof value === 'string' && CHART_TYPE_OPTIONS.some((o) => o.value === value);
}

/** Reads the persisted chart type from localStorage (falls back to default on SSR / first load) */
function getInitialCategoryChartType(): ChartType {
  if (typeof window === 'undefined') return 'bar-horizontal';
  try {
    const stored = window.localStorage.getItem(CATEGORY_CHART_TYPE_STORAGE_KEY);
    return isChartType(stored) ? stored : 'bar-horizontal';
  } catch {
    return 'bar-horizontal';
  }
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

const CATEGORY_COLORS = [
  '#8f53a1',
  '#f47920',
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#ca8a04',
  '#0891b2',
  '#9333ea',
  '#ea580c',
  '#4f46e5',
];

export function ServiceDeskSLA() {
  const { openSlideOver, currentRole, filters, updateFilter, } = useDashboard();
  const { data, isPending: isLoading } = useServiceDesk(filters);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { sites } = useDashboardFilterOptions(filters);

  // Chart type is initialized from localStorage so it survives a page refresh
  const [categoryChartType, setCategoryChartType] = useState<ChartType>(getInitialCategoryChartType);

  useEffect(() => {
    try {
      window.localStorage.setItem(CATEGORY_CHART_TYPE_STORAGE_KEY, categoryChartType);
    } catch {
      // localStorage unavailable (e.g. private browsing) - ignore, selection just won't persist
    }
  }, [categoryChartType]);

  const summary = data?.summary;
  const slaStatus = data?.sla_status;

  const ticketsByStatus = summary
    ? [
      { status: 'total', label: 'Total', count: summary.total },
      { status: 'open', label: 'Open', count: summary.open },
      { status: 'in_progress', label: 'In Progress', count: summary.in_progress },
      // { status: 'pending', label: 'Pending', count: summary.pending },
      // { status: 'resolved', label: 'Resolved', count: summary.resolved },
      { status: 'closed', label: 'Closed', count: summary.closed },
    ]
    : [];

  const categoryChartData = (data?.tickets_by_category ?? [])
    .map((c, index) => ({
      name: c.category,
      value: c.count,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const priorityTickets = (data?.priority_tickets ?? []).filter(t =>
    !statusFilter || t.status === statusFilter
  );

  const handleCategoryClick = (name?: string) => {
    if (name) openSlideOver('drill_ticket', { type: 'category', value: name } as never);
  };

  const renderCategoryChart = () => {
    if (categoryChartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No category data available
        </div>
      );
    }

    switch (categoryChartType) {
      case 'bar-horizontal':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} layout="vertical" margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} allowDecimals={false} />
              <YAxis type="category" dataKey="name" fontSize={10} width={90} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Bar
                dataKey="value"
                name="Tickets"
                radius={[0, 4, 4, 0]}
                barSize={20}
                cursor="pointer"
                onClick={(d) => handleCategoryClick(d?.name)}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`category-cell-${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar-vertical':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 15, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" interval={0} height={45} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Bar
                dataKey="value"
                name="Tickets"
                radius={[4, 4, 0, 0]}
                barSize={24}
                cursor="pointer"
                onClick={(d) => handleCategoryClick(d?.name)}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`category-cellv-${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={categoryChartData} margin={{ top: 10, right: 15, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" interval={0} height={45} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="value" name="Tickets" stroke="#8f53a1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={categoryChartData} margin={{ top: 10, right: 15, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" interval={0} height={45} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Area type="monotone" dataKey="value" name="Tickets" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name }) => name}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`category-pie-${index}`} fill={entry.fill} />
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
                data={categoryChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                onClick={(d) => handleCategoryClick(d?.name)}
                style={{ cursor: 'pointer' }}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`category-donut-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={categoryChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Radar name="Tickets" dataKey="value" stroke="#8f53a1" fill="#8f53a1" fillOpacity={0.4} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
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
          title="Service Desk & SLA Intelligence"
          subtitle={isLoading ? 'Loading...' : `${summary?.total ?? 0} tickets`}
          icon={<TicketIcon className="h-4 w-4" />}
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
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tickets by Status - Responsive Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {ticketsByStatus.map(({ status, label, count }) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "w-full h-auto min-h-[64px] sm:min-h-[72px]",
                    "px-2 sm:px-3 py-2 sm:py-3",
                    "flex flex-col items-center justify-center",
                    "gap-0.5 sm:gap-1",
                    "rounded-lg",
                    "transition-all text-white",
                    statusFilter === status && "ring-2 ring-primary/30"
                  )}
                  style={{ background: 'linear-gradient(90deg, #8f53a1 0%, #f47920 100%)', }}
                  onClick={() =>
                    setStatusFilter(statusFilter === status ? null : status)
                  }
                >
                  <span className="text-lg sm:text-xl font-bold leading-none">
                    {count}
                  </span>

                  <span className="text-xs sm:text-sm capitalize text-center">
                    {label}
                  </span>
                </Button>
              ))}
            </div>

            {/* Main grid: stacks on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* SLA Status */}
              <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SLA Status</h4>
                {slaStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-healthy-bg rounded-md">
                      <span className="text-sm">Within TAT</span>
                      <span className="text-lg font-bold text-healthy">{slaStatus.within_sla}</span>
                    </div>
                    {/* <div className="flex items-center justify-between p-2 bg-warning-bg rounded-md">
                      <span className="text-sm">At Risk</span>
                      <span className="text-lg font-bold text-warning">{slaStatus.at_risk}</span>
                    </div> */}
                    <div className="flex items-center justify-between p-2 bg-critical-bg rounded-md">
                      <span className="text-sm">Outside TAT</span>
                      <span className="text-lg font-bold text-critical">{slaStatus.breached}</span>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                      <span>TAT Compliance</span>
                      <span className="font-semibold text-foreground">{slaStatus.sla_percentage}%</span>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                      <span>Avg Resolution</span>
                      <span className="font-semibold text-foreground">{data?.avg_resolution_time_hours}h</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tickets by Category Chart */}
              <div className="sm:col-span-1 lg:col-span-4 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tickets by Category
                  </h4>
                  <ChartTypeDropdown value={categoryChartType} onChange={setCategoryChartType} />
                </div>

                <div className="h-[200px]">
                  {renderCategoryChart()}
                </div>
              </div>

              {/* Priority Tickets */}
              <div className="sm:col-span-2 lg:col-span-5 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-critical" />
                  Priority Tickets
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {priorityTickets.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">No priority tickets</div>
                  ) : (
                    priorityTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 group"
                        onClick={() => openSlideOver('ticket', ticket as never)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium truncate">{ticket.ticket_number}</span>
                            <StatusBadge status={ticket.priority === 'critical' ? 'critical' : 'warning'} label={ticket.priority} size="sm" />
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{ticket.heading}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <StatusBadge
                            status={ticket.sla_status === 'within_sla' ? 'healthy' : ticket.sla_status === 'at_risk' ? 'warning' : 'critical'}
                            label={ticket.sla_status.replace('_', ' ')}
                            size="sm"
                          />
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* All Priority Tickets (FM Head & Ops) */}
            {currentRole !== 'ceo' && data?.priority_tickets && data.priority_tickets.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Priority Tickets</h4>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {data.priority_tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 group"
                      onClick={() => openSlideOver('ticket', ticket as never)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-xs font-medium w-20 sm:w-28 shrink-0">{ticket.ticket_number}</span>
                        <span className="text-xs text-muted-foreground truncate">{ticket.heading}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <StatusBadge status={ticket.priority === 'critical' ? 'critical' : 'warning'} label={ticket.priority} size="sm" />
                        <StatusBadge
                          status={ticket.sla_status === 'within_sla' ? 'healthy' : ticket.sla_status === 'at_risk' ? 'warning' : 'critical'}
                          label={ticket.sla_status.replace('_', ' ')}
                          size="sm"
                        />
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
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