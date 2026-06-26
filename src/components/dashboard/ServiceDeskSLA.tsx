import { useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useServiceDesk } from '@/hooks/useGroupedDashboard';
import { Ticket as TicketIcon, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ServiceDeskSLA() {
  const { openSlideOver, currentRole, filters } = useDashboard();
  const { data, isPending: isLoading } = useServiceDesk(filters);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const summary = data?.summary;
  const slaStatus = data?.sla_status;

  const ticketsByStatus = summary
    ? [
        { status: 'open', label: 'Open', count: summary.open },
        { status: 'in_progress', label: 'In Progress', count: summary.in_progress },
        { status: 'pending', label: 'Pending', count: summary.pending },
        { status: 'resolved', label: 'Resolved', count: summary.resolved },
        { status: 'closed', label: 'Closed', count: summary.closed },
      ]
    : [];

  const categoryChartData = (data?.tickets_by_category ?? [])
    .map(c => ({ name: c.category, value: c.count }))
    .sort((a, b) => b.value - a.value);

  const priorityTickets = (data?.priority_tickets ?? []).filter(t =>
    !statusFilter || t.status === statusFilter
  );

  return (
    <section className="py-4 sm:py-6 border-t">
      <div className="container">
        <SectionHeader
          title="Service Desk & SLA Intelligence"
          subtitle={isLoading ? 'Loading...' : `${summary?.total ?? 0} tickets`}
          icon={<TicketIcon className="h-4 w-4" />}
        />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Summary Tabs - scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {ticketsByStatus.map(({ status, label, count }) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  className="flex-shrink-0 h-auto py-2 px-3 flex flex-col items-center gap-0.5 min-w-[72px]"
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                >
                  <span className="text-base sm:text-lg font-bold">{count}</span>
                  <span className="text-2xs capitalize">{label}</span>
                </Button>
              ))}
            </div>

            {/* Main grid: stacks on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* SLA Status */}
              <div className="sm:col-span-1 lg:col-span-3 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SLA Status</h4>
                {slaStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-healthy-bg rounded-md">
                      <span className="text-sm">Within TAT</span>
                      <span className="text-lg font-bold text-healthy">{slaStatus.within_sla}</span>
                    </div>
                    {/* <div className="flex items-center justify-between p-2 bg-warning-bg rounded-md">
                      <span className="text-sm">At Risk</span>
                      <span className="text-lg font-bold text-warning">{slaStatus.at_risk}</span>
                    </div> */}
                    <div className="flex items-center justify-between p-2 bg-critical-bg rounded-md">
                      <span className="text-sm">Outside TAT</span>
                      <span className="text-lg font-bold text-critical">{slaStatus.breached}</span>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                      <span>TAT Compliance</span>
                      <span className="font-semibold text-foreground">{slaStatus.sla_percentage}%</span>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                      <span>Avg Resolution</span>
                      <span className="font-semibold text-foreground">{data?.avg_resolution_time_hours}h</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tickets by Category Chart */}
              <div className="sm:col-span-1 lg:col-span-4 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tickets by Category</h4>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData.slice(0, 6)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={10} />
                      <YAxis type="category" dataKey="name" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="value" fill="hsl(213, 56%, 24%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority Tickets */}
              <div className="sm:col-span-2 lg:col-span-5 border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-critical" />
                  Priority Tickets
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {priorityTickets.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">No priority tickets</div>
                  ) : (
                    priorityTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 group"
                        onClick={() => openSlideOver('ticket', ticket as never)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium truncate">{ticket.ticket_number}</span>
                            <StatusBadge status={ticket.priority === 'critical' ? 'critical' : 'warning'} label={ticket.priority} size="sm" />
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{ticket.heading}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <StatusBadge
                            status={ticket.sla_status === 'within_sla' ? 'healthy' : ticket.sla_status === 'at_risk' ? 'warning' : 'critical'}
                            label={ticket.sla_status.replace('_', ' ')}
                            size="sm"
                          />
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* All Priority Tickets (FM Head & Ops) */}
            {currentRole !== 'ceo' && data?.priority_tickets && data.priority_tickets.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Priority Tickets</h4>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {data.priority_tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 group"
                      onClick={() => openSlideOver('ticket', ticket as never)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-xs font-medium w-20 sm:w-28 shrink-0">{ticket.ticket_number}</span>
                        <span className="text-xs text-muted-foreground truncate">{ticket.heading}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <StatusBadge status={ticket.priority === 'critical' ? 'critical' : 'warning'} label={ticket.priority} size="sm" />
                        <StatusBadge
                          status={ticket.sla_status === 'within_sla' ? 'healthy' : ticket.sla_status === 'at_risk' ? 'warning' : 'critical'}
                          label={ticket.sla_status.replace('_', ' ')}
                          size="sm"
                        />
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
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
