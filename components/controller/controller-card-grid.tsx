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
  Eye,
  Wrench,
  Sliders,
  GripVertical,
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ControllerCardGridProps {
  controllers: Controller[];
  deleteClick: (controller: Controller) => void;
  onReorder?: (controllers: Controller[]) => void;
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

  // Sortable Card Component
  const SortableCard = ({ controller }: { controller: Controller }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: controller.id || '' });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style}>
        <Card className="hover:shadow-lg transition-all duration-200 group">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2 flex-1">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-[#6950e8] transition-colors"
                >
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">IP Address</p>
                  <p className="font-mono text-sm break-all">{controller.ipAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="truncate text-sm">{controller.location}</p>
                </div>
              </div>

              <StatusIndicators controller={controller} />

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-[#6950e8] hover:text-white text-xs sm:text-sm flex-1 min-w-[100px]"
                >
                  <Link href={`/controller/${controller.id}/details`}>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="sm:hidden">Details</span>
                    <span className="hidden sm:inline">View Details</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-[#6950e8]/80 hover:text-white text-xs sm:text-sm flex-1 min-w-[100px]"
                >
                  <Link href={`/controller/${controller.id}/configuration`}>
                    <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Configure
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-[#6950e8]/60 hover:text-white text-xs sm:text-sm flex-1 min-w-[100px]"
                >
                  <Link href={`/controller/${controller.id}/advanced`}>
                    <Sliders className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Advanced
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteClick(controller);
                  }}
                  className="hover:bg-red-500 hover:text-white text-red-600 w-full"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(controllers);

  React.useEffect(() => {
    setItems(controllers);
  }, [controllers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems;
      });
    }

    setActiveId(null);
  };

  const activeController = activeId
    ? items.find((item) => item.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((c) => c.id || '')} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {items.map((controller) => (
            <SortableCard key={controller.id} controller={controller} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeController ? (
          <Card className="shadow-2xl opacity-90 rotate-3">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-[#6950e8] mt-1" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {activeController.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getModelDisplay(activeController.model)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getApplicationDisplay(activeController.application)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ControllerCardGrid;
