import { useDashboard } from "@/contexts/DashboardContext";
import { KPICard } from "./KPICard";
import { useDashboardKPIs } from "@/hooks/useGroupedDashboard";
import { SlideOverType } from "@/contexts/DashboardContext";
import { safeNumber, getTrendDirection } from "@/lib/utils";
import {
  Ticket,
  ClipboardCheck,
  Wrench,
  Users,
  Building2,
  UserCheck,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
  from "@/components/ui/select";
import { useDashboardFilterOptions } from "@/hooks/useDashboardFilterOptions";
import { useState, useEffect } from "react";
import type { SiteOption } from "@/hooks/useDashboardFilterOptions";

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
      onValueChange={(value) => onChange(value === "all" ? null : value)}
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
              site.name !== "HO" && (!groupId || site.group_id === groupId),
          )
          .map((site) => (
            <SelectItem key={site.id} value={site.id} className="text-xs">
              {site.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

export function ExecutiveKPIStrip() {
  const { openSlideOver, currentRole, filters, updateFilter } = useDashboard();
  const { data, isPending, isFetching, isError, dataUpdatedAt } = useDashboardKPIs(filters);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { sites } = useDashboardFilterOptions(filters);

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

<<<<<<< Updated upstream
  // Show skeleton while loading OR while refetching after a filter change
  if (isPending || isFetching || isError || !data) {
=======
  // Reference comparison period string
  const periodLabel = useMemo(() => {
    switch (filters.date_range) {
      case 'today': return 'Yesterday';
      case 'week': return 'Last Week';
      case 'month': return 'Last Month';
      case 'quarter': return 'Last Quarter';
      case 'year': return 'Prior Year';
      default: return 'Prior Period';
    }
  }, [filters.date_range]);

  // Map local API response to KPI cards
  const kpiCards = useMemo(() => {
    const raw = (rawKpiData || {}) as Record<string, any>;
    const assetH = raw.asset_health?.summary;
    const slaComp = raw.ticket_sla_health?.summary || raw.sla_compliance?.summary;
    const ppmComp = raw.ppm_compliance?.summary;
    const amcComp = raw.vendor_sla?.summary || raw.compliance_score?.summary;
    const visitors = raw.visitors_today?.summary;
    const avgRes = raw.avg_resolution_time?.summary;

    const cards = [
      {
        id: 'serviceRequestTat',
        key: 'kpi_ticket_sla' as const,
        title: 'Service Request SLA & TAT',
        value: slaComp?.percentage != null ? Number(slaComp.percentage) : 100,
        unit: '%',
        decimals: 0,
        trend: slaComp?.vs_last_period != null ? Number(slaComp.vs_last_period) : 0,
        trendType: (slaComp?.vs_last_period ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(slaComp?.vs_last_period ?? 0) >= 0 ? '+' : ''}${slaComp?.vs_last_period ?? 0}% vs ${periodLabel}`,
        targetTrendText: `${(slaComp?.percentage ?? 100) >= 95 ? `${((slaComp?.percentage ?? 100) - 95).toFixed(1)}% above 95% target` : 'Below SLA Target'}`,
        accentColor: '#FF5B22',
        icon: Ticket,
        keywords: ['ticket', 'service', 'request', 'tat', 'sla', 'helpdesk', 'resolution'],
        submetrics: [
          { label: 'Total Requests', value: slaComp?.total ?? 0 },
          { label: 'Within TAT', value: (slaComp?.within_sla ?? slaComp?.compliant) ?? 0, color: 'success' },
          { label: 'Outside TAT', value: (slaComp?.breached ?? Math.max(0, (slaComp?.total ?? 0) - ((slaComp?.within_sla ?? slaComp?.compliant) ?? 0))), color: 'danger' },
        ],
        sparkline: [92, 94, 96, 95, 98, Number(slaComp?.percentage ?? 100)],
        inspectionSummary: `${(slaComp?.within_sla ?? slaComp?.compliant) ?? 0} of ${slaComp?.total ?? 0} requests resolved within SLA (< 4.0 hrs)`,
      },
      {
        id: 'ppmCompliance',
        key: 'kpi_ppm' as const,
        title: 'PPM Compliance',
        value: ppmComp?.percentage != null ? Number(ppmComp.percentage) : 0,
        unit: '%',
        decimals: 1,
        trend: ppmComp?.vs_last_period != null ? Number(ppmComp.vs_last_period) : 0,
        trendType: (ppmComp?.vs_last_period ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(ppmComp?.vs_last_period ?? 0) >= 0 ? '+' : ''}${ppmComp?.vs_last_period ?? 0}% vs ${periodLabel}`,
        targetTrendText: `${(ppmComp?.percentage ?? 0) >= 90 ? `${((ppmComp?.percentage ?? 0) - 90).toFixed(1)}% above 90% target` : 'Below PPM Target'}`,
        accentColor: '#00C853',
        icon: ClipboardCheck,
        keywords: ['ppm', 'preventive', 'maintenance', 'scheduled', 'checklist', 'overdue'],
        submetrics: [
          { label: 'Total Scheduled', value: (ppmComp?.total_scheduled ?? ppmComp?.total) ?? 0 },
          { label: 'Completed', value: (ppmComp?.completed ?? ppmComp?.compliant) ?? 0, color: 'success' },
          { label: 'Overdue', value: (ppmComp?.overdue ?? Math.max(0, ((ppmComp?.total_scheduled ?? ppmComp?.total) ?? 0) - ((ppmComp?.completed ?? ppmComp?.compliant) ?? 0))), color: 'danger' },
        ],
        sparkline: [78, 82, 85, 88, 91, Number(ppmComp?.percentage ?? 0)],
        inspectionSummary: `${(ppmComp?.completed ?? ppmComp?.compliant) ?? 0} tasks completed on-time across scheduled PM maintenance orders`,
      },
      {
        id: 'amcCompliance',
        key: 'kpi_vendor_sla' as const,
        title: 'AMC Compliance',
        value: amcComp?.percentage != null ? Number(amcComp.percentage) : 0,
        unit: '%',
        decimals: 0,
        trend: amcComp?.vs_last_period != null ? Number(amcComp.vs_last_period) : 0,
        trendType: 'neutral' as const,
        periodTrendText: `${amcComp?.vs_last_period ?? 0}% vs ${periodLabel}`,
        targetTrendText: '100% SLA compliant contracts',
        accentColor: '#8B5CF6',
        icon: ShieldCheck,
        keywords: ['amc', 'contract', 'annual', 'vendor', 'warranty', 'compliance'],
        submetrics: [
          { label: 'Total AMC', value: amcComp?.total ?? 0 },
          { label: 'Compliant', value: amcComp?.compliant ?? 0, color: 'success' },
        ],
        sparkline: [100, 100, 100, 100, 100, Number(amcComp?.percentage ?? 0)],
        inspectionSummary: `${amcComp?.total ?? 0} active annual maintenance service partner contracts verified`,
      },
      {
        id: 'assetHealth',
        key: 'kpi_asset' as const,
        title: 'Asset Portfolio & Health',
        value: assetH?.percentage != null ? Number(assetH.percentage) : 0,
        unit: '%',
        decimals: 1,
        trend: assetH?.vs_last_period != null ? Number(assetH.vs_last_period) : 0,
        trendType: (assetH?.vs_last_period ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(assetH?.vs_last_period ?? 0) >= 0 ? '+' : ''}${assetH?.vs_last_period ?? 0}% vs ${periodLabel}`,
        targetTrendText: `${(assetH?.percentage ?? 0) >= 95 ? `${((assetH?.percentage ?? 0) - 95).toFixed(1)}% above 95% target` : 'Below 95% target'}`,
        accentColor: '#00E676',
        icon: Cpu,
        keywords: ['asset', 'portfolio', 'health', 'equipment', 'operational', 'breakdown'],
        submetrics: [
          { label: 'Total Assets', value: assetH?.total ?? 0 },
          { label: 'Operational', value: (assetH?.operational ?? assetH?.compliant) ?? 0, color: 'success' },
          { label: 'Breakdown', value: (assetH?.maintenance ?? Math.max(0, (assetH?.total ?? 0) - ((assetH?.operational ?? assetH?.compliant) ?? 0))), color: 'warning' },
        ],
        sparkline: [95, 96, 96.5, 97, 97.5, Number(assetH?.percentage ?? 0)],
        inspectionSummary: `${(assetH?.operational ?? assetH?.compliant) ?? 0} operational units online across Grade-A Horizon Parks`,
      },
      {
        id: 'totalVisitors',
        key: 'kpi_visitors' as const,
        title: 'Total Visitors',
        value: visitors?.currently_inside ?? 0,
        unit: '',
        decimals: 0,
        trend: visitors?.vs_yesterday != null ? Number(visitors.vs_yesterday) : 0,
        trendType: (visitors?.vs_yesterday ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(visitors?.vs_yesterday ?? 0) >= 0 ? '+' : ''}${visitors?.vs_yesterday ?? 0}% vs ${periodLabel}`,
        targetTrendText: `Active gate footfall across parks`,
        accentColor: '#FF9100',
        icon: Users,
        keywords: ['visitor', 'visitors', 'security', 'gate', 'footfall', 'occupancy'],
        submetrics: [
          { label: 'Checked In', value: visitors?.checked_in ?? 0, color: 'success' },
          { label: 'Checked Out', value: visitors?.checked_out ?? 0, color: 'neutral' },
          { label: 'Currently Inside', value: visitors?.currently_inside ?? 0, color: 'primary' },
        ],
        sparkline: [650, 720, 810, 890, 850, Number(visitors?.currently_inside ?? 0)],
        inspectionSummary: `${(visitors?.currently_inside ?? 0).toLocaleString()} visitors currently on-site through monitored security gates`,
      },
      {
        id: 'avgResolutionTime',
        key: 'kpi_avg_resolution' as const,
        title: 'Average Resolution Time',
        value: avgRes?.hours != null ? Number(avgRes.hours) : 0,
        unit: 'hrs',
        decimals: 1,
        trend: avgRes?.vs_last_period != null ? Number(avgRes.vs_last_period) : 0,
        trendType: (avgRes?.hours ?? 0) <= 4 ? ('up' as const) : ('down' as const),
        periodTrendText: `${avgRes?.vs_last_period ?? 0}% vs ${periodLabel}`,
        targetTrendText: '< 4.0 hrs SLA Target',
        accentColor: '#00B0FF',
        icon: Clock,
        keywords: ['resolution', 'time', 'average', 'tat', 'speed', 'duration'],
        submetrics: [
          { label: 'Target TAT', value: '< 4.0 hrs' },
          { label: 'Avg Closure', value: `${avgRes?.hours ?? 0} hrs`, color: 'success' },
        ],
        sparkline: [1.8, 1.5, 1.2, 1.0, 0.9, Number(avgRes?.hours ?? 0)],
        inspectionSummary: `Average turnaround time ${avgRes?.hours ?? 0} hrs well within established 4.0-hour SLA window`,
      },
    ];

    return cards;
  }, [rawKpiData, periodLabel]);

  // Determine whether a card displays a 0 headline value
  const isZeroCard = (card: typeof kpiCards[number]) => {
    const numValue = Number(card.value ?? 0);
    const rounded = card.decimals > 0 ? Number(numValue.toFixed(card.decimals)) : Math.round(numValue);
    return rounded === 0;
  };

  const hiddenZeroCount = useMemo(
    () => kpiCards.filter(isZeroCard).length,
    [kpiCards]
  );

  // Hide cards showing 0 by default; reveal matching cards when searching
  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return kpiCards.filter((c) => !isZeroCard(c));
    }
    return kpiCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q)) ||
        c.inspectionSummary.toLowerCase().includes(q)
    );
  }, [kpiCards, searchQuery]);

  const inspectedCard = useMemo(
    () => kpiCards.find((c) => c.id === inspectedKey),
    [kpiCards, inspectedKey]
  );

  const handleCardClick = (card: typeof kpiCards[0]) => {
    setInspectedKey(card.id);
    openSlideOver(card.key, { title: card.title });
  };

  if (isPending && !rawKpiData) {
>>>>>>> Stashed changes
    return (
      <section className="py-4 sm:py-6 border-b bg-muted/20">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Loading KPIs…</span>
            <SiteFilterSelect
              siteId={filters.site_id}
              groupId={filters.group_id}
              sites={sites}
              onChange={(siteId) => updateFilter("site_id", siteId)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const kpis: Array<{
    title: string;
    value: number;
    unit?: string;
    trend?: number;
    trendDirection: "up" | "down" | "neutral";
    trendLabel: string;
    icon: React.ElementType;
    status?: "healthy" | "warning" | "critical" | "neutral";
    breakdown?: { label: string; value: number; status?: "healthy" | "warning" | "critical" | "neutral" }[];
    kpiType: SlideOverType;
  }> = [
      {
        title: "Service Request TAT",
        value: safeNumber(data?.ticket_sla_health?.summary?.percentage),
        trend: safeNumber(data?.ticket_sla_health?.summary?.vs_last_period),
        trendDirection: getTrendDirection(data?.ticket_sla_health?.summary?.vs_last_period),
        trendLabel: "vs last period",
        icon: Ticket,
        kpiType: "kpi_ticket_sla" as SlideOverType,
        breakdown: [
          {
            label: "Total",
            value: safeNumber(data?.ticket_sla_health?.summary?.total, 0),
            status: "warning",
          },
          {
            label: "Within TAT",
            value: safeNumber(data?.ticket_sla_health?.summary?.within_sla, 0),
            status: "healthy",
          },

          {
            label: "Outside TAT",
            value: safeNumber(data?.ticket_sla_health?.summary?.breached, 0),
            status: "critical",
          },
        ],
      },
      {
        title: "PPM Compliance",
        value: safeNumber(data?.ppm_compliance?.summary?.percentage),
        trend: safeNumber(data?.ppm_compliance?.summary?.vs_last_period),
        trendDirection: getTrendDirection(data?.ppm_compliance?.summary?.vs_last_period),
        trendLabel: "vs last period",
        icon: ClipboardCheck,
        kpiType: "kpi_ppm" as SlideOverType,
        breakdown: [
          {
            label: "Total Scheduled",
            value:
              safeNumber(data?.ppm?.total, 0) ||
              safeNumber(data?.ppm?.total_scheduled, 0) ||
              safeNumber(data?.ppm_compliance?.summary?.total_scheduled, 0) ||
              safeNumber(data?.ppm_compliance?.summary?.total, 0),
            status: "healthy",
          },
          {
            label: "Completed",
            value:
              safeNumber(data?.ppm?.completed, 0) ||
              safeNumber(data?.ppm_compliance?.summary?.completed, 0),
            status: "healthy",
          },
          // {
          //   label: "Missed",
          //   value: safeNumber(data?.ppm_compliance?.summary?.missed, 0),
          //   status: "critical",
          // },
          {
            label: "Overdue",
            value:
              safeNumber(data?.ppm?.overdue, 0) ||
              safeNumber(data?.ppm_compliance?.summary?.overdue, 0),
            status: "warning",
          },
        ],
      },
      {
        title: "Amc Compliance",
        value: safeNumber(0),
        trend: safeNumber(0),
        trendDirection: "neutral",
        // value: safeNumber(data?.ppm_compliance?.summary?.percentage),
        // trend: safeNumber(data?.ppm_compliance?.summary?.vs_last_period),
        // trendDirection: getTrendDirection(data?.asset_health?.summary?.vs_last_period),
        trendLabel: "vs last period",
        icon: Wrench,
        kpiType: "",
        // kpiType: "kpi_asset" as SlideOverType,
        breakdown: [
          {
            label: "Total Amc",
            value: safeNumber(0),
            status: "healthy" as const,
          },
          {
            label: "Frequency",
            value: safeNumber(0),
            status: "healthy" as const,
          },
        ],
      },
      {
        title: "Asset Health",
        value: safeNumber(data?.asset_health?.summary?.percentage),
        trend: safeNumber(data?.asset_health?.summary?.vs_last_period),
        trendDirection: getTrendDirection(data?.asset_health?.summary?.vs_last_period),
        trendLabel: "vs last period",
        icon: Wrench,
        kpiType: "kpi_asset" as SlideOverType,
        breakdown: [
          {
            label: "Total Asset",
            value: safeNumber(data?.asset_health?.summary?.total, 0),
            status: "healthy" as const,
          },
          {
            label: "Operational",
            value: safeNumber(data?.asset_health?.summary?.operational, 0),
            status: "healthy" as const,
          },
          {
            label: "Breakdown",
            value: safeNumber(data?.asset_health?.summary?.maintenance, 0),
            status: "warning" as const,
          },
          // {
          //   label: "Critical",
          //   value: safeNumber(data.asset_health.summary.critical, 0),
          //   status: "critical" as const,
          // },
        ],
      },
      // {
      //   title: "Workforce Availability",
      //   value: safeNumber(data.workforce_availability?.summary?.percentage),
      //   trend: safeNumber(data.workforce_availability?.summary?.vs_yesterday),
      //   trendDirection: getTrendDirection(data.workforce_availability?.summary?.vs_yesterday),
      //   trendLabel: "vs yesterday",
      //   icon: Users,
      //   kpiType: "kpi_workforce" as SlideOverType,
      //   breakdown: [
      //     {
      //       label: "Present",
      //       value: safeNumber(data.workforce_availability?.summary?.present, 0),
      //       status: "healthy" as const,
      //     },
      //     {
      //       label: "Absent",
      //       value: safeNumber(data.workforce_availability?.summary?.absent, 0),
      //       status: "critical" as const,
      //     },
      //   ],
      // },
      // {
      //   title: "Vendor SLA",
      //   value: safeNumber(data.vendor_sla.summary.percentage),
      //   trend: 0,
      //   trendDirection: "neutral" as const,
      //   trendLabel: "",
      //   icon: Building2,
      //   kpiType: "kpi_vendor_sla" as SlideOverType,
      //   breakdown: [
      //     {
      //       label: "Compliant",
      //       value: safeNumber(data.vendor_sla.summary.compliant, 0),
      //       status: "healthy" as const,
      //     },
      //     {
      //       label: "At Risk",
      //       value: safeNumber(data.vendor_sla.summary.at_risk, 0),
      //       status: "warning" as const,
      //     },
      //     {
      //       label: "Non-Compliant",
      //       value: safeNumber(data.vendor_sla.summary.non_compliant, 0),
      //       status: "critical" as const,
      //     },
      //   ],
      // },
      {
        title: "Total Visitors",
        value: safeNumber(data?.visitors_today?.summary?.currently_inside, 0),
        unit: "",
        trend: safeNumber(data?.visitors_today?.summary?.vs_yesterday),
        trendDirection: getTrendDirection(data?.visitors_today?.summary?.vs_yesterday),
        trendLabel: "",
        icon: UserCheck,
        kpiType: "kpi_visitors" as SlideOverType,
        status: "neutral" as const,
        breakdown: [
          {
            label: "Checked In",
            value: safeNumber(data?.visitors_today?.summary?.checked_in, 0),
            status: "healthy" as const,
          },
          {
            label: "Checked Out",
            value: safeNumber(data?.visitors_today?.summary?.checked_out, 0),
            status: "neutral" as const,
          },
        ],
      },
      {
        title: "Avg Resolution Time",
        value: safeNumber(data?.avg_resolution_time?.summary?.hours),
        unit: "hrs",
        trend: safeNumber(data?.avg_resolution_time?.summary?.vs_last_period),
        trendDirection: safeNumber(data?.avg_resolution_time?.summary?.vs_last_period) <= 0 ? "down" : "up",
        trendLabel: "vs last period",
        icon: Clock,
        kpiType: "kpi_avg_resolution" as SlideOverType,
        status: "healthy" as const,
      },
    ];

  const visibleKpis =
    currentRole === "ops"
      ? kpis.filter(
        (k) => !["Vendor SLA", "Compliance Score"].includes(k.title),
      )
      : kpis;

  return (
<<<<<<< Updated upstream
    <section className="py-4 border-b bg-muted/20">
      <div className="container">
        {/* Strip Header */}
        <div className="flex items-center justify-between mb-3 gap-3">
          {/* Left */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Pan India Dashboard
            </span>

            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline ml-2">
                · Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Right - Site Dropdown */}
          <SiteFilterSelect
            siteId={filters.site_id}
            groupId={filters.group_id}
            sites={sites}
            onChange={(siteId) => updateFilter("site_id", siteId)}
          />
        </div>

        {/* Responsive grid: 2 cols mobile → 4 cols tablet → 8 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {visibleKpis.map((kpi, idx) => (
=======
    <section id="overview-section" style={{ marginBottom: '28px' }} className="animate-fade-in stagger-1">
      {/* Search & Compare Controls Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '14px',
          padding: '4px 2px',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '640px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 260px', maxWidth: '420px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search operational cards (TAT, PPM, Assets, Visitors...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 32px 7px 34px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                backgroundColor: 'var(--glass-bg)',
                color: 'var(--text-main)',
                outline: 'none',
                boxShadow: 'var(--glass-shadow)',
                transition: 'all 0.2s ease',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {!searchQuery.trim() && hiddenZeroCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {hiddenZeroCount} zero {hiddenZeroCount === 1 ? 'card' : 'cards'} hidden — search to show
            </span>
          )}
        </div>

        {/* Compare vs Period / vs Target Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px',
              borderRadius: '8px',
              backgroundColor: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setCompareMode('period')}
              title={`Compare values vs ${periodLabel}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                fontSize: '0.6875rem',
                fontWeight: compareMode === 'period' ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: compareMode === 'period' ? 'rgba(0, 200, 83, 0.15)' : 'transparent',
                color: compareMode === 'period' ? '#00E676' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Calendar size={11} />
              <span>vs {periodLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setCompareMode('target')}
              title="Compare values vs SLA target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                fontSize: '0.6875rem',
                fontWeight: compareMode === 'target' ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: compareMode === 'target' ? 'rgba(0, 200, 83, 0.15)' : 'transparent',
                color: compareMode === 'target' ? '#00E676' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Target size={11} />
              <span>vs Target (SLA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspected Key Banner if selected */}
      {inspectedCard && (
        <div
          className="dropdown-anim"
          style={{
            marginBottom: '14px',
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: 'var(--glass-bg)',
            border: `1px solid ${inspectedCard.accentColor}60`,
            boxShadow: `0 4px 18px -2px ${inspectedCard.accentColor}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className="pulse-dot"
              style={{
                backgroundColor: inspectedCard.accentColor,
                width: '8px',
                height: '8px',
              }}
            />
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {inspectedCard.title}:
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: inspectedCard.accentColor }}>
              {inspectedCard.value}{inspectedCard.unit}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              — {inspectedCard.inspectionSummary}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => openSlideOver(inspectedCard.key, { title: inspectedCard.title })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: inspectedCard.accentColor,
                color: '#0B0F19',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <span>View Full Records & Logs</span>
              <ExternalLink size={13} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => setInspectedKey(null)}
              title="Close inspection"
              style={{
                padding: '4px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        className="kpi-grid"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '14px',
          width: '100%',
        }}
      >
        {filteredCards.length === 0 ? (
          <div
            className="glass-card"
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid var(--glass-border)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
            }}
          >
            {searchQuery.trim()
              ? `No operational cards match "${searchQuery.trim()}".`
              : 'All operational cards currently show 0. Type a card name in the search box above (e.g., TAT, PPM, AMC, Assets, Visitors, Resolution) to view it.'}
          </div>
        ) : filteredCards.map((card) => (
          <div
            key={card.id}
            style={{
              flex: '1 1 260px',
              maxWidth: '390px',
              minWidth: '260px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
>>>>>>> Stashed changes
            <KPICard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendDirection={kpi.trendDirection}
              trendLabel={kpi.trendLabel}
              status={kpi.status as "healthy" | "warning" | "critical" | undefined}
              breakdown={
                kpi.breakdown as
                | { label: string; value: number; status?: "healthy" | "warning" | "critical" | "neutral" }[]
                | undefined
              }
              onClick={() => openSlideOver(kpi.kpiType, null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
