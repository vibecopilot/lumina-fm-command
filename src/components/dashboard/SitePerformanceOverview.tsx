import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { sites, Site } from '@/data/mockData';
import { MapPin, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortField = 'name' | 'health_score' | 'sla_compliance' | 'ppm_compliance' | 'open_tickets';
type SortDirection = 'asc' | 'desc';

export function SitePerformanceOverview() {
  const { openSlideOver, filters } = useDashboard();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('health_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');

  const filteredSites = useMemo(() => {
    let result = [...sites];

    // Apply filters
    if (filters.group_id) {
      result = result.filter(s => s.group_id === filters.group_id);
    }
    if (filters.site_id) {
      result = result.filter(s => s.id === filters.site_id);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.city.toLowerCase().includes(searchLower) ||
        s.group_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal as string) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

    return result;
  }, [sites, filters, search, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3 ml-1" /> : 
      <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'bg-healthy';
    if (score >= 70) return 'bg-warning';
    return 'bg-critical';
  };

  const getHealthStatus = (score: number): 'healthy' | 'warning' | 'critical' => {
    if (score >= 85) return 'healthy';
    if (score >= 70) return 'warning';
    return 'critical';
  };

  return (
    <section className="py-6">
      <div className="container">
        <SectionHeader 
          title="Site Performance Overview"
          subtitle={`${filteredSites.length} of ${sites.length} sites`}
          icon={<MapPin className="h-4 w-4" />}
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sites..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-48 pl-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'heatmap' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setViewMode('heatmap')}
                >
                  Heatmap
                </Button>
              </div>
            </div>
          }
        />

        {viewMode === 'table' ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-auto">
              <Table className="data-table">
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Site Name <SortIcon field="name" />
                      </div>
                    </TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('health_score')}>
                      <div className="flex items-center justify-center">
                        Health <SortIcon field="health_score" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sla_compliance')}>
                      <div className="flex items-center justify-center">
                        SLA <SortIcon field="sla_compliance" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('ppm_compliance')}>
                      <div className="flex items-center justify-center">
                        PPM <SortIcon field="ppm_compliance" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('open_tickets')}>
                      <div className="flex items-center justify-center">
                        Tickets <SortIcon field="open_tickets" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Assets</TableHead>
                    <TableHead className="text-center">Workforce</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow 
                      key={site.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openSlideOver('site', site)}
                    >
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{site.group_name}</TableCell>
                      <TableCell className="text-muted-foreground">{site.city}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge 
                          status={getHealthStatus(site.health_score)} 
                          label={`${site.health_score}%`} 
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge 
                          status={getHealthStatus(site.sla_compliance)} 
                          label={`${site.sla_compliance}%`} 
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge 
                          status={getHealthStatus(site.ppm_compliance)} 
                          label={`${site.ppm_compliance}%`} 
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>{site.open_tickets}</span>
                          {site.critical_tickets > 0 && (
                            <span className="text-2xs text-critical">({site.critical_tickets})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{site.total_assets}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge 
                          status={getHealthStatus(site.workforce_availability)} 
                          label={`${site.workforce_availability}%`} 
                        />
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-8 gap-1.5">
              {filteredSites.map((site) => (
                <div
                  key={site.id}
                  className={cn(
                    'aspect-square rounded-md cursor-pointer transition-all hover:scale-105 flex items-center justify-center',
                    getHealthColor(site.health_score)
                  )}
                  onClick={() => openSlideOver('site', site)}
                  title={`${site.name} - ${site.health_score}%`}
                >
                  <span className="text-2xs font-medium text-white opacity-80">
                    {site.health_score}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-healthy" />
                <span className="text-xs text-muted-foreground">Healthy (≥85%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-warning" />
                <span className="text-xs text-muted-foreground">Warning (70-84%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-critical" />
                <span className="text-xs text-muted-foreground">Critical (&lt;70%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}