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

  // Show skeleton while loading OR while refetching after a filter change
  if (isPending || isFetching || isError || !data) {
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
