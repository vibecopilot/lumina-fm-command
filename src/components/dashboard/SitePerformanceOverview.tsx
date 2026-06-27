import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSitePerformance } from '@/hooks/useGroupedDashboard';
import { SitePerformanceSite } from '@/types/groupedDashboard';
import { MapPin, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn, safeNumber } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortField = 'name' | 'health_score' | 'sla_percentage' | 'ppm_percentage' | 'pending_tickets';
type SortDirection = 'asc' | 'desc';

export function SitePerformanceOverview() {
  const { openSlideOver, filters } = useDashboard();
  const { data, isPending: isLoading } = useSitePerformance(filters);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('health_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');

  const filteredSites = useMemo(() => {
    let result = [...(data?.sites ?? [])];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        (s.city?.toLowerCase().includes(searchLower) ?? false) ||
        s.group.toLowerCase().includes(searchLower)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string') {
        return (aVal as string).localeCompare(bVal as string) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

    return result;
  }, [data?.sites, search, sortField, sortDirection]);

  console.log('Site Performance Data:', filteredSites);
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

  const totalSites = data?.total_sites ?? 0;

  return (
    <section className="py-6">
      <div className="container">
        <SectionHeader
          title="Site Performance Overview"
          subtitle={isLoading ? 'Loading...' : `${filteredSites.length} of ${totalSites} sites`}
          icon={<MapPin className="h-4 w-4" />}
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sites..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full sm:w-48 pl-8 text-xs"
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

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : viewMode === 'table' ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto">
                <Table className="data-table min-w-[900px]">
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                    <TableRow>
                      <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center">
                          Site Name <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-center cursor-pointer" onClick={() => handleSort('health_score')}>
                        <div className="flex items-center justify-center">
                          Health <SortIcon field="health_score" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sla_percentage')}>
                        <div className="flex items-center justify-center">
                          TAT <SortIcon field="sla_percentage" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center cursor-pointer" onClick={() => handleSort('ppm_percentage')}>
                        <div className="flex items-center justify-center">
                          PPM <SortIcon field="ppm_percentage" />
                        </div>
                      </TableHead>
                      {/* <TableHead className="text-center cursor-pointer" onClick={() => handleSort('pending_tickets')}>
                        <div className="flex items-center justify-center">
                          Pending Tickets <SortIcon field="pending_tickets" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Assets</TableHead>
                      <TableHead className="text-center">Workforce</TableHead> */}
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.map((site: SitePerformanceSite) => (
                      <TableRow
                        key={site.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openSlideOver('drill_site', { id: site.id, name: site.name })}
                      >
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{site.group}</TableCell>
                        <TableCell className="text-muted-foreground">{site.city ?? '—'}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.health_score))}
                            label={`${safeNumber(site.health_score)}%`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.sla_percentage))}
                            label={`${safeNumber(site.sla_percentage)}%`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.ppm_percentage))}
                            label={`${safeNumber(site.ppm_percentage)}%`}
                          />
                        </TableCell>
                        {/* <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>{safeNumber(site.pending_tickets, 0)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{safeNumber(site.total_assets, 0)}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={getHealthStatus(safeNumber(site.workforce_percentage))}
                            label={`${safeNumber(site.workforce_percentage)}%`}
                          />
                        </TableCell> */}
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-8 gap-1.5">
              {filteredSites.map((site: SitePerformanceSite) => (
                <div
                  key={site.id}
                  className={cn(
                    'aspect-square rounded-md cursor-pointer transition-all hover:scale-105 flex items-center justify-center',
                    getHealthColor(safeNumber(site.health_score))
                  )}
                  onClick={() => openSlideOver('drill_site', { id: site.id, name: site.name })}
                  title={`${site.name} - ${safeNumber(site.health_score)}%`}
                >
                  <span className="text-2xs font-medium text-white opacity-80">
                    {safeNumber(site.health_score)}
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