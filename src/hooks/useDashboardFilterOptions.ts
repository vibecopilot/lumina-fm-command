import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrgAssociates } from '@/apis/groupedDashboard';
import { FilterState } from '@/contexts/DashboardContext';

export interface FilterOption {
  id: string;
  name: string;
}

export interface SiteOption {
  id: string;
  name: string;
  group_id?: string | null;
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function useDashboardFilterOptions(filters: FilterState) {
  const lsUserDetails = safeJsonParse<Record<string, unknown>>(localStorage.getItem('user_details'));
  const companyId = lsUserDetails?.company_id != null ? String(lsUserDetails.company_id) : null;

  const orgAssociatesQuery = useQuery({
    queryKey: ['org_associates', companyId],
    queryFn: () => fetchOrgAssociates(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  const org = orgAssociatesQuery.data;

  const groups: FilterOption[] = useMemo(() => {
    if (org?.groups?.length) {
      return org.groups.map(g => ({ id: String(g.id), name: String(g.name) }));
    }
    return [];
  }, [org?.groups]);

  const sites: SiteOption[] = useMemo(() => {
    if (!org?.sites?.length) return [];
    return org.sites
      .filter(site => !filters.group_id || site.group_id === filters.group_id)
      .map(s => ({
        id: String(s.id),
        name: s.name,
        group_id: s.group_id ?? null,
      }));
  }, [org?.sites, filters.group_id]);

  const categories: FilterOption[] = useMemo(() => {
    if (!org?.categories?.length) return [];
    return org.categories.map(c => ({ id: String(c.id), name: c.name }));
  }, [org?.categories]);

  const vendors: FilterOption[] = useMemo(() => {
    if (!org?.vendors?.length) return [];
    const list = org.vendors;
    const filtered =
      filters.site_id
        ? list.filter((v: { site_id?: number }) => String(v.site_id) === filters.site_id)
        : list;
    return filtered.map((v: { id: number; name: string }) => ({ id: String(v.id), name: v.name }));
  }, [org?.vendors, filters.site_id]);

  const loading = orgAssociatesQuery.isPending;

  return { groups, sites, categories, vendors, loading, companyId };
}

