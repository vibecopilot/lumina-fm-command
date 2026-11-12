import React from 'react';
import { LucideIcon, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Submetric {
  label: string;
  value: string | number;
  color?: string;
}

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  decimals?: number;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  trendText?: string;
  submetrics?: Submetric[];
  sparkline?: number[];
  accentColor?: string;
  icon?: LucideIcon;
  triggerKey?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  unit = '',
  decimals = 0,
  trend,
  trendType = 'neutral',
  trendText,
  submetrics = [],
  sparkline = [],
  accentColor = '#00C853',
  icon: Icon,
  triggerKey = 0,
  isActive = false,
  onClick,
}: KPICardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
  const formattedValue = decimals > 0 ? numValue.toFixed(decimals) : Math.round(numValue).toLocaleString();

  const isResolution = title.toLowerCase().includes('resolution');

  // Sparkline calculation
  const sparklineData = React.useMemo(() => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const pts = sparkline.map((val, idx) => ({
      x: (idx / (sparkline.length - 1)) * 88,
      y: 24 - ((val - min) / range) * 18 - 3,
      val,
    }));
    const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
    const lastPoint = pts[pts.length - 1];
    const polyPoints = `0,24 ${linePoints} 88,24`;
    return { linePoints, lastPoint, polyPoints };
  }, [sparkline]);

  const sparkGradId = `spark-grad-${accentColor.replace('#', '')}`;

  return (
    <div
      onClick={onClick}
      className={`glass-card glass-card-lift ${isActive ? 'kpi-card-active' : ''}`}
      style={{
        padding: '16px 16px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        borderRadius: '16px',
        border: isActive ? `1.5px solid ${accentColor}` : '1px solid var(--glass-border)',
        boxShadow: isActive ? `0 10px 30px -4px ${accentColor}35, 0 0 15px -2px ${accentColor}25` : undefined,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        height: '100%',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isActive ? '4px' : '3px',
          background: `linear-gradient(90deg, ${accentColor} 0%, rgba(255,255,255,0) 100%)`,
        }}
      />

      <div>
        {/* Header with Icon, Title, and Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {Icon && (
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  backgroundColor: `${accentColor}1A`,
                  border: `1px solid ${accentColor}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: accentColor,
                  flexShrink: 0,
                }}
              >
                <Icon size={14} strokeWidth={2.4} />
              </div>
            )}
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={title}
            >
              {title}
            </span>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        </div>

        {/* Big Metric Value */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            margin: '6px 0 6px 0',
          }}
        >
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formattedValue}
          </span>
          {unit && (
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Trend Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '12px',
          }}
        >
          {trendType === 'up' ? (
            <TrendingUp size={13} color="#00C853" strokeWidth={2.5} />
          ) : trendType === 'down' ? (
            <TrendingDown
              size={13}
              color={isResolution ? '#00C853' : '#F87171'}
              strokeWidth={2.5}
            />
          ) : (
            <Minus size={13} color="var(--text-muted)" strokeWidth={2.5} />
          )}

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color:
                trendType === 'up'
                  ? '#00C853'
                  : trendType === 'down'
                  ? isResolution
                    ? '#00C853'
                    : '#F87171'
                  : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {trendText || (trend != null ? `${trend > 0 ? '+' : ''}${trend}%` : 'On Target')}
          </span>
        </div>
      </div>

      {/* Sparkline & Submetrics Bottom Section */}
      <div>
        {sparklineData && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '10px',
              height: '22px',
            }}
          >
            <svg width={88} height={24} style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id={sparkGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon fill={`url(#${sparkGradId})`} points={sparklineData.polyPoints} />
              <polyline
                fill="none"
                stroke={accentColor}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData.linePoints}
              />
              <circle
                cx={sparklineData.lastPoint.x}
                cy={sparklineData.lastPoint.y}
                r="3"
                fill={accentColor}
                stroke="var(--bg-primary)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )}

        {submetrics && submetrics.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            {submetrics.map((s, idx) => {
              const dotColor =
                s.color === 'success'
                  ? '#00C853'
                  : s.color === 'warning'
                  ? '#FF9100'
                  : s.color === 'danger'
                  ? '#EF4444'
                  : s.color === 'primary'
                  ? '#00B0FF'
                  : 'var(--text-muted)';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.6875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                      {s.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default KPICard;