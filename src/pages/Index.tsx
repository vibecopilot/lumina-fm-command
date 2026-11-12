import { DashboardProvider } from '@/contexts/DashboardContext';
import { GlobalFilterBar } from '@/components/dashboard/GlobalFilterBar';
import { ExecutiveKPIStrip } from '@/components/dashboard/ExecutiveKPIStrip';
import { SitePerformanceOverview } from '@/components/dashboard/SitePerformanceOverview';
import { AssetPortfolioHealth } from '@/components/dashboard/AssetPortfolioHealth';
import { ServiceDeskSLA } from '@/components/dashboard/ServiceDeskSLA';
import { PPMSoftServices } from '@/components/dashboard/PPMSoftServices';
import { WorkforceTracking } from '@/components/dashboard/WorkforceTracking';
import { SlideOverPanel } from '@/components/dashboard/SlideOverPanel';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';

const Index = () => {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        {/* Sticky Global Filter Bar */}
        <GlobalFilterBar />

        {/* Executive KPI Strip */}
        <ExecutiveKPIStrip />

        {/* Main Content - Long Scroll */}
        <main>
          {/* Site Performance Overview */}
          <SitePerformanceOverview />

          {/* Asset Portfolio & Health */}
          <AssetPortfolioHealth />

          {/* Service Desk & SLA Intelligence */}
          <ServiceDeskSLA />

          {/* PPM & Soft Services Operations */}
          <PPMSoftServices />

          {/* Workforce Tracking */}
          <WorkforceTracking />
        </main>

        {/* Slide-over Panel for Drill-downs */}
        <SlideOverPanel />

        {/* Alerts Panel (Sticky) */}
        <AlertsPanel />
      </div>
    </DashboardProvider>
  );
};

export default Index;