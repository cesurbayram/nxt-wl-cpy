"use client";
import React from "react";
import { Controller } from "@/types/controller.types";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";

interface ControllerMetricsProps {
  controllers: Controller[];
}

const ControllerMetrics = ({ controllers }: ControllerMetricsProps) => {
  const metrics = React.useMemo(() => {
    const total = controllers.length;
    const connected = controllers.filter(
      (c) => c.controllerStatus?.connection
    ).length;
    const active = controllers.filter((c) => c.status === "active").length;
    const withAlarms = controllers.filter(
      (c) => c.controllerStatus?.alarm
    ).length;
    const withErrors = controllers.filter(
      (c) => c.controllerStatus?.error
    ).length;

    const connectionRate =
      total > 0 ? Math.round((connected / total) * 100) : 0;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      total,
      connected,
      disconnected: total - connected,
      active,
      passive: total - active,
      withAlarms,
      withErrors,
      connectionRate,
      activeRate,
    };
  }, [controllers]);

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    color = "default",
    percentage,
  }: {
    title: string;
    value: number;
    icon: any;
    color?: "default" | "success" | "danger" | "warning";
    percentage?: number;
  }) => {
    const colorClasses = {
      default: "text-[#6950e8] bg-[#6950e8]/10 dark:bg-[#6950e8]/20",
      success: "text-green-500 bg-green-50 dark:bg-green-950",
      danger: "text-red-500 bg-red-50 dark:bg-red-950",
      warning: "text-amber-500 bg-amber-50 dark:bg-amber-950",
    };

    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
              {percentage !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {percentage}% of total
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <MetricCard
        title="Total"
        value={metrics.total}
        icon={Activity}
        color="default"
      />

      <MetricCard
        title="Connected"
        value={metrics.connected}
        icon={CheckCircle}
        color="success"
      />

      <MetricCard
        title="Active"
        value={metrics.active}
        icon={Zap}
        color="success"
      />

      <MetricCard
        title="Passive"
        value={metrics.passive}
        icon={Clock}
        color="warning"
      />

      <MetricCard
        title="Alarms"
        value={metrics.withAlarms}
        icon={AlertTriangle}
        color="danger"
      />

      <MetricCard
        title="Errors"
        value={metrics.withErrors}
        icon={XCircle}
        color="danger"
      />
    </div>
  );
};

export default ControllerMetrics;
