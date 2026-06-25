import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useWorkforce } from '@/hooks/useGroupedDashboard';
import { Users, UserCheck, UserX, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export function WorkforceTracking() {
  const { currentRole, filters, openSlideOver } = useDashboard();
  const { data, isPending: isLoading } = useWorkforce(filters);

  const summary = data?.summary;
  const byVendor = data?.by_vendor ?? [];
  const byWorkType = data?.by_work_type ?? [];

  const availabilityRate = summary?.availability_percentage ?? 0;

  const vendorChartData = byVendor.map(v => ({
    name: v.vendor ?? '—',
    present: v.present ?? 0,
    absent: v.absent ?? 0,
    total: v.total ?? 0,
  }));

  const workTypeChartData = byWorkType.map((wt, i) => ({
    name: wt.work_type ?? 'Unspecified',
    value: wt.count ?? 0,
    color: ['hsl(213, 56%, 24%)', 'hsl(213, 40%, 45%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'][i % 5],
  }));

  const shortfallVendors = byVendor
    .map(v => ({ ...v, availability: (v.total ?? 0) > 0 ? Math.round(((v.present ?? 0) / (v.total ?? 1)) * 100) : 0 }))
    .filter(v => v.availability < 80)
    .sort((a, b) => a.availability - b.availability)
    .slice(0, 5);

  return (
    <section className="py-4 sm:py-6 border-t">
      <div className="container">
        <SectionHeader
          title="Workforce Tracking"
          subtitle={isLoading ? 'Loading...' : `${summary?.total ?? 0} employees across all sites`}
          icon={<Users className="h-4 w-4" />}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Attendance Summary */}
              <div className="sm:col-span-1 lg:col-span-3 space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1">Overall Availability</div>
                  <div className={cn('text-3xl font-bold', availabilityRate >= 90 ? 'text-healthy' : availabilityRate >= 80 ? 'text-warning' : 'text-critical')}>
                    {availabilityRate}%
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', availabilityRate >= 90 ? 'bg-healthy' : availabilityRate >= 80 ? 'bg-warning' : 'bg-critical')}
                      style={{ width: `${availabilityRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="border rounded-lg p-3 bg-healthy-bg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openSlideOver('drill_workforce', { type: 'attendance', value: 'present' })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'attendance', value: 'present' })}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <UserCheck className="h-3.5 w-3.5 text-healthy" />
                      <span className="text-xs">Present</span>
                    </div>
                    <div className="text-xl font-bold">{summary?.present ?? 0}</div>
                  </div>
                  <div
                    className="border rounded-lg p-3 bg-critical-bg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openSlideOver('drill_workforce', { type: 'attendance', value: 'absent' })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'attendance', value: 'absent' })}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <UserX className="h-3.5 w-3.5 text-critical" />
                      <span className="text-xs">Absent</span>
                    </div>
                    <div className="text-xl font-bold">{summary?.absent ?? 0}</div>
                  </div>
                  <div className="border rounded-lg p-3 bg-muted col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Total Workforce</div>
                    <div className="text-xl font-bold">{summary?.total ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* By Vendor Chart */}
              <div className="sm:col-span-1 lg:col-span-4 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Vendor</h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={9} />
                      <YAxis fontSize={10} />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="present" name="Present" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]}
                        onClick={(data: { name?: string }) => data?.name && openSlideOver('drill_workforce', { type: 'vendor', value: data.name })}
                        style={{ cursor: 'pointer' }}
                      />
                      <Bar dataKey="absent" name="Absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]}
                        onClick={(data: { name?: string }) => data?.name && openSlideOver('drill_workforce', { type: 'vendor', value: data.name })}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* By Work Type */}
              <div className="sm:col-span-1 lg:col-span-2 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Work Type</h4>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workTypeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(data: { name?: string }) => data?.name && openSlideOver('drill_workforce', { type: 'work_type', value: data.name })}
                        style={{ cursor: 'pointer' }}
                      >
                        {workTypeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-2">
                  {workTypeChartData.map(item => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 py-0.5 transition-colors group"
                      onClick={() => openSlideOver('drill_workforce', { type: 'work_type', value: item.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'work_type', value: item.name })}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground truncate group-hover:text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item.value}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Shortfall Alerts */}
              <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Low Availability Vendors</h4>
                <div className="space-y-2">
                  {shortfallVendors.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">All vendors at good capacity</div>
                  ) : (
                    shortfallVendors.map(vendor => (
                      <div
                        key={vendor.vendor}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-md cursor-pointer hover:opacity-90 transition-opacity group',
                          vendor.availability < 70 ? 'bg-critical-bg' : 'bg-warning-bg'
                        )}
                        onClick={() => openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                      >
                        <div>
                          <div className="text-sm font-medium">{vendor.vendor}</div>
                          <div className="text-xs text-muted-foreground">{(vendor.present ?? 0)}/{(vendor.total ?? 0)} present</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <StatusBadge status={vendor.availability < 70 ? 'critical' : 'warning'} label={`${vendor.availability}%`} />
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Full Vendor Breakdown (FM Head & Ops) */}
            {currentRole !== 'ceo' && byVendor.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {byVendor.slice(0, 6).map(vendor => {
                  const total = vendor.total ?? 0;
                  const present = vendor.present ?? 0;
                  const availability = total > 0 ? Math.round((present / total) * 100) : 0;
                  return (
                    <div
                      key={vendor.vendor}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors group"
                      onClick={() => openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_workforce', { type: 'vendor', value: vendor.vendor })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">{vendor.vendor ?? '—'}</span>
                        <span className="text-xs text-muted-foreground">{present}/{total}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', availability >= 90 ? 'bg-healthy' : availability >= 80 ? 'bg-warning' : 'bg-critical')}
                          style={{ width: `${availability}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground text-right">{availability}% availability</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
