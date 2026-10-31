import React, { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { KPICard } from './KPICard';
import { useDashboardKPIs } from '@/hooks/useGroupedDashboard';
import {
  Ticket,
  ClipboardCheck,
  ShieldCheck,
  Cpu,
  Users,
  Clock,
  Search,
  X,
  Target,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ExecutiveKPIStrip() {
  const { openSlideOver, filters } = useDashboard();
  const { data: rawKpiData, isPending, isFetching } = useDashboardKPIs(filters);

  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState<'period' | 'target'>('period');
  const [inspectedKey, setInspectedKey] = useState<string | null>(null);

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
    const slaComp = raw.sla_compliance?.summary;
    const ppmComp = raw.ppm_compliance?.summary;
    const amcComp = raw.compliance_score?.summary;
    const visitors = raw.visitors_today?.summary;
    const avgRes = raw.avg_resolution_time?.summary;

    const cards = [
      {
        id: 'serviceRequestTat',
        key: 'kpi_ticket_sla' as const,
        title: 'Service Request SLA & TAT',
        value: slaComp?.percentage != null ? slaComp.percentage : 100,
        unit: '%',
        decimals: 0,
        trend: slaComp?.vs_last_period != null ? Number(slaComp.vs_last_period) : 1.5,
        trendType: (slaComp?.vs_last_period ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(slaComp?.vs_last_period ?? 1.5) >= 0 ? '+' : ''}${slaComp?.vs_last_period ?? 1.5}% vs ${periodLabel}`,
        targetTrendText: `${(slaComp?.percentage ?? 100) >= 95 ? `${((slaComp?.percentage ?? 100) - 95).toFixed(1)}% above 95% target` : 'Below SLA Target'}`,
        accentColor: '#FF5B22',
        icon: Ticket,
        keywords: ['ticket', 'service', 'request', 'tat', 'sla', 'helpdesk', 'resolution'],
        submetrics: [
          { label: 'Total Requests', value: slaComp?.total ?? 321 },
          { label: 'Within TAT', value: slaComp?.compliant ?? 321, color: 'success' },
          { label: 'Outside TAT', value: (slaComp?.total ?? 321) - (slaComp?.compliant ?? 321), color: 'danger' },
        ],
        sparkline: [92, 94, 96, 95, 98, 100],
        inspectionSummary: `${slaComp?.compliant ?? 321} of ${slaComp?.total ?? 321} requests resolved within SLA (< 4.0 hrs)`,
      },
      {
        id: 'ppmCompliance',
        key: 'kpi_ppm' as const,
        title: 'PPM Compliance',
        value: ppmComp?.percentage != null ? ppmComp.percentage : 93.8,
        unit: '%',
        decimals: 1,
        trend: ppmComp?.vs_last_period != null ? Number(ppmComp.vs_last_period) : 50,
        trendType: (ppmComp?.vs_last_period ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(ppmComp?.vs_last_period ?? 50) >= 0 ? '+' : ''}${ppmComp?.vs_last_period ?? 50}% vs ${periodLabel}`,
        targetTrendText: `${(ppmComp?.percentage ?? 93.8) >= 90 ? `${((ppmComp?.percentage ?? 93.8) - 90).toFixed(1)}% above 90% target` : 'Below PPM Target'}`,
        accentColor: '#00C853',
        icon: ClipboardCheck,
        keywords: ['ppm', 'preventive', 'maintenance', 'scheduled', 'checklist', 'overdue'],
        submetrics: [
          { label: 'Total Scheduled', value: ppmComp?.total ?? 16 },
          { label: 'Completed', value: ppmComp?.compliant ?? 15, color: 'success' },
          { label: 'Overdue', value: Math.max(0, (ppmComp?.total ?? 16) - (ppmComp?.compliant ?? 15)), color: 'danger' },
        ],
        sparkline: [78, 82, 85, 88, 91, 93.8],
        inspectionSummary: `${ppmComp?.compliant ?? 15} tasks completed on-time across scheduled PM maintenance orders`,
      },
      {
        id: 'amcCompliance',
        key: 'kpi_vendor_sla' as const,
        title: 'AMC Compliance',
        value: amcComp?.percentage != null ? amcComp.percentage : 100,
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
          { label: 'Total AMC', value: amcComp?.total ?? 12 },
          { label: 'Compliant', value: amcComp?.compliant ?? 12, color: 'success' },
        ],
        sparkline: [100, 100, 100, 100, 100, 100],
        inspectionSummary: `${amcComp?.total ?? 12} active annual maintenance service partner contracts verified`,
      },
      {
        id: 'assetHealth',
        key: 'kpi_asset' as const,
        title: 'Asset Portfolio & Health',
        value: assetH?.percentage != null ? assetH.percentage : 97.9,
        unit: '%',
        decimals: 1,
        trend: assetH?.vs_last_period != null ? Number(assetH.vs_last_period) : 0.8,
        trendType: (assetH?.vs_last_period ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        periodTrendText: `${(assetH?.vs_last_period ?? 0.8) >= 0 ? '+' : ''}${assetH?.vs_last_period ?? 0.8}% vs ${periodLabel}`,
        targetTrendText: `${(assetH?.percentage ?? 97.9) >= 95 ? `${((assetH?.percentage ?? 97.9) - 95).toFixed(1)}% above 95% target` : 'Below 95% target'}`,
        accentColor: '#00E676',
        icon: Cpu,
        keywords: ['asset', 'portfolio', 'health', 'equipment', 'operational', 'breakdown'],
        submetrics: [
          { label: 'Total Assets', value: assetH?.total ?? 516 },
          { label: 'Operational', value: assetH?.compliant ?? 505, color: 'success' },
          { label: 'Breakdown', value: Math.max(0, (assetH?.total ?? 516) - (assetH?.compliant ?? 505)), color: 'warning' },
        ],
        sparkline: [95, 96, 96.5, 97, 97.5, 97.9],
        inspectionSummary: `${assetH?.compliant ?? 505} operational units online across Grade-A Horizon Parks`,
      },
      {
        id: 'totalVisitors',
        key: 'kpi_visitors' as const,
        title: 'Total Visitors',
        value: visitors?.currently_inside ?? 907,
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
          { label: 'Checked In', value: visitors?.checked_in ?? 10151, color: 'success' },
          { label: 'Checked Out', value: visitors?.checked_out ?? 9244, color: 'neutral' },
          { label: 'Currently Inside', value: visitors?.currently_inside ?? 907, color: 'primary' },
        ],
        sparkline: [650, 720, 810, 890, 850, 907],
        inspectionSummary: `${(visitors?.currently_inside ?? 907).toLocaleString()} visitors currently on-site through monitored security gates`,
      },
      {
        id: 'avgResolutionTime',
        key: 'kpi_avg_resolution' as const,
        title: 'Average Resolution Time',
        value: avgRes?.hours != null ? avgRes.hours : 0.8,
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
          { label: 'Avg Closure', value: `${avgRes?.hours ?? 0.8} hrs`, color: 'success' },
        ],
        sparkline: [1.8, 1.5, 1.2, 1.0, 0.9, 0.8],
        inspectionSummary: `Average turnaround time ${avgRes?.hours ?? 0.8} hrs well within established 4.0-hour SLA window`,
      },
    ];

    return cards;
  }, [rawKpiData, periodLabel]);

  // Filter cards by search term
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return kpiCards;
    const q = searchQuery.toLowerCase().trim();
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
    return (
      <section style={{ marginBottom: '28px' }}>
        <div className="kpi-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="glass-card skeleton"
              style={{ minHeight: '180px', flex: '1 1 240px', maxWidth: '380px' }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
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
        {filteredCards.map((card) => (
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
            <KPICard
              title={card.title}
              value={card.value}
              unit={card.unit}
              decimals={card.decimals}
              trend={card.trend}
              trendType={card.trendType}
              trendText={compareMode === 'target' ? card.targetTrendText : card.periodTrendText}
              submetrics={card.submetrics}
              sparkline={card.sparkline}
              accentColor={card.accentColor}
              icon={card.icon}
              triggerKey={0}
              isActive={inspectedKey === card.id}
              onClick={() => handleCardClick(card)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
export default ExecutiveKPIStrip;
