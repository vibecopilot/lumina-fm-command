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
  RotateCcw,
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
    ([key, value]) => {
      if (value == null) return false;
      if (key === "date_range") return value !== "month";
      return true;
    },
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
      <div className="container py-2 sm:py-3">

        {/* ── Row 1: Logo + Title (always visible) ── */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-8 sm:w-16 sm:h-10 rounded-lg shrink-0 overflow-hidden">
              <img
                src="/horizon_industrial_parks_logo.jpeg"
                alt="Horizon Industrial Parks Limited"
                className="w-14 h-[60px] sm:w-12 sm:h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-foreground leading-tight truncate">
                Horizon Industrial Parks Limited
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                Enterprise Facility Management
              </p>
            </div>
          </div>

          {/* Right: Refresh button (always visible) */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin text-primary")} />
            <span className="hidden xs:inline sm:inline">Refresh</span>
          </Button>
        </div>

        {/* ── Row 2: Filters — horizontally scrollable on mobile ── */}
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {/* Date Range */}
          <Select
            value={filters.date_range}
            onValueChange={(value) =>
              updateFilter("date_range", value as typeof filters.date_range)
            }
          >
            <SelectTrigger className="w-32 sm:w-36 h-8 text-xs shrink-0">
              <Calendar className="h-3.5 w-3.5 mr-1 sm:mr-1.5 shrink-0" />
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
            <>
              <input
                type="date"
                value={filters.from_date || ""}
                onChange={(e) => updateFilter("from_date", e.target.value)}
                className="h-8 text-xs border rounded px-2 shrink-0"
              />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <input
                type="date"
                value={filters.to_date || ""}
                onChange={(e) => updateFilter("to_date", e.target.value)}
                className="h-8 text-xs border rounded px-2 shrink-0"
              />
            </>
          )}

          {/* Group Filter */}
          <Select
            value={filters.group_id || "all"}
            onValueChange={(value) =>
              updateFilter("group_id", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-32 sm:w-44 h-8 text-xs shrink-0">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Groups</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id} className="text-xs">
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
            <SelectTrigger className="w-32 sm:w-40 h-8 text-xs shrink-0">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all" className="text-xs">All Sites</SelectItem>
              {sites
                .filter(
                  (site) =>
                    !filters.group_id || site.group_id === filters.group_id,
                )
                .map((site) => (
                  <SelectItem key={site.id} value={site.id} className="text-xs">
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
            <SelectTrigger className="w-28 sm:w-32 h-8 text-xs shrink-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Categories</SelectItem>
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
            <SelectTrigger className="w-28 sm:w-36 h-8 text-xs shrink-0">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Vendors</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id} className="text-xs">
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-2xs">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* ── Row 3: Last Updated ── */}
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-dashed border-border/50 gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <span className="truncate">
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : "Loading dashboard data…"}
            </span>
            {isFetching && (
              <RefreshCw className="h-3 w-3 animate-spin text-primary shrink-0" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
