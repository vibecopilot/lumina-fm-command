import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { usePPMOperations } from '@/hooks/useGroupedDashboard';
import { ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function PPMSoftServices() {
  const { currentRole, filters, openSlideOver } = useDashboard();
  const { data, isPending: isLoading } = usePPMOperations(filters);

  const ppm = data?.ppm;
  const softServices = data?.soft_services;

  const plannedVsAchieved = (ppm?.by_category ?? []).map(cat => ({
    name: cat.category,
    planned: cat.total,
    achieved: cat.completed,
    compliance: cat.completion_percentage,
  }));

  const complianceRate = ppm?.completion_percentage ?? 0;

  return (
    <section className="py-4 sm:py-6 border-t">
      <div className="container">
        <SectionHeader
          title="PPM & Soft Services Operations"
          subtitle={isLoading ? 'Loading...' : `${ppm?.total ?? 0} scheduled tasks`}
          icon={<ClipboardCheck className="h-4 w-4" />}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top row: stats + chart + compliance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Overall Stats */}
              <div className="sm:col-span-1 lg:col-span-3 space-y-3">
                <div
                  className="border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => openSlideOver('kpi_ppm', null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openSlideOver('kpi_ppm', null)}
                >
                  <div className="text-xs text-muted-foreground mb-1">PPM Compliance</div>
                  <div className={cn('text-3xl font-bold', complianceRate >= 85 ? 'text-healthy' : complianceRate >= 70 ? 'text-warning' : 'text-critical')}>
                    {complianceRate}%
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', complianceRate >= 85 ? 'bg-healthy' : complianceRate >= 70 ? 'bg-warning' : 'bg-critical')}
                      style={{ width: `${complianceRate}%` }}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  {[
                    { label: 'Completed', value: ppm?.completed ?? 0, cls: 'text-healthy' },
                    { label: 'Pending', value: ppm?.pending ?? 0, cls: '' },
                    { label: 'Missed', value: ppm?.missed ?? 0, cls: 'text-critical' },
                    { label: 'Overdue', value: ppm?.overdue ?? 0, cls: 'text-critical' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className={cn('font-semibold', row.cls)}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {softServices && (
                  <div className="border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-2">Soft Services</div>
                    <div className={cn('text-2xl font-bold mb-2', softServices.completion_percentage >= 85 ? 'text-healthy' : softServices.completion_percentage >= 70 ? 'text-warning' : 'text-critical')}>
                      {softServices.completion_percentage}%
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Completed', value: softServices.completed, cls: 'text-healthy' },
                        { label: 'Pending', value: softServices.pending, cls: '' },
                        { label: 'Overdue', value: softServices.overdue, cls: 'text-critical' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className={cn('font-medium', row.cls)}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Planned vs Achieved Chart */}
              <div className="sm:col-span-1 lg:col-span-5 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Planned vs Achieved by Category</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plannedVsAchieved}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="planned" name="Planned" fill="hsl(213, 40%, 75%)" radius={[4, 4, 0, 0]}
                        onClick={(data: { name?: string }) => data?.name && openSlideOver('drill_ppm', { type: 'category', value: data.name })}
                        style={{ cursor: 'pointer' }}
                      />
                      <Bar dataKey="achieved" name="Achieved" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]}
                        onClick={(data: { name?: string }) => data?.name && openSlideOver('drill_ppm', { type: 'category', value: data.name })}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Compliance */}
              <div className="sm:col-span-2 lg:col-span-4 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compliance by Category</h4>
                <div className="space-y-3 max-h-[220px] overflow-auto">
                  {plannedVsAchieved.map(cat => (
                    <div
                      key={cat.name}
                      className="space-y-1 cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{cat.achieved}/{cat.planned}</span>
                          <span className={cn('text-sm font-bold', cat.compliance >= 85 ? 'text-healthy' : cat.compliance >= 70 ? 'text-warning' : 'text-critical')}>
                            {cat.compliance}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', cat.compliance >= 85 ? 'bg-healthy' : cat.compliance >= 70 ? 'bg-warning' : 'bg-critical')}
                          style={{ width: `${cat.compliance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Compliance Grid (FM Head & Ops) */}
            {currentRole !== 'ceo' && plannedVsAchieved.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category Compliance Overview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {plannedVsAchieved.map(cat => (
                    <div
                      key={cat.name}
                      className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer"
                      onClick={() => openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openSlideOver('drill_ppm', { type: 'category', value: cat.name })}
                    >
                      <div className="text-sm font-medium mb-1 truncate">{cat.name}</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('text-xl font-bold', cat.compliance >= 85 ? 'text-healthy' : cat.compliance >= 70 ? 'text-warning' : 'text-critical')}>
                          {cat.compliance}%
                        </span>
                        <span className="text-xs text-muted-foreground">{cat.achieved}/{cat.planned}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', cat.compliance >= 85 ? 'bg-healthy' : cat.compliance >= 70 ? 'bg-warning' : 'bg-critical')}
                          style={{ width: `${cat.compliance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
