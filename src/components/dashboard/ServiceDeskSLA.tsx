import { useMemo, useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { tickets, Ticket } from '@/data/mockData';
import { Ticket as TicketIcon, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ServiceDeskSLA() {
  const { openSlideOver, filters, currentRole } = useDashboard();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (filters.site_id) {
      result = result.filter(t => t.site_id === filters.site_id);
    }
    if (filters.category_id) {
      result = result.filter(t => t.category === filters.category_id);
    }
    if (filters.sla_status) {
      result = result.filter(t => t.sla_status === filters.sla_status);
    }
    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }
    return result;
  }, [tickets, filters, statusFilter]);

  const ticketsByStatus = useMemo(() => {
    return {
      open: filteredTickets.filter(t => t.status === 'open').length,
      in_progress: filteredTickets.filter(t => t.status === 'in_progress').length,
      pending: filteredTickets.filter(t => t.status === 'pending').length,
      resolved: filteredTickets.filter(t => t.status === 'resolved').length,
      closed: filteredTickets.filter(t => t.status === 'closed').length,
    };
  }, [filteredTickets]);

  const ticketsBySLA = useMemo(() => {
    return {
      within_sla: filteredTickets.filter(t => t.sla_status === 'within_sla').length,
      at_risk: filteredTickets.filter(t => t.sla_status === 'at_risk').length,
      breached: filteredTickets.filter(t => t.sla_status === 'breached').length,
    };
  }, [filteredTickets]);

  const ticketsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTickets]);

  const statusColors: Record<string, string> = {
    open: 'hsl(213, 56%, 24%)',
    in_progress: 'hsl(38, 92%, 50%)',
    pending: 'hsl(215, 16%, 47%)',
    resolved: 'hsl(142, 71%, 45%)',
    closed: 'hsl(213, 20%, 75%)',
  };

  const priorityTickets = filteredTickets
    .filter(t => t.priority === 'critical' || t.sla_status === 'breached')
    .slice(0, 8);

  return (
    <section className="py-6 border-t">
      <div className="container">
        <SectionHeader 
          title="Service Desk & SLA Intelligence"
          subtitle={`${filteredTickets.length} tickets`}
          icon={<TicketIcon className="h-4 w-4" />}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Status Summary Cards */}
          <div className="col-span-12 flex gap-2">
            {Object.entries(ticketsByStatus).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              >
                <span className="text-lg font-bold">{count}</span>
                <span className="text-2xs capitalize">{status.replace('_', ' ')}</span>
              </Button>
            ))}
          </div>

          {/* SLA Status */}
          <div className="col-span-3 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              SLA Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-healthy-bg rounded-md">
                <span className="text-sm">Within SLA</span>
                <span className="text-lg font-bold text-healthy">{ticketsBySLA.within_sla}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-warning-bg rounded-md">
                <span className="text-sm">At Risk</span>
                <span className="text-lg font-bold text-warning">{ticketsBySLA.at_risk}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-critical-bg rounded-md">
                <span className="text-sm">Breached</span>
                <span className="text-lg font-bold text-critical">{ticketsBySLA.breached}</span>
              </div>
            </div>
          </div>

          {/* Tickets by Category Chart */}
          <div className="col-span-4 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Tickets by Category
            </h4>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketsByCategory.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))'
                    }} 
                  />
                  <Bar dataKey="value" fill="hsl(213, 56%, 24%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Tickets */}
          <div className="col-span-5 border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-critical" />
              Priority Tickets
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-auto">
              {priorityTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 group"
                  onClick={() => openSlideOver('ticket', ticket)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">{ticket.ticket_no}</span>
                      <StatusBadge 
                        status={ticket.priority === 'critical' ? 'critical' : 'warning'} 
                        label={ticket.priority} 
                        size="sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{ticket.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={ticket.sla_status === 'within_sla' ? 'healthy' : ticket.sla_status === 'at_risk' ? 'warning' : 'critical'} 
                      label={ticket.sla_hours_remaining > 0 ? `${ticket.sla_hours_remaining}h` : 'Breached'} 
                      size="sm"
                    />
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Grid (FM Head & Ops) */}
          {currentRole !== 'ceo' && (
            <div className="col-span-12 border rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-auto">
                <Table className="data-table">
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.slice(0, 20).map((ticket) => (
                      <TableRow 
                        key={ticket.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openSlideOver('ticket', ticket)}
                      >
                        <TableCell className="font-medium">{ticket.ticket_no}</TableCell>
                        <TableCell className="text-muted-foreground">{ticket.site_id}</TableCell>
                        <TableCell className="text-muted-foreground">{ticket.block_id.split('-').pop()}</TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell className="text-muted-foreground">{ticket.type}</TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={ticket.priority === 'critical' ? 'critical' : ticket.priority === 'high' ? 'warning' : 'neutral'} 
                            label={ticket.priority} 
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs capitalize">{ticket.status.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={ticket.sla_status === 'within_sla' ? 'healthy' : ticket.sla_status === 'at_risk' ? 'warning' : 'critical'} 
                            label={ticket.sla_status.replace('_', ' ')} 
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{ticket.assigned_to}</TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}