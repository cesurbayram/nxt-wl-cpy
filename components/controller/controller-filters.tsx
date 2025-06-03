"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Zap,
  Settings,
  MapPin,
  Hash,
  Network,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Controller } from "@/types/controller.types";

export interface FilterOptions {
  search: string;
  model: string;
  application: string;
  status: string;
  connection: string;
  location: string;
  serialNumber: string;
  ipAddress: string;
}

interface ControllerFiltersProps {
  controllers: Controller[];
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const ControllerFilters = ({
  controllers,
  onFilterChange,
  onReset,
}: ControllerFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    model: "",
    application: "",
    status: "",
    connection: "",
    location: "",
    serialNumber: "",
    ipAddress: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filterOptions = React.useMemo(() => {
    const locations = Array.from(
      new Set(controllers.map((c) => c.location).filter(Boolean))
    );

    return {
      models: [
        { value: "yrc1000", label: "YRC1000" },
        { value: "yrc1000m", label: "YRC1000M" },
        { value: "dx200", label: "DX200" },
        { value: "dx100", label: "DX100" },
        { value: "fs100", label: "FS100" },
      ],

      applications: [
        { value: "arc", label: "ARC" },
        { value: "handling", label: "HANDLING" },
        { value: "spot", label: "SPOT" },
        { value: "general", label: "GENERAL" },
        { value: "paint", label: "PAINT" },
      ],

      statuses: [
        { value: "active", label: "ACTIVE" },
        { value: "passive", label: "PASSIVE" },
      ],
      connections: [
        { value: "connected", label: "Connected" },
        { value: "disconnected", label: "Disconnected" },
      ],

      locations: locations.map((location) => ({
        value: location || "unknown",
        label: location || "Unknown",
      })),
    };
  }, [controllers]);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const filterValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterOptions = {
      search: "",
      model: "",
      application: "",
      status: "",
      connection: "",
      location: "",
      serialNumber: "",
      ipAddress: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onReset();
    setShowAdvanced(false);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== ""
  ).length;

  const FilterBadges = () => {
    const activeBadges: Array<{
      key: keyof FilterOptions;
      label: string;
      value: string;
    }> = [];

    if (filters.search)
      activeBadges.push({
        key: "search",
        label: "Search",
        value: filters.search,
      });
    if (filters.model)
      activeBadges.push({
        key: "model",
        label: "Model",
        value: filters.model.toUpperCase(),
      });
    if (filters.application)
      activeBadges.push({
        key: "application",
        label: "App",
        value: filters.application.toUpperCase(),
      });
    if (filters.status)
      activeBadges.push({
        key: "status",
        label: "Status",
        value: filters.status,
      });
    if (filters.connection)
      activeBadges.push({
        key: "connection",
        label: "Connection",
        value: filters.connection,
      });
    if (filters.location)
      activeBadges.push({
        key: "location",
        label: "Location",
        value: filters.location,
      });
    if (filters.ipAddress)
      activeBadges.push({
        key: "ipAddress",
        label: "IP",
        value: filters.ipAddress,
      });
    if (filters.serialNumber)
      activeBadges.push({
        key: "serialNumber",
        label: "Serial",
        value: filters.serialNumber,
      });

    if (activeBadges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-sm font-medium text-muted-foreground">
          Active filters:
        </span>
        {activeBadges.map((badge) => (
          <Badge key={badge.key} variant="secondary" className="gap-1">
            {badge.label}: {badge.value}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => updateFilter(badge.key, "all")}
            />
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-6 px-2 text-xs"
        >
          Clear all
        </Button>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search controllers by name, IP, location..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {filterOptions.statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.connection || "all"}
              onValueChange={(value) => updateFilter("connection", value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Connection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Connections</SelectItem>
                {filterOptions.connections.map((conn) => (
                  <SelectItem key={conn.value} value={conn.value}>
                    {conn.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Advanced Filters</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Model
                      </label>
                      <Select
                        value={filters.model || "all"}
                        onValueChange={(value) => updateFilter("model", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Models" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Models</SelectItem>
                          {filterOptions.models.map((model) => (
                            <SelectItem
                              key={model.value}
                              value={model.value || "unknown"}
                            >
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Application
                      </label>
                      <Select
                        value={filters.application || "all"}
                        onValueChange={(value) =>
                          updateFilter("application", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Applications" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Applications</SelectItem>
                          {filterOptions.applications.map((app) => (
                            <SelectItem
                              key={app.value}
                              value={app.value || "unknown"}
                            >
                              {app.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Location
                      </label>
                      <Select
                        value={filters.location || "all"}
                        onValueChange={(value) =>
                          updateFilter("location", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {filterOptions.locations.map((location) => (
                            <SelectItem
                              key={location.value}
                              value={location.value || "unknown"}
                            >
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        IP Address
                      </label>
                      <div className="relative">
                        <Network className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Filter by IP address..."
                          value={filters.ipAddress}
                          onChange={(e) =>
                            updateFilter("ipAddress", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Serial Number
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Filter by serial number..."
                          value={filters.serialNumber}
                          onChange={(e) =>
                            updateFilter("serialNumber", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <FilterBadges />
      </CardContent>
    </Card>
  );
};

export default ControllerFilters;
