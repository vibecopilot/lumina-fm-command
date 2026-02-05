import { useDashboard } from '@/contexts/DashboardContext';
import { KPICard } from './KPICard';
import { kpiSummary } from '@/data/mockData';
import { 
  Ticket, 
  ClipboardCheck, 
  Wrench, 
  Users, 
  Building2, 
  Shield, 
  UserCheck, 
  Clock 
} from 'lucide-react';

export function ExecutiveKPIStrip() {
  const { openSlideOver, currentRole } = useDashboard();

  const kpis = [
    {
      title: 'Ticket SLA Health',
      value: kpiSummary.ticket_sla_health.value,
      trend: kpiSummary.ticket_sla_health.trend,
      trendDirection: kpiSummary.ticket_sla_health.trend_direction,
      trendLabel: 'vs last month',
      icon: Ticket,
      breakdown: [
        { label: 'Within SLA', value: kpiSummary.ticket_sla_health.within_sla, status: 'healthy' as const },
        { label: 'At Risk', value: kpiSummary.ticket_sla_health.at_risk, status: 'warning' as const },
        { label: 'Breached', value: kpiSummary.ticket_sla_health.breached, status: 'critical' as const },
      ],
    },
    {
      title: 'PPM Compliance',
      value: kpiSummary.ppm_compliance.value,
      trend: kpiSummary.ppm_compliance.trend,
      trendDirection: kpiSummary.ppm_compliance.trend_direction,
      trendLabel: 'vs last month',
      icon: ClipboardCheck,
      breakdown: [
        { label: 'Completed', value: kpiSummary.ppm_compliance.completed, status: 'healthy' as const },
        { label: 'Missed', value: kpiSummary.ppm_compliance.missed, status: 'critical' as const },
        { label: 'Overdue', value: kpiSummary.ppm_compliance.overdue, status: 'warning' as const },
      ],
    },
    {
      title: 'Asset Health',
      value: kpiSummary.asset_health.value,
      trend: kpiSummary.asset_health.trend,
      trendDirection: kpiSummary.asset_health.trend_direction,
      trendLabel: 'vs last month',
      icon: Wrench,
      breakdown: [
        { label: 'Operational', value: kpiSummary.asset_health.operational, status: 'healthy' as const },
        { label: 'Maintenance', value: kpiSummary.asset_health.maintenance, status: 'warning' as const },
        { label: 'Critical', value: kpiSummary.asset_health.critical, status: 'critical' as const },
      ],
    },
    {
      title: 'Workforce Availability',
      value: kpiSummary.workforce_availability.value,
      trend: kpiSummary.workforce_availability.trend,
      trendDirection: kpiSummary.workforce_availability.trend_direction,
      trendLabel: 'vs last month',
      icon: Users,
      breakdown: [
        { label: 'Present', value: kpiSummary.workforce_availability.present, status: 'healthy' as const },
        { label: 'Absent', value: kpiSummary.workforce_availability.absent, status: 'critical' as const },
        { label: 'On Leave', value: kpiSummary.workforce_availability.on_leave, status: 'neutral' as const },
      ],
    },
    {
      title: 'Vendor SLA',
      value: kpiSummary.vendor_sla.value,
      trend: kpiSummary.vendor_sla.trend,
      trendDirection: kpiSummary.vendor_sla.trend_direction,
      trendLabel: 'vs last month',
      icon: Building2,
      breakdown: [
        { label: 'Compliant', value: kpiSummary.vendor_sla.compliant, status: 'healthy' as const },
        { label: 'At Risk', value: kpiSummary.vendor_sla.at_risk, status: 'warning' as const },
        { label: 'Non-Compliant', value: kpiSummary.vendor_sla.non_compliant, status: 'critical' as const },
      ],
    },
    {
      title: 'Compliance Score',
      value: kpiSummary.compliance_score.value,
      trend: kpiSummary.compliance_score.trend,
      trendDirection: kpiSummary.compliance_score.trend_direction,
      trendLabel: 'vs last month',
      icon: Shield,
      breakdown: [
        { label: 'Compliant', value: kpiSummary.compliance_score.compliant, status: 'healthy' as const },
        { label: 'Non-Compliant', value: kpiSummary.compliance_score.non_compliant, status: 'critical' as const },
        { label: 'Pending', value: kpiSummary.compliance_score.pending, status: 'warning' as const },
      ],
    },
    {
      title: 'Visitors Today',
      value: kpiSummary.visitors_load.value,
      unit: '',
      trend: kpiSummary.visitors_load.trend,
      trendDirection: kpiSummary.visitors_load.trend_direction,
      trendLabel: 'vs yesterday',
      icon: UserCheck,
      status: 'neutral' as const,
      breakdown: [
        { label: 'Checked In', value: kpiSummary.visitors_load.checked_in, status: 'healthy' as const },
        { label: 'Checked Out', value: kpiSummary.visitors_load.checked_out, status: 'neutral' as const },
      ],
    },
    {
      title: 'Avg Resolution Time',
      value: kpiSummary.avg_resolution_time.value,
      unit: 'hrs',
      trend: kpiSummary.avg_resolution_time.trend,
      trendDirection: kpiSummary.avg_resolution_time.trend_direction,
      trendLabel: 'vs last month',
      icon: Clock,
      status: 'healthy' as const,
    },
  ];

  // Filter KPIs based on role
  const visibleKpis = currentRole === 'ops' 
    ? kpis.filter(k => !['Vendor SLA', 'Compliance Score'].includes(k.title))
    : kpis;

  return (
    <section className="py-6 border-b bg-muted/20">
      <div className="container">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {visibleKpis.map((kpi, idx) => (
            <KPICard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendDirection={kpi.trendDirection}
              trendLabel={kpi.trendLabel}
              status={kpi.status as 'healthy' | 'warning' | 'critical' | undefined}
              breakdown={kpi.breakdown as { label: string; value: number; status?: 'healthy' | 'warning' | 'critical' | 'neutral' }[] | undefined}
              onClick={() => openSlideOver('site', null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}