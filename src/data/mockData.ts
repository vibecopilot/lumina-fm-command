// Enterprise Horizon Industrial Parks Limited - Mock Data Layer
// 45+ sites with realistic, consistent data

export type UserRole = 'ceo' | 'fm_head' | 'ops';

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface Site {
  id: string;
  name: string;
  group_id: string;
  group_name: string;
  address: string;
  city: string;
  region: string;
  health_score: number;
  status: HealthStatus;
  total_blocks: number;
  total_tenants: number;
  total_assets: number;
  sla_compliance: number;
  ppm_compliance: number;
  workforce_availability: number;
  open_tickets: number;
  critical_tickets: number;
  coordinates: { lat: number; lng: number };
}

export interface Block {
  id: string;
  site_id: string;
  name: string;
  floors: number;
  tenants: number;
  health_score: number;
  status: HealthStatus;
}

export interface Tenant {
  id: string;
  block_id: string;
  site_id: string;
  name: string;
  floor: number;
  area_sqft: number;
  lease_status: 'active' | 'expiring' | 'expired';
  health_score: number;
}

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  type: string;
  category: string;
  site_id: string;
  block_id: string;
  tenant_id: string | null;
  location: string;
  status: 'operational' | 'maintenance' | 'offline' | 'critical';
  health_score: number;
  last_ppm_date: string;
  next_ppm_date: string;
  uptime_percentage: number;
  age_years: number;
  manufacturer: string;
  model: string;
}

export interface Ticket {
  id: string;
  ticket_no: string;
  site_id: string;
  block_id: string;
  tenant_id: string | null;
  category: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  sla_status: 'within_sla' | 'at_risk' | 'breached';
  sla_hours_remaining: number;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  vendor_id: string | null;
  description: string;
  resolution_time_hours?: number;
}

