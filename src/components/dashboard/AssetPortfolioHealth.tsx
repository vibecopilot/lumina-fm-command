import React, { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAssetPortfolio } from '@/hooks/useGroupedDashboard';
import { ThemeChartTooltip } from './DrillDownPanels';
import {
  Wrench,
  ChevronRight,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart2,
  PieChart as PieIcon,
} from 'lucide-react';
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

type ChartType = 'Donut' | 'Pie' | 'Vertical Bar' | 'Horizontal Bar' | 'Line' | 'Area' | 'Radar';

const CATEGORY_PALETTE = ['#00C853', '#3B82F6', '#FF9100', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'];
const STATUS_CHART_TYPES: ChartType[] = ['Donut', 'Pie', 'Vertical Bar', 'Horizontal Bar'];
const CATEGORY_CHART_TYPES: ChartType[] = ['Pie', 'Donut', 'Vertical Bar', 'Horizontal Bar', 'Radar', 'Line', 'Area'];

export function AssetPortfolioHealth() {
  const { filters, openSlideOver } = useDashboard();
  const { data: rawData, isPending } = useAssetPortfolio(filters);

  const [statusChartType, setStatusChartType] = useState<ChartType>('Donut');
  const [categoryChartType, setCategoryChartType] = useState<ChartType>('Horizontal Bar');
  const [categoryTopN, setCategoryTopN] = useState<'Top 5' | 'All'>('Top 5');

  const summary = useMemo(() => {
    const raw = (rawData?.summary || {}) as Record<string, any>;
    const total = Number(raw.total ?? 0);
    const operational = Number(raw.operational ?? 0);
    const maintenance = Number(raw.maintenance ?? 0);
    const critical = Number(raw.critical ?? 0);
    const health_percentage = Number(raw.health_percentage ?? (total > 0 ? (operational / total) * 100 : 0));
    return { total, operational, maintenance, critical, health_percentage };
  }, [rawData]);

  const categories = useMemo(() => {
    const list = rawData?.category_breakdown || [];

    return [...list]
      .map((c) => ({
      name: c.category || 'Equipment',
      total: Number(c.total || 0),
      operational: Number(c.operational || 0),
      score: Number(c.health_percentage ?? 100),
      color: Number(c.health_percentage ?? 100) >= 95 ? '#00E676' : '#FF9100',
    }))
      .sort((a, b) => b.total - a.total);
  }, [rawData]);

  const displayedCategories = useMemo(() => {
    if (categoryTopN === 'Top 5') return categories.slice(0, 5);
    return categories;
  }, [categories, categoryTopN]);

  const statusDistribution = useMemo(
    () => [
      { name: 'Operational', value: summary.operational, color: '#00C853' },
      { name: 'BreakDown', value: summary.maintenance, color: '#FF9100' },
      { name: 'Critical', value: summary.critical, color: '#EF4444' },
    ],
    [summary]
  );

  const handleDrill = (tab?: 'ALL' | 'OPERATIONAL' | 'BREAKDOWN', categoryName?: string) => {
    const status = tab === 'OPERATIONAL' ? 'operational' : tab === 'BREAKDOWN' ? 'maintenance' : undefined;
    openSlideOver('drill_asset', {
      category: categoryName,
      status,
      type: categoryName ? 'category' : status ? 'status' : 'all',
      value: categoryName || status || 'all',
      title: 'Asset Portfolio & Health Telemetry',
      tab: tab || 'ALL',
      summary,
      categories,
    });
  };

  return (
    <section id="assets-section" style={{ marginBottom: '32px' }} className="animate-fade-in stagger-3">
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 230, 118, 0.15)',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00E676',
            }}
          >
            <Cpu size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Asset Portfolio & Health
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                margin: '2px 0 0 0',
              }}
            >
              {summary.total.toLocaleString()} total units across Grade-A Horizon Parks •{' '}
              <strong style={{ color: '#00E676' }}>{summary.health_percentage}% Operational</strong>
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleDrill('OPERATIONAL')}
            className="filter-pill-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 200, 83, 0.3)',
              backgroundColor: 'rgba(0, 200, 83, 0.1)',
              color: '#00E676',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={13} />
            <span>{summary.operational} Operational</span>
          </button>

          <button
            type="button"
            onClick={() => handleDrill('BREAKDOWN')}
            className="filter-pill-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 145, 0, 0.3)',
              backgroundColor: 'rgba(255, 145, 0, 0.1)',
              color: '#FF9100',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={13} />
            <span>{summary.maintenance} Breakdown</span>
          </button>

          {summary.critical > 0 && (
            <button
              type="button"
              onClick={() => handleDrill('BREAKDOWN')}
              className="filter-pill-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Flame size={13} />
              <span>{summary.critical} Critical</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Column Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Card 1: Status Distribution */}
        <div
          className="glass-card glass-card-lift"
          onClick={() => handleDrill('ALL')}
          title="Click to open Asset Portfolio & Health drill-down"
          style={{
            padding: '20px 22px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '360px',
            cursor: 'pointer',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                }}
              >
                STATUS DISTRIBUTION
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Equipment Reliability Ratio
              </div>
            </div>

            {/* Chart Type Selector */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {STATUS_CHART_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStatusChartType(t)}
                  style={{
                    padding: '3px 7px',
                    fontSize: '0.625rem',
                    fontWeight: statusChartType === t ? 700 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: statusChartType === t ? '#00C853' : 'transparent',
                    color: statusChartType === t ? '#0B0F19' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Graphic */}
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              {statusChartType === 'Donut' || statusChartType === 'Pie' ? (
                <PieChart key={`status-${statusChartType}-${summary.total}`}>
                  <Tooltip content={<ThemeChartTooltip />} />
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={statusChartType === 'Donut' ? 42 : 0}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                    labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 1 }}
                    label={({ cx, cy, midAngle, outerRadius, name, percent }) => {
                      if (!percent || percent <= 0.002) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 15;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="var(--text-main)"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={10}
                          fontWeight={700}
                        >
                          {`${name} (${(percent * 100).toFixed(1)}%)`}
                        </text>
                      );
                    }}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              ) : statusChartType === 'Horizontal Bar' ? (
                <BarChart data={statusDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={80} />
                  <Tooltip content={<ThemeChartTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={statusDistribution} margin={{ top: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip content={<ThemeChartTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>

            {statusChartType === 'Donut' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {summary.total}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Units
                </span>
              </div>
            )}
          </div>

          {/* Bottom Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              paddingTop: '12px',
              borderTop: '1px solid var(--glass-border)',
              fontSize: '0.75rem',
            }}
          >
            {statusDistribution.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: s.color,
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>{s.name}:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Category Health & Distribution */}
        <div
          className="glass-card glass-card-lift"
          onClick={() => handleDrill('ALL')}
          title="Click to open Asset Portfolio & Health breakdown drill-down"
          style={{
            padding: '20px 22px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '360px',
            cursor: 'pointer',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                }}
              >
                CATEGORY COMPLIANCE
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Equipment Category Distribution
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
              {/* Chart type selector */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {CATEGORY_CHART_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCategoryChartType(t)}
                    style={{
                      padding: '3px 6px',
                      fontSize: '0.625rem',
                      fontWeight: categoryChartType === t ? 700 : 500,
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: categoryChartType === t ? '#00C853' : 'transparent',
                      color: categoryChartType === t ? '#0B0F19' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Top N selector */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(148, 163, 184, 0.12)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {(['Top 5', 'All'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCategoryTopN(opt)}
                    style={{
                      padding: '3px 7px',
                      fontSize: '0.625rem',
                      fontWeight: categoryTopN === opt ? 700 : 500,
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: categoryTopN === opt ? '#00C853' : 'transparent',
                      color: categoryTopN === opt ? '#0B0F19' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {opt === 'All' ? `All (${categories.length})` : 'Top 5'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div style={{ height: '220px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            {displayedCategories.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No category data available
              </div>
            ) : categoryChartType === 'Horizontal Bar' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '220px' }}>
                {displayedCategories.map((c) => (
                  <div
                    key={c.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrill(undefined, c.name);
                    }}
                    title={`Click to drill down ${c.name} assets`}
                    style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</span>
                      <span style={{ fontWeight: 700, color: '#00C853' }}>
                        {c.operational}/{c.total} ({c.score}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        width: '100%',
                        borderRadius: '999px',
                        backgroundColor: 'var(--border-color, rgba(148, 163, 184, 0.25))',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${c.score}%`,
                          backgroundColor: '#00C853',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : categoryChartType === 'Pie' || categoryChartType === 'Donut' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '8px', height: '220px', alignItems: 'center' }}>
                <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart key={`cat-${categoryChartType}-${categoryTopN}-${displayedCategories.length}`}>
                      <Tooltip content={<ThemeChartTooltip />} />
                      <Pie
                        data={displayedCategories}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={categoryChartType === 'Donut' ? 40 : 0}
                        outerRadius={66}
                        paddingAngle={2}
                        isAnimationActive={false}
                        cursor="pointer"
                        labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 1 }}
                        label={({ cx, cy, midAngle, outerRadius, percent }) => {
                          if (!percent || percent < 0.04) return null;
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 12;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="var(--text-main)"
                              textAnchor={x > cx ? 'start' : 'end'}
                              dominantBaseline="central"
                              fontSize={10}
                              fontWeight={700}
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        onClick={(d: any) => {
                          const cat = d?.name || d?.payload?.name;
                          if (cat) handleDrill(undefined, cat);
                        }}
                      >
                        {displayedCategories.map((_, idx) => (
                          <Cell key={`cat-pie-${idx}`} fill={CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {categoryChartType === 'Donut' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)' }}>
                        {displayedCategories.reduce((acc, c) => acc + c.total, 0)}
                      </span>
                      <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Units
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Legend with Name, Count & Share % */}
                <div style={{ maxHeight: '215px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', paddingRight: '2px' }}>
                  {(() => {
                    const totalSum = displayedCategories.reduce((acc, c) => acc + c.total, 0);
                    return displayedCategories.map((c, idx) => {
                      const share = totalSum > 0 ? ((c.total / totalSum) * 100).toFixed(1) : '0.0';
                      const dotColor = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleDrill(undefined, c.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid var(--glass-border)',
                            backgroundColor: 'var(--table-even-bg)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                          }}
                          title={`${c.name}: ${c.total} units (${share}%)`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.name}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'monospace' }}>
                            {c.total} ({share}%)
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : categoryChartType === 'Line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`cat-line-${categoryTopN}-${displayedCategories.length}`} data={displayedCategories} margin={{ top: 10, right: 15, left: -15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                  <Tooltip content={<ThemeChartTooltip />} />
                  <Line type="monotone" dataKey="total" name="Total Units" stroke="#3B82F6" strokeWidth={2.2} dot={{ r: 3.5 }} />
                  <Line type="monotone" dataKey="operational" name="Operational" stroke="#00C853" strokeWidth={2.2} dot={{ r: 3.5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : categoryChartType === 'Area' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={`cat-area-${categoryTopN}-${displayedCategories.length}`} data={displayedCategories} margin={{ top: 10, right: 15, left: -15, bottom: 10 }}>
                  <defs>
                    <linearGradient id="assetCatTotalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="assetCatOpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C853" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00C853" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                  <Tooltip content={<ThemeChartTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total Units" stroke="#3B82F6" strokeWidth={2} fill="url(#assetCatTotalGrad)" />
                  <Area type="monotone" dataKey="operational" name="Operational" stroke="#00C853" strokeWidth={2} fill="url(#assetCatOpGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : categoryChartType === 'Radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart key={`cat-radar-${categoryTopN}-${displayedCategories.length}`} data={displayedCategories}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                  <PolarRadiusAxis stroke="var(--text-muted)" fontSize={9} />
                  <Radar name="Health" dataKey="score" stroke="#00C853" fill="#00C853" fillOpacity={0.3} />
                  <Tooltip content={<ThemeChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key={`cat-bar-${categoryTopN}-${displayedCategories.length}`} data={displayedCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                  <Tooltip content={<ThemeChartTooltip />} />
                  <Bar
                    dataKey="total"
                    fill="#3B82F6"
                    name="Total Units"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(d: any) => {
                      const cat = d?.name || d?.payload?.name;
                      if (cat) handleDrill(undefined, cat);
                    }}
                  />
                  <Bar
                    dataKey="operational"
                    fill="#00C853"
                    name="Operational"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(d: any) => {
                      const cat = d?.name || d?.payload?.name;
                      if (cat) handleDrill(undefined, cat);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>Cycle: Monthly Operational Audit</span>
            <span style={{ color: '#00E676', fontWeight: 700 }}>
              {categories.filter((c) => c.score === 100).length}/{categories.length} Categories 100% Compliant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
export default AssetPortfolioHealth;