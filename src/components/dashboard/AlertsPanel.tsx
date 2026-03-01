import { useDashboard } from '@/contexts/DashboardContext';
import { alerts, Alert } from '@/data/mockData';
import { Bell, X, AlertTriangle, Clock, Shield, Wrench, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function AlertsPanel() {
  const { alertsOpen, setAlertsOpen, openSlideOver, unacknowledgedAlerts } = useDashboard();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'sla_breach': return <Clock className="h-4 w-4" />;
      case 'ppm_miss': return <Wrench className="h-4 w-4" />;
      case 'workforce_shortage': return <Users className="h-4 w-4" />;
      case 'security_exception': return <Shield className="h-4 w-4" />;
      case 'asset_critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      {/* Floating Alert Button */}
      {/* <Button
        onClick={() => setAlertsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Bell className="h-5 w-5" />
        {unacknowledgedAlerts > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-critical text-critical-foreground text-2xs"
          >
            {unacknowledgedAlerts}
          </Badge>
        )}
      </Button> */}

      {/* Alert Panel */}
      {/* {alertsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-panel-overlay/20 z-50 animate-fade-in"
            onClick={() => setAlertsOpen(false)}
          />
          <div className="fixed right-6 bottom-24 w-96 bg-panel-bg border rounded-lg shadow-xl z-50 animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Active Alerts</h3>
                <Badge variant="secondary" className="text-2xs">{alerts.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAlertsOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-2">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-colors',
                      alert.severity === 'critical' ? 'bg-critical-bg hover:bg-critical/10' : 'bg-warning-bg hover:bg-warning/10',
                      alert.acknowledged && 'opacity-60'
                    )}
                    onClick={() => {
                      openSlideOver('alert', alert);
                      setAlertsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'mt-0.5',
                        alert.severity === 'critical' ? 'text-critical' : 'text-warning'
                      )}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{alert.title}</span>
                          <span className="text-2xs text-muted-foreground whitespace-nowrap">
                            {getTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.description}</p>
                        <div className="text-2xs text-muted-foreground mt-1">{alert.site_name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )} */}
    </>
  );
}