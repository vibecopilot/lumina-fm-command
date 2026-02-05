import { useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { ppmTasks, PPMTask } from '@/data/mockData';
import { ClipboardCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function PPMSoftServices() {
  const { openSlideOver, filters, currentRole } = useDashboard();

  const filteredTasks = useMemo(() => {
    let result = [...ppmTasks];
    if (filters.site_id) {
      result = result.filter(t => t.site_id === filters.site_id);
    }
    if (filters.category_id) {
      result = result.filter(t => t.category === filters.category_id);
    }
    if (filters.vendor_id) {
      result = result.filter(t => t.vendor_id === filters.vendor_id);
    }
    return result;
  }, [ppmTasks, filters]);

  const tasksByStatus = useMemo(() => {
    return {
      scheduled: filteredTasks.filter(t => t.status === 'scheduled').length,
      in_progress: filteredTasks.filter(t => t.status === 'in_progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length,
      missed: filteredTasks.filter(t => t.status === 'missed').length,
      overdue: filteredTasks.filter(t => t.status === 'overdue').length,
    };
  }, [filteredTasks]);

  const plannedVsAchieved = useMemo(() => {
    const categories: Record<string, { planned: number; achieved: number }> = {};
    filteredTasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = { planned: 0, achieved: 0 };
      }
      categories[task.category].planned++;
      if (task.status === 'completed') {
        categories[task.category].achieved++;
      }
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      planned: data.planned,
      achieved: data.achieved,
      compliance: Math.round((data.achieved / data.planned) * 100),
    }));
  }, [filteredTasks]);

  const missedTasks = filteredTasks.filter(t => t.status === 'missed' || t.status === 'overdue').slice(0, 6);

  const complianceRate = Math.round((tasksByStatus.completed / filteredTasks.length) * 100) || 0;

  return (
    <section className="py-6 border-t">
      <div className="container">
        <SectionHeader 
          title="PPM & Soft Services Operations"
          subtitle={`${filteredTasks.length} scheduled tasks`}
          icon={<ClipboardCheck className="h-4 w-4" />}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Overall Stats */}
          <div className="col-span-3 space-y-3">
            <div className="border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">Overall Compliance</div>
              <div className={cn(
                'text-3xl font-bold',
                complianceRate >= 85 ? 'text-healthy' : complianceRate >= 70 ? 'text-warning' : 'text-critical'
              )}>
                {complianceRate}%
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full',
                    complianceRate >= 85 ? 'bg-healthy' : complianceRate >= 70 ? 'bg-warning' : 'bg-critical'
                  )}
                  style={{ width: `${complianceRate}%` }}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completed</span>
                <span className="font-semibold text-healthy">{tasksByStatus.completed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Scheduled</span>
                <span className="font-semibold">{tasksByStatus.scheduled}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>In Progress</span>
                <span className="font-semibold text-warning">{tasksByStatus.in_progress}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Missed</span>
                <span className="font-semibold text-critical">{tasksByStatus.missed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Overdue</span>
                <span className="font-semibold text-critical">{tasksByStatus.overdue}</span>
              </div>
            </div>
          </div>

          {/* Planned vs Achieved Chart */}
          <div className="col-span-5 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Planned vs Achieved by Category
            </h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plannedVsAchieved}>
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
                  <Bar dataKey="achieved" name="Achieved" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Missed PPM Risk */}
          <div className="col-span-4 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-critical" />
              Missed PPM - Risk Impact
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-auto">
              {missedTasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No missed tasks
                </div>
              ) : (
                missedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-critical-bg rounded-md cursor-pointer hover:bg-critical/10 group"
                    onClick={() => openSlideOver('ppm', task as unknown as Record<string, unknown>)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{task.type}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {task.category} • Due: {task.scheduled_date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge 
                        status="critical" 
                        label={task.status} 
                        size="sm"
                      />
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category Compliance Grid */}
          {currentRole !== 'ceo' && (
            <div className="col-span-12 border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Category Compliance Overview
              </h4>
              <div className="grid grid-cols-6 gap-3">
                {plannedVsAchieved.map(cat => (
                  <div key={cat.name} className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer">
                    <div className="text-sm font-medium mb-1">{cat.name}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        'text-xl font-bold',
                        cat.compliance >= 85 ? 'text-healthy' : cat.compliance >= 70 ? 'text-warning' : 'text-critical'
                      )}>
                        {cat.compliance}%
                      </span>
                      <span className="text-xs text-muted-foreground">{cat.achieved}/{cat.planned}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          cat.compliance >= 85 ? 'bg-healthy' : cat.compliance >= 70 ? 'bg-warning' : 'bg-critical'
                        )}
                        style={{ width: `${cat.compliance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}