import { useState, useRef, useEffect, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useWorkforce } from '@/hooks/useGroupedDashboard';
import {
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  Check,
  Building2,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
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
} from 'recharts';
import { useDashboardFilterOptions } from '@/hooks/useDashboardFilterOptions';

type ChartType =
  | 'Donut'
  | 'Area'
  | 'Line'
  | 'Horizontal Bar'
  | 'Vertical Bar'
  | 'Radar';

const CHART_TYPES: ChartType[] = [
  'Donut',
  'Area',
  'Line',
  'Horizontal Bar',
  'Vertical Bar',
  'Radar',
];

const TOP_N_OPTIONS = ['Top 5', 'Top 10', 'All'] as const;
type TopNOption = (typeof TOP_N_OPTIONS)[number];

const ROLE_COLORS = [
  '#FF5B22',
  '#F97316',
  '#FB923C',
  '#F59E0B',
  '#EA580C',
  '#C2410C',
  '#FF7A45',
  '#059669',
  '#FF8A00',
  '#475569',
  '#D97706',
  '#FFA000',
];

export function WorkforceTracking() {
  const { openSlideOver, filters, updateFilter } = useDashboard();
  const { data, isPending: isLoading } = useWorkforce(filters);
  const { sites } = useDashboardFilterOptions(filters);

  const [vendorChartType, setVendorChartType] = useState<ChartType>('Donut');
  const [roleChartType, setRoleChartType] = useState<ChartType>('Area');
  const [roleTopN, setRoleTopN] = useState<TopNOption>('Top 5');

  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [roleChartDropdownOpen, setRoleChartDropdownOpen] = useState(false);
  const [roleTopNDropdownOpen, setRoleTopNDropdownOpen] = useState(false);
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);

  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const roleChartDropdownRef = useRef<HTMLDivElement>(null);
  const roleTopNDropdownRef = useRef<HTMLDivElement>(null);
  const siteDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(e.target as Node)) {
        setVendorDropdownOpen(false);
      }
      if (roleChartDropdownRef.current && !roleChartDropdownRef.current.contains(e.target as Node)) {
        setRoleChartDropdownOpen(false);
      }
      if (roleTopNDropdownRef.current && !roleTopNDropdownRef.current.contains(e.target as Node)) {
        setRoleTopNDropdownOpen(false);
      }
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(e.target as Node)) {
        setSiteDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const summary = data?.summary;
  const totalEmployees = summary?.total ?? 0;
  const present = summary?.present ?? 0;
  const absent = summary?.absent ?? 0;
  const overallAvailability = Number(
    summary?.availability_percentage ?? (totalEmployees > 0 ? (present / totalEmployees) * 100 : 0)
  );

  const vendors = useMemo(() => {
    return (data?.by_vendor ?? []).map((v) => ({
      name: v.vendor,
      present: Number(v.present || 0),
      absent: Number(v.absent || 0),
      total: Number(v.total || (v.present || 0) + (v.absent || 0)),
    }));
  }, [data?.by_vendor]);

  const rawWorkTypes = useMemo(() => {
    return (data?.by_work_type ?? []).map((w, idx) => ({
      type: w.work_type,
      count: Number(w.count || 0),
      color: ROLE_COLORS[idx % ROLE_COLORS.length],
    })).sort((a, b) => b.count - a.count);
  }, [data?.by_work_type]);

  const displayedWorkTypes = useMemo(() => {
    if (roleTopN === 'Top 5') return rawWorkTypes.slice(0, 5);
    if (roleTopN === 'Top 10') return rawWorkTypes.slice(0, 10);
    return rawWorkTypes;
  }, [rawWorkTypes, roleTopN]);

  const selectedSiteObj = sites.find((s) => s.id === filters.site_id);
  const selectedSiteName = selectedSiteObj?.name || 'All Sites';

  const isLowAvailability = overallAvailability < 50;

  return (
    <section id="workforce-section" style={{ marginBottom: '40px' }} className="animate-fade-in stagger-6">
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
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6',
            }}
          >
            <Users size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Workforce Tracking
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                margin: '2px 0 0 0',
              }}
            >
              {totalEmployees.toLocaleString()} employees deployed across {selectedSiteName}
            </p>
          </div>
        </div>

        {/* Site Pill Dropdown */}
        <div ref={siteDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{selectedSiteName}</span>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-muted)',
                transform: siteDropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>
          {siteDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                width: '200px',
                maxHeight: '260px',
                overflowY: 'auto',
                backgroundColor: 'var(--dropdown-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-elevation)',
                zIndex: 60,
                padding: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  updateFilter('site_id', null);
                  setSiteDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: !filters.site_id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: !filters.site_id ? '#3B82F6' : 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: !filters.site_id ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                All Sites
              </button>
              {sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => {
                    updateFilter('site_id', site.id);
                    setSiteDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: filters.site_id === site.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: filters.site_id === site.id ? '#3B82F6' : 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: filters.site_id === site.id ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {site.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Column 1: Availability Meters & Counts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          {/* Overall Availability Card */}
          <div
            onClick={() => openSlideOver('kpi_workforce')}
            className="glass-card glass-card-lift"
            style={{
              padding: '20px 22px',
              borderRadius: '12px',
              flex: '1.2 1 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Click to inspect workforce availability"
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>
              Overall Availability
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: isLowAvailability ? '#EF4444' : '#00E676',
                lineHeight: 1,
                marginBottom: '14px',
              }}
            >
              {overallAvailability.toFixed(1)}%
            </div>
            <div
              style={{
                height: '7px',
                width: '100%',
                backgroundColor: 'var(--border-color)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(Math.max(overallAvailability, 0), 100)}%`,
                  backgroundColor: isLowAvailability ? '#EF4444' : '#00E676',
                  borderRadius: '4px',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>

          {/* Present vs Absent Mini Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: '1 1 0' }}>
            {/* Present */}
            <div
              onClick={() => openSlideOver('drill_workforce', { attendance: 'present' } as never)}
              className="glass-card glass-card-lift"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Click to inspect present personnel"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                <UserCheck size={16} />
                <span>Present</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {present.toLocaleString()}
              </div>
            </div>

            {/* Absent */}
            <div
              onClick={() => openSlideOver('drill_workforce', { attendance: 'absent' } as never)}
              className="glass-card glass-card-lift"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Click to inspect absent personnel"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                <UserX size={16} />
                <span>Absent</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {absent.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Total Workforce Box */}
          <div
            onClick={() => openSlideOver('drill_workforce', {} as never)}
            className="glass-card glass-card-lift"
            style={{
              borderRadius: '10px',
              padding: '16px 20px',
              flex: '1 1 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Click to inspect all staff records"
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '6px' }}>
              Total Workforce
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {totalEmployees.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Column 2: Attendance by Vendor */}
        <div
          className="glass-card glass-card-lift"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Attendance by Vendor
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Headcount distribution by facility contractor.
                </p>
              </div>

              {/* Vendor Chart Switcher */}
              <div ref={vendorDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>{vendorChartType}</span>
                  <ChevronDown size={12} />
                </button>
                {vendorDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      width: '120px',
                      backgroundColor: 'var(--dropdown-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      boxShadow: 'var(--shadow-elevation)',
                      zIndex: 60,
                      padding: '4px',
                    }}
                  >
                    {CHART_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setVendorChartType(type);
                          setVendorDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: vendorChartType === type ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          color: vendorChartType === type ? '#3B82F6' : 'var(--text-primary)',
                          fontSize: '0.75rem',
                          fontWeight: vendorChartType === type ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Chart */}
            <div style={{ height: '220px', width: '100%' }}>
              {vendors.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No vendor attendance data
                </div>
              ) : vendorChartType === 'Donut' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Pie
                      data={vendors}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      cursor="pointer"
                      onClick={(d) => openSlideOver('drill_workforce', { vendor: d?.name } as never)}
                    >
                      {vendors.map((_, idx) => (
                        <Cell key={`vendor-cell-${idx}`} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : vendorChartType === 'Horizontal Bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendors} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" fontSize={10} stroke="var(--text-muted)" width={85} tickFormatter={(val) => (val?.length > 12 ? `${val.substring(0, 11)}…` : val)} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="present" name="Present" fill="#10B981" radius={[0, 3, 3, 0]} barSize={12} />
                    <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[0, 3, 3, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              ) : vendorChartType === 'Vertical Bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendors} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" fontSize={9} stroke="var(--text-muted)" angle={-25} textAnchor="end" interval={0} tickFormatter={(val) => (val?.length > 10 ? `${val.substring(0, 9)}…` : val)} />
                    <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="present" name="Present" fill="#10B981" radius={[3, 3, 0, 0]} barSize={14} />
                    <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[3, 3, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              ) : vendorChartType === 'Line' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vendors} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" fontSize={9} stroke="var(--text-muted)" angle={-25} textAnchor="end" interval={0} />
                    <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : vendorChartType === 'Area' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vendors} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" fontSize={9} stroke="var(--text-muted)" angle={-25} textAnchor="end" interval={0} />
                    <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={vendors} cx="50%" cy="50%" outerRadius={70}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="name" fontSize={9} stroke="var(--text-muted)" />
                    <PolarRadiusAxis fontSize={9} stroke="var(--text-muted)" />
                    <Radar name="Present" dataKey="present" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                    <Radar name="Absent" dataKey="absent" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span>Showing {vendors.length} Vendors</span>
            <span style={{ color: '#3B82F6', fontWeight: 700 }}>Click to inspect vendor</span>
          </div>
        </div>

        {/* Column 3: Workforce by Work Type / Role */}
        <div
          className="glass-card glass-card-lift"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Workforce by Work Type
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Distribution of personnel by functional operational role.
                </p>
              </div>

              {/* Chart Switcher & Top N */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Role Chart Switcher */}
                <div ref={roleChartDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setRoleChartDropdownOpen(!roleChartDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      backgroundColor: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{roleChartType}</span>
                    <ChevronDown size={12} />
                  </button>
                  {roleChartDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        right: 0,
                        width: '120px',
                        backgroundColor: 'var(--dropdown-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        boxShadow: 'var(--shadow-elevation)',
                        zIndex: 60,
                        padding: '4px',
                      }}
                    >
                      {CHART_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setRoleChartType(type);
                            setRoleChartDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: roleChartType === type ? 'rgba(255, 91, 34, 0.15)' : 'transparent',
                            color: roleChartType === type ? '#FF7A45' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: roleChartType === type ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top N Dropdown */}
                <div ref={roleTopNDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setRoleTopNDropdownOpen(!roleTopNDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      backgroundColor: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{roleTopN}</span>
                    <ChevronDown size={12} />
                  </button>
                  {roleTopNDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        right: 0,
                        width: '100px',
                        backgroundColor: 'var(--dropdown-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        boxShadow: 'var(--shadow-elevation)',
                        zIndex: 60,
                        padding: '4px',
                      }}
                    >
                      {TOP_N_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setRoleTopN(opt);
                            setRoleTopNDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: roleTopN === opt ? 'rgba(255, 91, 34, 0.15)' : 'transparent',
                            color: roleTopN === opt ? '#FF7A45' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: roleTopN === opt ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role Chart */}
            <div style={{ height: '220px', width: '100%' }}>
              {displayedWorkTypes.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No work type data available
                </div>
              ) : roleChartType === 'Area' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayedWorkTypes} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                    <defs>
                      <linearGradient id="workforceRoleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7A45" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FF7A45" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="type" fontSize={9} stroke="var(--text-muted)" angle={-25} textAnchor="end" interval={0} tickFormatter={(val) => (val?.length > 10 ? `${val.substring(0, 9)}…` : val)} />
                    <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="count" stroke="#FF7A45" strokeWidth={2.2} fill="url(#workforceRoleGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : roleChartType === 'Line' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayedWorkTypes} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="type" fontSize={9} stroke="var(--text-muted)" angle={-25} textAnchor="end" interval={0} tickFormatter={(val) => (val?.length > 10 ? `${val.substring(0, 9)}…` : val)} />
                    <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Line type="monotone" dataKey="count" stroke="#FF7A45" strokeWidth={2.5} dot={{ r: 4, fill: '#FF7A45' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : roleChartType === 'Donut' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Pie
                      data={displayedWorkTypes}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      cursor="pointer"
                      onClick={(d) => openSlideOver('drill_workforce', { work_type: d?.type } as never)}
                    >
                      {displayedWorkTypes.map((entry, index) => (
                        <Cell key={`cell-role-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : roleChartType === 'Horizontal Bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedWorkTypes} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <YAxis type="category" dataKey="type" fontSize={10} stroke="var(--text-muted)" width={85} tickFormatter={(val) => (val?.length > 12 ? `${val.substring(0, 11)}…` : val)} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Bar
                      dataKey="count"
                      name="Staff"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      cursor="pointer"
                      onClick={(d) => openSlideOver('drill_workforce', { work_type: d?.type } as never)}
                    >
                      {displayedWorkTypes.map((entry, index) => (
                        <Cell key={`cell-role-hbar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : roleChartType === 'Vertical Bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedWorkTypes} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="type" fontSize={9} stroke="var(--text-muted)" angle={-25} textAnchor="end" interval={0} tickFormatter={(val) => (val?.length > 10 ? `${val.substring(0, 9)}…` : val)} />
                    <YAxis fontSize={10} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                    <Bar
                      dataKey="count"
                      name="Staff"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      cursor="pointer"
                      onClick={(d) => openSlideOver('drill_workforce', { work_type: d?.type } as never)}
                    >
                      {displayedWorkTypes.map((entry, index) => (
                        <Cell key={`cell-role-vbar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={displayedWorkTypes} cx="50%" cy="50%" outerRadius={70}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="type" fontSize={9} stroke="var(--text-muted)" tickFormatter={(val) => (val?.length > 8 ? `${val.substring(0, 7)}…` : val)} />
                    <PolarRadiusAxis fontSize={9} stroke="var(--text-muted)" />
                    <Radar name="Staff" dataKey="count" stroke="#FF7A45" fill="#FF7A45" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span>Showing {roleTopN === 'All' ? rawWorkTypes.length : roleTopN} of {rawWorkTypes.length} Roles</span>
            <span style={{ color: '#00E676', fontWeight: 700 }}>Click to inspect role</span>
          </div>
        </div>
      </div>
    </section>
  );
}