import { useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { workforce, Workforce } from '@/data/mockData';
import { Users, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export function WorkforceTracking() {
  const { filters, currentRole } = useDashboard();

  const filteredWorkforce = useMemo(() => {
    let result = [...workforce];
    if (filters.site_id) {
      result = result.filter(w => w.site_id === filters.site_id);
    }
    return result;
  }, [workforce, filters]);

  const statusCounts = useMemo(() => {
    return {
      present: filteredWorkforce.filter(w => w.status === 'present').length,
      absent: filteredWorkforce.filter(w => w.status === 'absent').length,
      on_leave: filteredWorkforce.filter(w => w.status === 'on_leave').length,
      late: filteredWorkforce.filter(w => w.status === 'late').length,
    };
  }, [filteredWorkforce]);

  const byEmployeeType = useMemo(() => {
    const counts: Record<string, { total: number; present: number }> = {};
    filteredWorkforce.forEach(w => {
      if (!counts[w.employee_type]) {
        counts[w.employee_type] = { total: 0, present: 0 };
      }
      counts[w.employee_type].total++;
      if (w.status === 'present' || w.status === 'late') {
        counts[w.employee_type].present++;
      }
    });
    return Object.entries(counts).map(([type, data]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      planned: data.total,
      present: data.present,
      absent: data.total - data.present,
    }));
  }, [filteredWorkforce]);

  const byAttendanceMode = useMemo(() => {
    const presentWorkers = filteredWorkforce.filter(w => w.status === 'present' || w.status === 'late');
    const counts = {
      face: presentWorkers.filter(w => w.attendance_mode === 'face').length,
      qr: presentWorkers.filter(w => w.attendance_mode === 'qr').length,
      manual: presentWorkers.filter(w => w.attendance_mode === 'manual').length,
    };
    return [
      { name: 'Face ID', value: counts.face, color: 'hsl(213, 56%, 24%)' },
      { name: 'QR Code', value: counts.qr, color: 'hsl(213, 40%, 45%)' },
      { name: 'Manual', value: counts.manual, color: 'hsl(213, 20%, 65%)' },
    ];
  }, [filteredWorkforce]);

  const byShift = useMemo(() => {
    const counts: Record<string, { total: number; present: number }> = {
      morning: { total: 0, present: 0 },
      afternoon: { total: 0, present: 0 },
      night: { total: 0, present: 0 },
    };
    filteredWorkforce.forEach(w => {
      counts[w.shift].total++;
      if (w.status === 'present' || w.status === 'late') {
        counts[w.shift].present++;
      }
    });
    return Object.entries(counts).map(([shift, data]) => ({
      name: shift.charAt(0).toUpperCase() + shift.slice(1),
      planned: data.total,
      present: data.present,
    }));
  }, [filteredWorkforce]);

  const availabilityRate = Math.round(((statusCounts.present + statusCounts.late) / filteredWorkforce.length) * 100) || 0;

  const shortfallSites = useMemo(() => {
    const siteStats: Record<string, { site_id: string; total: number; present: number }> = {};
    filteredWorkforce.forEach(w => {
      if (!siteStats[w.site_id]) {
        siteStats[w.site_id] = { site_id: w.site_id, total: 0, present: 0 };
      }
      siteStats[w.site_id].total++;
      if (w.status === 'present' || w.status === 'late') {
        siteStats[w.site_id].present++;
      }
    });
    return Object.values(siteStats)
      .map(s => ({ ...s, availability: Math.round((s.present / s.total) * 100) }))
      .filter(s => s.availability < 80)
      .sort((a, b) => a.availability - b.availability)
      .slice(0, 5);
  }, [filteredWorkforce]);

  return (
    <section className="py-6 border-t">
      <div className="container">
        <SectionHeader 
          title="Workforce Tracking"
          subtitle={`${filteredWorkforce.length} employees across all sites`}
          icon={<Users className="h-4 w-4" />}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Attendance Summary */}
          <div className="col-span-3 space-y-3">
            <div className="border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">Overall Availability</div>
              <div className={cn(
                'text-3xl font-bold',
                availabilityRate >= 90 ? 'text-healthy' : availabilityRate >= 80 ? 'text-warning' : 'text-critical'
              )}>
                {availabilityRate}%
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full',
                    availabilityRate >= 90 ? 'bg-healthy' : availabilityRate >= 80 ? 'bg-warning' : 'bg-critical'
                  )}
                  style={{ width: `${availabilityRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded-lg p-3 bg-healthy-bg">
                <div className="flex items-center gap-1 mb-1">
                  <UserCheck className="h-3.5 w-3.5 text-healthy" />
                  <span className="text-xs">Present</span>
                </div>
                <div className="text-xl font-bold">{statusCounts.present}</div>
              </div>
              <div className="border rounded-lg p-3 bg-critical-bg">
                <div className="flex items-center gap-1 mb-1">
                  <UserX className="h-3.5 w-3.5 text-critical" />
                  <span className="text-xs">Absent</span>
                </div>
                <div className="text-xl font-bold">{statusCounts.absent}</div>
              </div>
              <div className="border rounded-lg p-3 bg-muted">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">On Leave</span>
                </div>
                <div className="text-xl font-bold">{statusCounts.on_leave}</div>
              </div>
              <div className="border rounded-lg p-3 bg-warning-bg">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3.5 w-3.5 text-warning" />
                  <span className="text-xs">Late</span>
                </div>
                <div className="text-xl font-bold">{statusCounts.late}</div>
              </div>
            </div>
          </div>

          {/* By Employee Type */}
          <div className="col-span-4 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              By Employee Type
            </h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byEmployeeType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="planned" name="Planned" fill="hsl(213, 40%, 75%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="present" name="Present" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Mode */}
          <div className="col-span-2 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Attendance Mode
            </h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byAttendanceMode}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {byAttendanceMode.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {byAttendanceMode.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shortfall Alerts */}
          <div className="col-span-3 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              Shortfall Alerts
            </h4>
            <div className="space-y-2">
              {shortfallSites.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No shortfall alerts
                </div>
              ) : (
                shortfallSites.map(site => (
                  <div 
                    key={site.site_id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-md',
                      site.availability < 70 ? 'bg-critical-bg' : 'bg-warning-bg'
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium">{site.site_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {site.present}/{site.total} present
                      </div>
                    </div>
                    <StatusBadge 
                      status={site.availability < 70 ? 'critical' : 'warning'} 
                      label={`${site.availability}%`} 
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shift Distribution */}
          {currentRole !== 'ceo' && (
            <div className="col-span-12 grid grid-cols-3 gap-4">
              {byShift.map(shift => (
                <div key={shift.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{shift.name} Shift</span>
                    <span className="text-xs text-muted-foreground">{shift.present}/{shift.planned}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full',
                        (shift.present / shift.planned * 100) >= 90 ? 'bg-healthy' : 
                        (shift.present / shift.planned * 100) >= 80 ? 'bg-warning' : 'bg-critical'
                      )}
                      style={{ width: `${(shift.present / shift.planned) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    {Math.round((shift.present / shift.planned) * 100)}% availability
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}