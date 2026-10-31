import { DashboardProvider } from '@/contexts/DashboardContext';
import { GlobalFilterBar } from '@/components/dashboard/GlobalFilterBar';
import { CommandCenterBanner } from '@/components/dashboard/CommandCenterBanner';
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
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Sticky Global Filter Bar */}
        <GlobalFilterBar />

        {/* Main Content Area matching Horizon container dimensions */}
        <main
          style={{
            maxWidth: '1680px',
            margin: '0 auto',
            padding: '24px 24px 80px 24px',
          }}
        >
          {/* Operations Command Center Futuristic Geometric Banner */}
          <CommandCenterBanner />

          {/* Executive KPI Strip with 6 interactive cards, sparklines, and inspection bar */}
          <ExecutiveKPIStrip />

          {/* Site Performance Overview with rankings & progress bars */}
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

        {/* Slide-over Drawer for Drill-downs */}
        <SlideOverPanel />

        {/* Alerts Panel (Sticky Bottom-Right) */}
        <AlertsPanel />
      </div>
    </DashboardProvider>
  );
};

export default Index;