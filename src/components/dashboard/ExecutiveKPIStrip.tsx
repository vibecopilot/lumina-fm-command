import { useDashboard } from "@/contexts/DashboardContext";
import { KPICard } from "./KPICard";
import { useDashboardKPIs } from "@/hooks/useGroupedDashboard";
import { SlideOverType } from "@/contexts/DashboardContext";
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
import { useState, useEffect } from "react";

export function ExecutiveKPIStrip() {
  const { openSlideOver, currentRole, filters } = useDashboard();
  const { data, isPending, isError, dataUpdatedAt } = useDashboardKPIs(filters);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  if (isPending || isError || !data?.ticket_sla_health) {
    return (
      <section className="py-4 sm:py-6 border-b bg-muted/20">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Loading KPIs…</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
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
      title: "Ticket SLA Health",
      value: data.ticket_sla_health.summary.percentage,
      trend: data.ticket_sla_health.summary.vs_last_period || 0,
      trendDirection: (data.ticket_sla_health?.summary.vs_last_period >= 0
        ? "up"
        : "down") as "up" | "down",
      trendLabel: "vs last period",
      icon: Ticket,
      kpiType: "kpi_ticket_sla" as SlideOverType,
      breakdown: [
        {
          label: "Within SLA",
          value: data.ticket_sla_health.summary.within_sla,
          status: "healthy",
        },
        {
          label: "At Risk",
          value: data.ticket_sla_health.summary.at_risk,
          status: "warning",
        },
        {
          label: "Breached",
          value: data.ticket_sla_health.summary.breached,
          status: "critical",
        },
      ],
    },
    {
      title: "PPM Compliance",
      value: data.ppm_compliance.summary.percentage,
      trend: data.ppm_compliance.summary.vs_last_period || 0,
      trendDirection: (data.ppm_compliance.vs_last_period >= 0
        ? "up"
        : "down") as "up" | "down",
      trendLabel: "vs last period",
      icon: ClipboardCheck,
      kpiType: "kpi_ppm" as SlideOverType,
      breakdown: [
        {
          label: "Completed",
          value: data.ppm_compliance.summary.completed,
          status: "healthy",
        },
        {
          label: "Missed",
          value: data.ppm_compliance.summary.missed,
          status: "critical",
        },
        {
          label: "Overdue",
          value: data.ppm_compliance.summary.overdue,
          status: "warning",
        },
      ],
    },
    {
      title: "Asset Health",
      value: data.asset_health.summary.percentage,
      trend: data.asset_health.summary.vs_last_period,
      trendDirection: (data.asset_health.summary.vs_last_period >= 0
        ? "up"
        : "down") as "up" | "down",
      trendLabel: "vs last period",
      icon: Wrench,
      kpiType: "kpi_asset" as SlideOverType,
      breakdown: [
        {
          label: "Operational",
          value: data.asset_health.summary.operational,
          status: "healthy" as const,
        },
        {
          label: "Maintenance",
          value: data.asset_health.summary.maintenance,
          status: "warning" as const,
        },
        {
          label: "Critical",
          value: data.asset_health.summary.critical,
          status: "critical" as const,
        },
      ],
    },
    {
      title: "Workforce Availability",
      value: data.workforce_availability?.summary.percentage,
      trend: data.workforce_availability?.summary.vs_yesterday,
      trendDirection: (data.workforce_availability?.summary.vs_yesterday >= 0
        ? "up"
        : "down") as "up" | "down",
      trendLabel: "vs yesterday",
      icon: Users,
      kpiType: "kpi_workforce" as SlideOverType,
      breakdown: [
        {
          label: "Present",
          value: data.workforce_availability?.summary.present,
          status: "healthy" as const,
        },
        {
          label: "Absent",
          value: data.workforce_availability?.summary.absent,
          status: "critical" as const,
        },
      ],
    },
    {
      title: "Vendor SLA",
      value: data.vendor_sla.summary.percentage,
      trend: 0,
      trendDirection: "up" as const,
      trendLabel: "",
      icon: Building2,
      kpiType: "kpi_vendor_sla" as SlideOverType,
      breakdown: [
        {
          label: "Compliant",
          value: data.vendor_sla.summary.compliant,
          status: "healthy" as const,
        },
        {
          label: "At Risk",
          value: data.vendor_sla.summary.at_risk,
          status: "warning" as const,
        },
        {
          label: "Non-Compliant",
          value: data.vendor_sla.summary.non_compliant,
          status: "critical" as const,
        },
      ],
    },
    {
      title: "Visitors Today",
      value: data.visitors_today.summary.currently_inside,
      unit: "",
      trend: data.visitors_today.summary.vs_yesterday,
      trendDirection: (data.visitors_today.summary.vs_yesterday >= 0
        ? "up"
        : "down") as "up" | "down",
      trendLabel: "vs yesterday",
      icon: UserCheck,
      kpiType: "kpi_visitors" as SlideOverType,
      status: "neutral" as const,
      breakdown: [
        {
          label: "Checked In",
          value: data.visitors_today.summary.checked_in,
          status: "healthy" as const,
        },
        {
          label: "Checked Out",
          value: data.visitors_today.summary.checked_out,
          status: "neutral" as const,
        },
      ],
    },
    {
      title: "Avg Resolution Time",
      value: data.avg_resolution_time.summary.hours,
      unit: "hrs",
      trend: data.avg_resolution_time.summary.vs_last_period,
      trendDirection: (data.avg_resolution_time.summary.vs_last_period <= 0
        ? "down"
        : "up") as "up" | "down",
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Executive KPIs</span>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                · Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Responsive grid: 2 cols mobile → 4 cols tablet → 8 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
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