export interface PPMTask {
  id: string;
  site_id: string;
  block_id: string;
  asset_id: string;
  category: string;
  type: string;
  scheduled_date: string;
  completed_date: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'overdue';
  vendor_id: string;
  assigned_to: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface Workforce {
  id: string;
  site_id: string;
  employee_id: string;
  name: string;
  employee_type: 'staff' | 'contractor' | 'security' | 'housekeeping' | 'technician';
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'present' | 'absent' | 'on_leave' | 'late';
  attendance_mode: 'face' | 'qr' | 'manual';
  check_in_time: string | null;
  check_out_time: string | null;
}

export interface Visitor {
  id: string;
  site_id: string;
  name: string;
  company: string;
  type: 'meeting' | 'interview' | 'temporary_staff' | 'delivery' | 'guest' | 'others';
  host_name: string;
  check_in_time: string;
  check_out_time: string | null;
  badge_number: string;
  status: 'checked_in' | 'checked_out';
}

export interface Vehicle {
  id: string;
  site_id: string;
  plate_number: string;
  type: 'employee' | 'guest' | 'delivery' | 'contractor';
  registration_status: 'registered' | 'unregistered';
  entry_time: string;
  exit_time: string | null;
  driver_name: string;
  purpose: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contract_status: 'active' | 'expiring' | 'expired';
  sla_compliance: number;
  tasks_assigned: number;
  tasks_completed: number;
  avg_response_time_hours: number;
  rating: number;
  sites_served: string[];
}

export interface ComplianceItem {
  id: string;
  site_id: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  due_date: string;
  last_audit_date: string;
  evidence_uploaded: boolean;
  penalty_risk: number;
  auditor: string;
}

export interface SecurityGuard {
  id: string;
  site_id: string;
  name: string;
  status: 'active' | 'inactive' | 'on_patrol';
  current_location: string;
  shift: string;
  patrol_scheduled: number;
  patrol_completed: number;
}

// Generate 48 sites across 6 groups
const groups = [
  { id: 'GRP001', name: 'North Region Hub' },
  { id: 'GRP002', name: 'South Industrial Zone' },
  { id: 'GRP003', name: 'East Logistics Park' },
  { id: 'GRP004', name: 'West Commercial Complex' },
  { id: 'GRP005', name: 'Central Business District' },
  { id: 'GRP006', name: 'Metro Distribution Center' },
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi'
];

const siteNames = [
  'Warehouse Alpha', 'Distribution Hub', 'Logistics Center', 'Industrial Park',
  'Commercial Tower', 'Tech Park', 'Business Center', 'Trade Complex',
  'Manufacturing Unit', 'Storage Facility', 'Cargo Terminal', 'Freight Hub',
  'Supply Chain Center', 'Operations Base', 'Fulfillment Center', 'Express Hub'
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return 'healthy';
  if (score >= 60) return 'warning';
  return 'critical';
}

function generateSites(): Site[] {
  const sites: Site[] = [];
  let siteIndex = 0;

  groups.forEach((group, groupIndex) => {
    const sitesInGroup = groupIndex < 3 ? 9 : 7; // 9+9+9+7+7+7 = 48 sites
    
    for (let i = 0; i < sitesInGroup; i++) {
      const healthScore = randomBetween(55, 98);
      const city = cities[siteIndex % cities.length];
      const siteName = siteNames[siteIndex % siteNames.length];
      
      sites.push({
        id: `SITE${String(siteIndex + 1).padStart(3, '0')}`,
        name: `${siteName} ${siteIndex + 1}`,
        group_id: group.id,
        group_name: group.name,
        address: `${randomBetween(1, 500)} Industrial Area, Sector ${randomBetween(1, 50)}`,
        city,
        region: group.name.split(' ')[0],
        health_score: healthScore,
        status: getHealthStatus(healthScore),
        total_blocks: randomBetween(3, 8),
        total_tenants: randomBetween(15, 80),
        total_assets: randomBetween(200, 1500),
        sla_compliance: randomBetween(75, 99),
        ppm_compliance: randomBetween(70, 98),
        workforce_availability: randomBetween(80, 100),
        open_tickets: randomBetween(5, 45),
        critical_tickets: randomBetween(0, 8),
        coordinates: {
          lat: 18.5 + (Math.random() * 10),
          lng: 72.5 + (Math.random() * 10),
        },
      });
      siteIndex++;
    }
  });

  return sites;
}

export const sites: Site[] = generateSites();

// Generate Blocks for each site
export const blocks: Block[] = sites.flatMap(site => {
  const blockCount = site.total_blocks;
  return Array.from({ length: blockCount }, (_, i) => {
    const healthScore = randomBetween(60, 98);
    return {
      id: `${site.id}-BLK${String(i + 1).padStart(2, '0')}`,
      site_id: site.id,
      name: `Block ${String.fromCharCode(65 + i)}`,
      floors: randomBetween(2, 10),
      tenants: Math.floor(site.total_tenants / blockCount),
      health_score: healthScore,
      status: getHealthStatus(healthScore),
    };
  });
});

// Asset Categories and Types
const assetCategories = {
  HVAC: ['Air Handling Unit', 'Chiller', 'Cooling Tower', 'Fan Coil Unit', 'VRF System'],
  Electrical: ['Transformer', 'DG Set', 'UPS', 'Panel Board', 'Bus Duct'],
  Plumbing: ['Pump', 'Water Tank', 'STP', 'Water Softener', 'Hydrant System'],
  Fire: ['Fire Alarm Panel', 'Sprinkler System', 'Fire Extinguisher', 'Smoke Detector'],
  Elevator: ['Passenger Lift', 'Cargo Lift', 'Escalator'],
  Security: ['CCTV Camera', 'Access Control', 'Boom Barrier', 'Metal Detector'],
};

// Generate Assets
export const assets: Asset[] = sites.flatMap(site => {
  const siteBlocks = blocks.filter(b => b.site_id === site.id);
  if (siteBlocks.length === 0) return [];
  
  const assetsPerSite = Math.floor(site.total_assets / 10); // Reduced for performance
  
  return Array.from({ length: assetsPerSite }, (_, i) => {
    const category = Object.keys(assetCategories)[i % Object.keys(assetCategories).length];
    const types = assetCategories[category as keyof typeof assetCategories];
    const type = types[i % types.length];
    const block = siteBlocks[i % siteBlocks.length];
    const healthScore = randomBetween(50, 100);
    const statuses: Asset['status'][] = ['operational', 'maintenance', 'offline', 'critical'];
    const statusWeights = [70, 15, 10, 5];
    const rand = Math.random() * 100;
    let status: Asset['status'] = 'operational';
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand <= cumulative) {
        status = statuses[j];
        break;
      }
    }

    return {
      id: `${site.id}-AST${String(i + 1).padStart(4, '0')}`,
      asset_code: `AST-${site.id.slice(-3)}-${String(i + 1).padStart(4, '0')}`,
      name: `${type} ${i + 1}`,
      type,
      category,
      site_id: site.id,
      block_id: block.id,
      tenant_id: null,
      location: `Floor ${randomBetween(1, block.floors)}, ${block.name}`,
      status,
      health_score: healthScore,
      last_ppm_date: new Date(Date.now() - randomBetween(1, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      next_ppm_date: new Date(Date.now() + randomBetween(1, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      uptime_percentage: randomBetween(85, 100),
      age_years: randomBetween(1, 15),
      manufacturer: ['Carrier', 'Daikin', 'ABB', 'Siemens', 'Schneider', 'Honeywell'][i % 6],
      model: `Model-${String.fromCharCode(65 + (i % 26))}${randomBetween(100, 999)}`,
    };
  });
});

// Ticket Categories and Types
const ticketCategories = {
  Electrical: ['Power Failure', 'Lighting Issue', 'Wiring Problem', 'Generator Issue'],
  Plumbing: ['Water Leakage', 'Drainage Block', 'Low Pressure', 'Pump Failure'],
  HVAC: ['AC Not Working', 'Temperature Issue', 'Noise Complaint', 'Bad Odor'],
  Civil: ['Wall Crack', 'Floor Damage', 'Ceiling Issue', 'Door/Window'],
  Housekeeping: ['Cleaning Request', 'Pest Control', 'Waste Management'],
  Security: ['Access Issue', 'CCTV Problem', 'Alarm Malfunction'],
};

// Generate Tickets
export const tickets: Ticket[] = sites.flatMap(site => {
  const ticketCount = randomBetween(20, 60);
  const siteBlocks = blocks.filter(b => b.site_id === site.id);
  if (siteBlocks.length === 0) return [];
  
  return Array.from({ length: ticketCount }, (_, i) => {
    const category = Object.keys(ticketCategories)[i % Object.keys(ticketCategories).length];
    const types = ticketCategories[category as keyof typeof ticketCategories];
    const type = types[i % types.length];
    const block = siteBlocks[i % siteBlocks.length];
    const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'critical'];
    const priority = priorities[randomBetween(0, 3)];
    const statuses: Ticket['status'][] = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
    const status = statuses[randomBetween(0, 4)];
    const slaStatuses: Ticket['sla_status'][] = ['within_sla', 'at_risk', 'breached'];
    const slaStatus = slaStatuses[randomBetween(0, 2)];
    const createdDaysAgo = randomBetween(0, 30);

    return {
      id: `${site.id}-TKT${String(i + 1).padStart(5, '0')}`,
      ticket_no: `TKT-${site.id.slice(-3)}-${String(Date.now()).slice(-6)}${i}`,
      site_id: site.id,
      block_id: block.id,
      tenant_id: null,
      category,
      type,
      priority,
      status,
      sla_status: slaStatus,
      sla_hours_remaining: slaStatus === 'within_sla' ? randomBetween(4, 48) : slaStatus === 'at_risk' ? randomBetween(1, 4) : -randomBetween(1, 24),
      created_at: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - randomBetween(0, createdDaysAgo) * 24 * 60 * 60 * 1000).toISOString(),
      assigned_to: ['John Smith', 'Mike Wilson', 'Sarah Johnson', 'Robert Brown', 'Emily Davis'][i % 5],
      vendor_id: randomBetween(0, 1) ? `VND${String(randomBetween(1, 15)).padStart(3, '0')}` : null,
      description: `${type} reported in ${block.name}. ${priority === 'critical' ? 'Urgent attention required.' : 'Please address at earliest convenience.'}`,
      resolution_time_hours: status === 'resolved' || status === 'closed' ? randomBetween(2, 72) : undefined,
    };
  });
});

// Generate Vendors
export const vendors: Vendor[] = [
  { id: 'VND001', name: 'TechServe Solutions', category: 'HVAC', contract_status: 'active', sla_compliance: 94, tasks_assigned: 245, tasks_completed: 230, avg_response_time_hours: 2.5, rating: 4.5, sites_served: sites.slice(0, 20).map(s => s.id) },
  { id: 'VND002', name: 'PowerGrid Electricals', category: 'Electrical', contract_status: 'active', sla_compliance: 91, tasks_assigned: 312, tasks_completed: 284, avg_response_time_hours: 3.2, rating: 4.2, sites_served: sites.slice(0, 25).map(s => s.id) },
  { id: 'VND003', name: 'AquaFlow Services', category: 'Plumbing', contract_status: 'active', sla_compliance: 88, tasks_assigned: 178, tasks_completed: 157, avg_response_time_hours: 4.1, rating: 4.0, sites_served: sites.slice(5, 30).map(s => s.id) },
  { id: 'VND004', name: 'SafeGuard Security', category: 'Security', contract_status: 'active', sla_compliance: 96, tasks_assigned: 420, tasks_completed: 403, avg_response_time_hours: 1.5, rating: 4.7, sites_served: sites.slice(0, 40).map(s => s.id) },
  { id: 'VND005', name: 'CleanPro Facilities', category: 'Housekeeping', contract_status: 'active', sla_compliance: 92, tasks_assigned: 560, tasks_completed: 515, avg_response_time_hours: 2.0, rating: 4.3, sites_served: sites.slice(0, 35).map(s => s.id) },
  { id: 'VND006', name: 'FireSafe Systems', category: 'Fire', contract_status: 'expiring', sla_compliance: 89, tasks_assigned: 145, tasks_completed: 129, avg_response_time_hours: 3.8, rating: 4.1, sites_served: sites.slice(10, 40).map(s => s.id) },
  { id: 'VND007', name: 'LiftTech Elevators', category: 'Elevator', contract_status: 'active', sla_compliance: 95, tasks_assigned: 98, tasks_completed: 93, avg_response_time_hours: 2.8, rating: 4.6, sites_served: sites.slice(0, 30).map(s => s.id) },
  { id: 'VND008', name: 'GreenScape Gardens', category: 'Landscaping', contract_status: 'active', sla_compliance: 87, tasks_assigned: 210, tasks_completed: 183, avg_response_time_hours: 5.2, rating: 3.9, sites_served: sites.slice(5, 35).map(s => s.id) },
  { id: 'VND009', name: 'CivilWorks Construction', category: 'Civil', contract_status: 'active', sla_compliance: 85, tasks_assigned: 156, tasks_completed: 133, avg_response_time_hours: 6.5, rating: 3.8, sites_served: sites.slice(0, 28).map(s => s.id) },
  { id: 'VND010', name: 'PestAway Controls', category: 'Pest Control', contract_status: 'expired', sla_compliance: 78, tasks_assigned: 89, tasks_completed: 69, avg_response_time_hours: 8.2, rating: 3.5, sites_served: sites.slice(15, 40).map(s => s.id) },
  { id: 'VND011', name: 'MEP Masters', category: 'HVAC', contract_status: 'active', sla_compliance: 93, tasks_assigned: 278, tasks_completed: 258, avg_response_time_hours: 2.9, rating: 4.4, sites_served: sites.slice(20, 48).map(s => s.id) },
  { id: 'VND012', name: 'SecureTech Systems', category: 'Security', contract_status: 'active', sla_compliance: 97, tasks_assigned: 345, tasks_completed: 335, avg_response_time_hours: 1.2, rating: 4.8, sites_served: sites.slice(25, 48).map(s => s.id) },
  { id: 'VND013', name: 'WaterWorks Plumbing', category: 'Plumbing', contract_status: 'active', sla_compliance: 90, tasks_assigned: 167, tasks_completed: 150, avg_response_time_hours: 3.5, rating: 4.2, sites_served: sites.slice(30, 48).map(s => s.id) },
  { id: 'VND014', name: 'ElectroPro Services', category: 'Electrical', contract_status: 'expiring', sla_compliance: 86, tasks_assigned: 234, tasks_completed: 201, avg_response_time_hours: 4.2, rating: 3.9, sites_served: sites.slice(10, 35).map(s => s.id) },
  { id: 'VND015', name: 'FacilityOne Corp', category: 'General', contract_status: 'active', sla_compliance: 91, tasks_assigned: 456, tasks_completed: 415, avg_response_time_hours: 3.0, rating: 4.3, sites_served: sites.slice(0, 48).map(s => s.id) },
];

// Generate PPM Tasks
export const ppmTasks: PPMTask[] = sites.flatMap(site => {
  const taskCount = randomBetween(15, 40);
  const siteBlocks = blocks.filter(b => b.site_id === site.id);
  const siteAssets = assets.filter(a => a.site_id === site.id);
  
  if (siteBlocks.length === 0 || siteAssets.length === 0) return [];

  return Array.from({ length: taskCount }, (_, i) => {
    const asset = siteAssets[i % siteAssets.length];
    const block = siteBlocks[i % siteBlocks.length];
    const statuses: PPMTask['status'][] = ['scheduled', 'in_progress', 'completed', 'missed', 'overdue'];
    const status = statuses[randomBetween(0, 4)];
    const scheduledDaysAgo = randomBetween(-30, 30);

    return {
      id: `${site.id}-PPM${String(i + 1).padStart(4, '0')}`,
      site_id: site.id,
      block_id: block.id,
      asset_id: asset.id,
      category: asset.category,
      type: asset.type,
      scheduled_date: new Date(Date.now() - scheduledDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed_date: status === 'completed' ? new Date(Date.now() - (scheduledDaysAgo - randomBetween(0, 5)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      status,
      vendor_id: vendors[i % vendors.length].id,
      assigned_to: ['Technician A', 'Technician B', 'Technician C', 'Technician D'][i % 4],
      approval_status: status === 'completed' ? 'approved' : 'pending',
    };
  });
});

// Generate Workforce Data
export const workforce: Workforce[] = sites.flatMap(site => {
  const workerCount = randomBetween(20, 50);
  const names = ['Amit Kumar', 'Priya Sharma', 'Rahul Singh', 'Neha Patel', 'Vijay Reddy', 'Anjali Gupta', 'Suresh Verma', 'Pooja Iyer', 'Rajesh Nair', 'Meera Joshi'];
  const departments = ['Maintenance', 'Security', 'Housekeeping', 'Administration', 'Operations'];
  const types: Workforce['employee_type'][] = ['staff', 'contractor', 'security', 'housekeeping', 'technician'];

  return Array.from({ length: workerCount }, (_, i) => {
    const statuses: Workforce['status'][] = ['present', 'absent', 'on_leave', 'late'];
    const statusWeights = [75, 10, 10, 5];
    const rand = Math.random() * 100;
    let status: Workforce['status'] = 'present';
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand <= cumulative) {
        status = statuses[j];
        break;
      }
    }

    const shifts: Workforce['shift'][] = ['morning', 'afternoon', 'night'];
    const attendanceModes: Workforce['attendance_mode'][] = ['face', 'qr', 'manual'];

    return {
      id: `${site.id}-EMP${String(i + 1).padStart(4, '0')}`,
      site_id: site.id,
      employee_id: `EMP${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
      name: names[i % names.length],
      employee_type: types[i % types.length],
      department: departments[i % departments.length],
      shift: shifts[i % shifts.length],
      status,
      attendance_mode: attendanceModes[randomBetween(0, 2)],
      check_in_time: status === 'present' || status === 'late' ? `${String(8 + randomBetween(0, 2)).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}` : null,
      check_out_time: null,
    };
  });
});

// Generate Visitors
export const visitors: Visitor[] = sites.flatMap(site => {
  const visitorCount = randomBetween(10, 30);
  const companies = ['Tech Corp', 'Global Industries', 'Prime Solutions', 'Apex Enterprises', 'Nova Systems'];
  const hosts = ['Reception Desk', 'HR Department', 'Admin Office', 'Operations Head', 'Site Manager'];

  return Array.from({ length: visitorCount }, (_, i) => {
    const types: Visitor['type'][] = ['meeting', 'interview', 'temporary_staff', 'delivery', 'guest', 'others'];
    const checkInHour = randomBetween(8, 16);

    return {
      id: `${site.id}-VIS${String(i + 1).padStart(4, '0')}`,
      site_id: site.id,
      name: `Visitor ${i + 1}`,
      company: companies[i % companies.length],
      type: types[i % types.length],
      host_name: hosts[i % hosts.length],
      check_in_time: `${String(checkInHour).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}`,
      check_out_time: randomBetween(0, 1) ? `${String(checkInHour + randomBetween(1, 4)).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}` : null,
      badge_number: `VB-${String(randomBetween(1000, 9999))}`,
      status: randomBetween(0, 1) ? 'checked_in' : 'checked_out',
    };
  });
});

// Generate Vehicles
export const vehicles: Vehicle[] = sites.flatMap(site => {
  const vehicleCount = randomBetween(15, 40);

  return Array.from({ length: vehicleCount }, (_, i) => {
    const types: Vehicle['type'][] = ['employee', 'guest', 'delivery', 'contractor'];
    const entryHour = randomBetween(6, 18);

    return {
      id: `${site.id}-VEH${String(i + 1).padStart(4, '0')}`,
      site_id: site.id,
      plate_number: `${['MH', 'DL', 'KA', 'TN', 'GJ'][i % 5]}${randomBetween(1, 50)}${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String(randomBetween(1000, 9999))}`,
      type: types[i % types.length],
      registration_status: randomBetween(0, 10) > 2 ? 'registered' : 'unregistered',
      entry_time: `${String(entryHour).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}`,
      exit_time: randomBetween(0, 1) ? `${String(entryHour + randomBetween(1, 8)).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}` : null,
      driver_name: `Driver ${i + 1}`,
      purpose: ['Work', 'Delivery', 'Meeting', 'Pickup', 'Service'][i % 5],
    };
  });
});

// Generate Compliance Items
export const complianceItems: ComplianceItem[] = sites.flatMap(site => {
  const categories = ['Fire Safety', 'Environmental', 'Health & Safety', 'Building Code', 'Electrical', 'Labor Law'];
  
  return categories.map((category, i) => {
    const statuses: ComplianceItem['status'][] = ['compliant', 'non_compliant', 'pending_review'];
    const status = statuses[randomBetween(0, 2)];

    return {
      id: `${site.id}-CMP${String(i + 1).padStart(3, '0')}`,
      site_id: site.id,
      category,
      requirement: `${category} Compliance Certificate`,
      status,
      due_date: new Date(Date.now() + randomBetween(-30, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      last_audit_date: new Date(Date.now() - randomBetween(30, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      evidence_uploaded: status === 'compliant',
      penalty_risk: status === 'non_compliant' ? randomBetween(10000, 500000) : 0,
      auditor: ['Internal Audit Team', 'External Auditor', 'Regulatory Body'][i % 3],
    };
  });
});

// Generate Security Guards
export const securityGuards: SecurityGuard[] = sites.flatMap(site => {
  const guardCount = randomBetween(4, 12);

  return Array.from({ length: guardCount }, (_, i) => {
    const statuses: SecurityGuard['status'][] = ['active', 'inactive', 'on_patrol'];
    const locations = ['Main Gate', 'Parking Area', 'Reception', 'Building Entrance', 'Patrol Route', 'Control Room'];

    return {
      id: `${site.id}-SEC${String(i + 1).padStart(3, '0')}`,
      site_id: site.id,
      name: `Guard ${i + 1}`,
      status: statuses[randomBetween(0, 2)],
      current_location: locations[i % locations.length],
      shift: ['06:00-14:00', '14:00-22:00', '22:00-06:00'][i % 3],
      patrol_scheduled: randomBetween(4, 8),
      patrol_completed: randomBetween(2, 8),
    };
  });
});

// KPI Summary Data
export const kpiSummary = {
  ticket_sla_health: {
    value: 87,
    trend: 2.3,
    trend_direction: 'up' as const,
    total_tickets: tickets.length,
    within_sla: tickets.filter(t => t.sla_status === 'within_sla').length,
    at_risk: tickets.filter(t => t.sla_status === 'at_risk').length,
    breached: tickets.filter(t => t.sla_status === 'breached').length,
  },
  ppm_compliance: {
    value: 84,
    trend: -1.5,
    trend_direction: 'down' as const,
    total_tasks: ppmTasks.length,
    completed: ppmTasks.filter(t => t.status === 'completed').length,
    missed: ppmTasks.filter(t => t.status === 'missed').length,
    overdue: ppmTasks.filter(t => t.status === 'overdue').length,
  },
  asset_health: {
    value: 91,
    trend: 0.8,
    trend_direction: 'up' as const,
    total_assets: assets.length,
    operational: assets.filter(a => a.status === 'operational').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    critical: assets.filter(a => a.status === 'critical').length,
  },
  workforce_availability: {
    value: 89,
    trend: -0.5,
    trend_direction: 'down' as const,
    total_workforce: workforce.length,
    present: workforce.filter(w => w.status === 'present').length,
    absent: workforce.filter(w => w.status === 'absent').length,
    on_leave: workforce.filter(w => w.status === 'on_leave').length,
  },
  vendor_sla: {
    value: 90,
    trend: 1.2,
    trend_direction: 'up' as const,
    total_vendors: vendors.length,
    compliant: vendors.filter(v => v.sla_compliance >= 90).length,
    at_risk: vendors.filter(v => v.sla_compliance >= 80 && v.sla_compliance < 90).length,
    non_compliant: vendors.filter(v => v.sla_compliance < 80).length,
  },
  compliance_score: {
    value: 82,
    trend: 3.1,
    trend_direction: 'up' as const,
    total_items: complianceItems.length,
    compliant: complianceItems.filter(c => c.status === 'compliant').length,
    non_compliant: complianceItems.filter(c => c.status === 'non_compliant').length,
    pending: complianceItems.filter(c => c.status === 'pending_review').length,
  },
  visitors_load: {
    value: visitors.filter(v => v.status === 'checked_in').length,
    trend: 12,
    trend_direction: 'up' as const,
    total_today: visitors.length,
    checked_in: visitors.filter(v => v.status === 'checked_in').length,
    checked_out: visitors.filter(v => v.status === 'checked_out').length,
  },
  avg_resolution_time: {
    value: 4.2,
    trend: -0.8,
    trend_direction: 'down' as const, // down is good for resolution time
    unit: 'hours',
  },
};

// Trend Data for Charts (Monthly)
export const trendData = {
  tickets: [
    { month: 'Sep', open: 450, resolved: 420, sla_breached: 35 },
    { month: 'Oct', open: 480, resolved: 455, sla_breached: 28 },
    { month: 'Nov', open: 520, resolved: 490, sla_breached: 42 },
    { month: 'Dec', open: 390, resolved: 380, sla_breached: 22 },
    { month: 'Jan', open: 510, resolved: 485, sla_breached: 38 },
    { month: 'Feb', open: 475, resolved: 460, sla_breached: 25 },
  ],
  ppm: [
    { month: 'Sep', planned: 280, achieved: 245, missed: 35 },
    { month: 'Oct', planned: 310, achieved: 278, missed: 32 },
    { month: 'Nov', planned: 295, achieved: 252, missed: 43 },
    { month: 'Dec', planned: 260, achieved: 235, missed: 25 },
    { month: 'Jan', planned: 320, achieved: 285, missed: 35 },
    { month: 'Feb', planned: 305, achieved: 272, missed: 33 },
  ],
  assets: [
    { month: 'Sep', uptime: 94.5, downtime: 5.5 },
    { month: 'Oct', uptime: 95.2, downtime: 4.8 },
    { month: 'Nov', uptime: 93.8, downtime: 6.2 },
    { month: 'Dec', uptime: 96.1, downtime: 3.9 },
    { month: 'Jan', uptime: 94.8, downtime: 5.2 },
    { month: 'Feb', uptime: 95.5, downtime: 4.5 },
  ],
  vendors: [
    { month: 'Sep', avg_sla: 88, tasks_completed: 420 },
    { month: 'Oct', avg_sla: 89, tasks_completed: 455 },
    { month: 'Nov', avg_sla: 87, tasks_completed: 390 },
    { month: 'Dec', avg_sla: 91, tasks_completed: 480 },
    { month: 'Jan', avg_sla: 90, tasks_completed: 510 },
    { month: 'Feb', avg_sla: 92, tasks_completed: 485 },
  ],
};

// Alerts
export interface Alert {
  id: string;
  type: 'sla_breach' | 'ppm_miss' | 'workforce_shortage' | 'security_exception' | 'asset_critical';
  severity: 'warning' | 'critical';
  site_id: string;
  site_name: string;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export const alerts: Alert[] = [
  { id: 'ALT001', type: 'sla_breach', severity: 'critical', site_id: 'SITE001', site_name: 'Warehouse Alpha 1', title: 'SLA Breach - Critical Ticket', description: 'Ticket TKT-001-892341 has breached SLA by 4 hours', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), acknowledged: false },
  { id: 'ALT002', type: 'ppm_miss', severity: 'warning', site_id: 'SITE005', site_name: 'Commercial Tower 5', title: 'PPM Task Overdue', description: 'HVAC quarterly maintenance overdue by 3 days', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), acknowledged: false },
  { id: 'ALT003', type: 'workforce_shortage', severity: 'critical', site_id: 'SITE012', site_name: 'Logistics Center 12', title: 'Workforce Shortage', description: 'Security team at 60% capacity - 4 guards absent', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), acknowledged: false },
  { id: 'ALT004', type: 'asset_critical', severity: 'critical', site_id: 'SITE008', site_name: 'Tech Park 8', title: 'Asset Critical Failure', description: 'Chiller unit CHU-008-0023 offline - temperature rising', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), acknowledged: false },
  { id: 'ALT005', type: 'security_exception', severity: 'warning', site_id: 'SITE015', site_name: 'Distribution Hub 15', title: 'Unregistered Vehicle Entry', description: '3 unregistered vehicles entered in last hour', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), acknowledged: true },
  { id: 'ALT006', type: 'sla_breach', severity: 'warning', site_id: 'SITE023', site_name: 'Industrial Park 23', title: 'SLA At Risk', description: '5 tickets approaching SLA breach in next 2 hours', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), acknowledged: false },
  { id: 'ALT007', type: 'ppm_miss', severity: 'critical', site_id: 'SITE031', site_name: 'Warehouse Alpha 31', title: 'Fire Safety PPM Missed', description: 'Fire extinguisher inspection missed - compliance risk', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), acknowledged: false },
  { id: 'ALT008', type: 'workforce_shortage', severity: 'warning', site_id: 'SITE042', site_name: 'Cargo Terminal 42', title: 'Housekeeping Shortage', description: 'Morning shift housekeeping at 70% capacity', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), acknowledged: true },
];

// Filter Options
export const filterOptions = {
  groups: groups,
  sites: sites.map(s => ({ id: s.id, name: s.name, group_id: s.group_id })),
  categories: Object.keys(ticketCategories),
  vendors: vendors.map(v => ({ id: v.id, name: v.name })),
  sla_statuses: ['within_sla', 'at_risk', 'breached'],
  compliance_statuses: ['compliant', 'non_compliant', 'pending_review'],
  date_ranges: ['today', 'week', 'month', 'quarter', 'year', 'custom'],
};

export default {
  sites,
  blocks,
  assets,
  tickets,
  vendors,
  ppmTasks,
  workforce,
  visitors,
  vehicles,
  complianceItems,
  securityGuards,
  kpiSummary,
  trendData,
  alerts,
  filterOptions,
};