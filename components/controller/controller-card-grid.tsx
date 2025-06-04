"use client";
import React, { useState } from "react";
import { Controller } from "@/types/controller.types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Edit,
  Trash2,
  Power,
  Settings,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { GrConnect } from "react-icons/gr";
import {
  FaRegHandLizard,
  FaExternalLinkAlt,
  FaArrowRight,
} from "react-icons/fa";
import { BsTropicalStorm } from "react-icons/bs";
import { PiLightning } from "react-icons/pi";
import { GiRobotGrab } from "react-icons/gi";
import { RiAlarmWarningLine } from "react-icons/ri";
import { BiError } from "react-icons/bi";
import { BsSignStopFill } from "react-icons/bs";
import { FaRegStopCircle } from "react-icons/fa";
import Link from "next/link";

interface ControllerCardGridProps {
  controllers: Controller[];
  deleteClick: (controller: Controller) => void;
}

const ControllerCardGrid = ({
  controllers,
  deleteClick,
}: ControllerCardGridProps) => {
  const [selectedControllers, setSelectedControllers] = useState<string[]>([]);

  const getStatusColor = (status?: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const getStatusText = (status?: string) => {
    return status === "active" ? "Active" : "Passive";
  };

  const getModelDisplay = (model?: string) => {
    const modelMap: { [key: string]: string } = {
      yrc1000: "YRC1000",
      yrc1000m: "YRC1000m",
      dx200: "DX200",
      dx100: "DX100",
      fs100: "FS100",
    };
    return modelMap[model || ""] || "Unknown";
  };

  const getApplicationDisplay = (application?: string) => {
    const appMap: { [key: string]: string } = {
      arc: "ARC",
      handling: "HANDLING",
      spot: "SPOT",
      general: "GENERAL",
      paint: "PAINT",
    };
    return appMap[application || ""] || "Unknown";
  };

  const StatusIndicators = ({ controller }: { controller: Controller }) => {
    const status = controller.controllerStatus;

    return (
      <div className="flex flex-wrap gap-1 mt-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
          <GrConnect color={status?.connection ? "green" : "red"} size={16} />
          <span className="text-xs font-medium">
            {status?.connection ? "Connected" : "Disconnected"}
          </span>
        </div>

        {status?.teach && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900">
            {status.teach === "TEACH" && (
              <FaRegHandLizard color="green" size={14} />
            )}
            {status.teach === "PLAY" && (
              <BsTropicalStorm color="green" size={14} />
            )}
            {status.teach === "REMOTE" && (
              <FaExternalLinkAlt color="green" size={14} />
            )}
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              {status.teach}
            </span>
          </div>
        )}

        {status?.alarm && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900">
            <RiAlarmWarningLine color="red" size={14} />
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              Alarm
            </span>
          </div>
        )}

        {status?.error && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900">
            <BiError color="red" size={14} />
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              Error
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {controllers.map((controller) => (
        <Card
          key={controller.id}
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {controller.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getModelDisplay(controller.model)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getApplicationDisplay(controller.application)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={getStatusColor(controller.status)}
                  className={`text-xs ${
                    controller.status === "active"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {getStatusText(controller.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono">{controller.ipAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="truncate">{controller.location}</p>
                </div>
              </div>

              <StatusIndicators controller={controller} />

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hover:bg-[#6950e8] hover:text-white"
                  >
                    <Link href={`/controller/${controller.id}`}>
                      View Details
                      <FaArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hover:bg-[#6950e8]/80 hover:text-white"
                  >
                    <Link href={`/controller/${controller.id}?tab=update`}>
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Link>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteClick(controller)}
                  className="hover:bg-red-500 hover:text-white text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ControllerCardGrid;
