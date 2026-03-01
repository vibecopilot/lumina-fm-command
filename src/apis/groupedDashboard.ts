import axiosInstance from './axiosinstance';
import {
  ApiParams,
  OrgAssociatesResponse,
  DashboardKPIsResponse,
  SitePerformanceResponse,
  SiteDrillResponse,
  AssetPortfolioResponse,
  AssetDrillResponse,
  WorkforceDrillResponse,
  ServiceDeskResponse,
  PPMOperationsResponse,
  PPMDrillResponse,
  WorkforceResponse,
  ComplianceResponse,
  VisitorsDetailResponse,
  VisitorsDrillResponse,
} from '@/types/groupedDashboard';

function buildParams(params: ApiParams): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};

  if (params.site_id != null) {
    query['site_id'] = String(params.site_id);
  }
  if (params.site_ids?.length) {
    query['site_ids[]'] = params.site_ids.map(String);
  }
  if (params.company_id != null) {
    query['company_id'] = String(params.company_id);
  }
  if (params.category_id != null) {
    query['category_id'] = String(params.category_id);
  }
  if (params.vendor_id != null) {
    query['vendor_id'] = String(params.vendor_id);
  }
  if (params.role) {
    query['role'] = params.role;
  }
  if (params.from_date) {
    query['from_date'] = params.from_date;
  }
  if (params.to_date) {
    query['to_date'] = params.to_date;
  }

  return query;
}

export async function fetchOrgAssociates(companyId: string | number): Promise<OrgAssociatesResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/org_associates.json', {
    params: { company_id: companyId },
  });
  return response.data;
}

export async function fetchDashboardKPIs(params: ApiParams = {}): Promise<DashboardKPIsResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard.json', {
    params: buildParams(params),
  });
  return response.data;
}

export async function fetchSitePerformance(params: ApiParams = {}): Promise<SitePerformanceResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/site_performance.json', {
    params: buildParams(params),
  });
  return response.data;
}

export interface SiteDrillParams extends ApiParams {
  site_id: number | string;
}

export async function fetchSiteDrill(params: SiteDrillParams): Promise<SiteDrillResponse> {
  const baseParams = buildParams(params);
  baseParams['site_id'] = String(params.site_id);
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/site_drill.json', {
    params: baseParams,
  });
  return response.data;
}

export async function fetchAssetPortfolio(params: ApiParams = {}): Promise<AssetPortfolioResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/asset_portfolio.json', {
    params: buildParams(params),
  });
  return response.data;
}

export interface AssetDrillParams extends ApiParams {
  status?: string;
  category?: string;
}

export async function fetchAssetDrill(params: AssetDrillParams = {}): Promise<AssetDrillResponse> {
  const baseParams = buildParams(params);
  if (params.status) baseParams['status'] = params.status;
  if (params.category) baseParams['category'] = params.category;
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/asset_drill.json', {
    params: baseParams,
  });
  return response.data;
}

export interface WorkforceDrillParams extends ApiParams {
  vendor?: string;
  work_type?: string;
  attendance?: 'present' | 'absent';
}

export async function fetchWorkforceDrill(params: WorkforceDrillParams = {}): Promise<WorkforceDrillResponse> {
  const baseParams = buildParams(params);
  if (params.vendor) baseParams['vendor'] = params.vendor;
  if (params.work_type) baseParams['work_type'] = params.work_type;
  if (params.attendance) baseParams['attendance'] = params.attendance;
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/workforce_drill.json', {
    params: baseParams,
  });
  return response.data;
}

export interface PPMDrillParams extends ApiParams {
  category: string;
}

export async function fetchPPMDrill(params: PPMDrillParams = {}): Promise<PPMDrillResponse> {
  const baseParams = buildParams(params);
  if (params.category) baseParams['category'] = params.category;
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/ppm_drill.json', {
    params: baseParams,
  });
  return response.data;
}

export async function fetchServiceDesk(params: ApiParams = {}): Promise<ServiceDeskResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/service_desk.json', {
    params: buildParams(params),
  });
  return response.data;
}

export async function fetchPPMOperations(params: ApiParams = {}): Promise<PPMOperationsResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/ppm_operations.json', {
    params: buildParams(params),
  });
  return response.data;
}

export async function fetchWorkforce(params: ApiParams = {}): Promise<WorkforceResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/workforce.json', {
    params: buildParams(params),
  });
  return response.data;
}

export async function fetchCompliance(params: ApiParams = {}): Promise<ComplianceResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/compliance.json', {
    params: buildParams(params),
  });
  return response.data;
}

export async function fetchVisitorsDetail(params: ApiParams = {}): Promise<VisitorsDetailResponse> {
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/visitors_detail.json', {
    params: buildParams(params),
  });
  return response.data;
}

export interface VisitorsDrillParams extends ApiParams {
  category?: string;
}

export async function fetchVisitorsDrill(params: VisitorsDrillParams = {}): Promise<VisitorsDrillResponse> {
  const baseParams = buildParams(params);
  if (params.category) baseParams['category'] = params.category;
  const response = await axiosInstance.get('/api/v1/grouped_dashboard/visitors_drill.json', {
    params: baseParams,
  });
  return response.data;
}
