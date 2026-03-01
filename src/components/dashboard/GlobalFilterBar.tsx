import { useDashboard } from "@/contexts/DashboardContext";
import { useDashboardFilterOptions } from "@/hooks/useDashboardFilterOptions";
import { useDashboardKPIs } from "@/hooks/useGroupedDashboard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Building2,
  Users,
  Filter,
  RotateCcw,
  Settings,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function GlobalFilterBar() {
  const queryClient = useQueryClient();
  const { filters, updateFilter, resetFilters, currentRole, setCurrentRole } =
    useDashboard();
  const { groups, sites, categories, vendors } =
    useDashboardFilterOptions(filters);
  const { dataUpdatedAt, refetch, isFetching } = useDashboardKPIs(filters);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["grouped_dashboard"] });
    refetch();
  };

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== null && key !== "date_range",
  ).length;

  const dateRangeLabels: Record<string, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    quarter: "This Quarter",
    year: "This Year",
    custom: "Custom Range",
  };

  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center 
                        w-16 h-10 rounded-lg bg-primary shrink-0"
            >
              <img
                src="/Horizon_White.svg"
                alt="Horizon Industrial Parks Limited"
                className="w-16 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Horizon Industrial Parks Limited
              </h1>
              <p className="text-xs text-muted-foreground">
                Enterprise Facility Management
              </p>
            </div>
          </div>

          {/* Center: Filters */}
          <div className="flex items-center gap-2 flex-1 justify-center max-w-3xl">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              {/* Date Range Select */}

              <Select
                value={filters.date_range}
                onValueChange={(value) =>
                  updateFilter("date_range", value as typeof filters.date_range)
                }
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>

                <SelectContent>
                  {Object.entries(dateRangeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.date_range === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.from_date || ""}
                    onChange={(e) => updateFilter("from_date", e.target.value)}
                    className="h-8 text-xs border rounded px-2"
                  />

                  <span className="text-xs text-muted-foreground">to</span>

                  <input
                    type="date"
                    value={filters.to_date || ""}
                    onChange={(e) => updateFilter("to_date", e.target.value)}
                    className="h-8 text-xs border rounded px-2"
                  />
                </div>
              )}
            </div>

            {/* Group Filter */}
            <Select
              value={filters.group_id || "all"}
              onValueChange={(value) =>
                updateFilter("group_id", value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Groups
                </SelectItem>
                {groups.map((group) => (
                  <SelectItem
                    key={group.id}
                    value={group.id}
                    className="text-xs"
                  >
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Site Filter */}
            <Select
              value={filters.site_id || "all"}
              onValueChange={(value) =>
                updateFilter("site_id", value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all" className="text-xs">
                  All Sites
                </SelectItem>
                {sites
                  .filter(
                    (site) =>
                      !filters.group_id || site.group_id === filters.group_id,
                  )
                  .map((site) => (
                    <SelectItem
                      key={site.id}
                      value={site.id}
                      className="text-xs"
                    >
                      {site.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.category_id || "all"}
              onValueChange={(value) =>
                updateFilter("category_id", value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Categories
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Vendor Filter */}
            <Select
              value={filters.vendor_id || "all"}
              onValueChange={(value) =>
                updateFilter("vendor_id", value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Vendors
                </SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem
                    key={vendor.id}
                    value={vendor.id}
                    className="text-xs"
                  >
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset & More */}
            <div className="flex items-center gap-1">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 px-2 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-2xs">
                    {activeFilterCount}
                  </Badge>
                </Button>
              )}
            </div>
          </div>

          {/* Right: Role Switcher & Settings */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
              {(["ceo", "fm_head", "ops"] as const).map((role) => (
                <Button
                  key={role}
                  variant={currentRole === role ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-medium",
                    currentRole === role && "shadow-sm",
                  )}
                  onClick={() => setCurrentRole(role)}
                >
                  {role === "ceo"
                    ? "CEO"
                    : role === "fm_head"
                      ? "FM Head"
                      : "Ops"}
                </Button>
              ))}
            </div>
            {/* <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        {/* Bottom sub-row: Last Updated + Global Refresh */}
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-dashed border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : 'Loading dashboard data…'}
            </span>
            {isFetching && (
              <RefreshCw className="h-3 w-3 animate-spin text-primary" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
