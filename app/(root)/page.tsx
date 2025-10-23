"use client";
import React, { useEffect, useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import LoadingUi from "@/components/shared/loading-ui";
import { Home as HomeIcon, MapPin, Server, Network, GripVertical } from "lucide-react";
import ControllerDetailDrawer from "@/components/home/controller-detail-drawer";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Controller {
  id: string;
  name: string;
  model?: string;
  ipAddress: string;
  status: string;
  location?: string;
  application?: string;
}

interface CellWithControllers {
  id: string;
  name: string;
  status: string;
  lineId: string;
  controllers: Controller[];
}

interface LineHierarchy {
  id: string;
  name: string;
  status: string;
  factoryName: string;
  cells: CellWithControllers[];
}


const SortableTableRow = ({
  controller,
  cellName,
  isFirstRow,
  rowSpan,
  onControllerClick,
}: {
  controller: Controller;
  cellName: string;
  isFirstRow: boolean;
  rowSpan: number;
  onControllerClick: (controller: Controller) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: controller.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      {isFirstRow && (
        <td
          rowSpan={rowSpan}
          className="px-6 py-4 font-bold text-gray-900 bg-gray-50/50 border-r border-gray-300"
        >
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#6950e8] transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            {cellName}
          </div>
        </td>
      )}
      <td className="px-6 py-4 border-r border-gray-300">
        <button
          onClick={() => onControllerClick(controller)}
          className="text-sm font-semibold text-[#6950e8] hover:text-[#592be7] transition-all duration-200 hover:underline underline-offset-2 cursor-pointer bg-transparent border-none p-0 m-0"
        >
          {controller.name}
        </button>
      </td>
      <td className="px-6 py-4 border-r border-gray-300">
        <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 uppercase">
          {controller.model || "N/A"}
        </span>
      </td>
      <td className="px-6 py-4 border-r border-gray-300">
        <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
          {controller.ipAddress}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 uppercase">
          {controller.application || "N/A"}
        </span>
      </td>
    </tr>
  );
};


const CellTable = ({ 
  cell,
  onControllerClick 
}: { 
  cell: CellWithControllers;
  onControllerClick: (controller: Controller) => void;
}) => {
  const [controllers, setControllers] = useState(cell.controllers);
  const [activeId, setActiveId] = useState<string | null>(null);

  React.useEffect(() => {
    setControllers(cell.controllers);
  }, [cell.controllers]);

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
      setControllers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                Cell Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                Controller
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                Controller Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                IP Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                Application
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            <SortableContext
              items={controllers.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {controllers.map((controller, index) => (
                <SortableTableRow
                  key={controller.id}
                  controller={controller}
                  cellName={cell.name}
                  isFirstRow={index === 0}
                  rowSpan={controllers.length}
                  onControllerClick={onControllerClick}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-2xl border-2 border-[#6950e8] rounded-lg p-4 opacity-90">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-[#6950e8]" />
              <span className="font-semibold text-gray-900">
                {controllers.find((c) => c.id === activeId)?.name}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Sortable Line Block Component
const SortableLineBlock = ({ 
  line,
  onControllerClick 
}: { 
  line: LineHierarchy;
  onControllerClick: (controller: Controller) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {line.cells.map((cell) => (
        <div
          key={cell.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-4"
        >
          {/* Header - Light and clean */}
          <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#6950e8] transition-colors"
              >
                <GripVertical className="h-6 w-6" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#6950e8]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#6950e8]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Factory {line.factoryName} / Line {line.name}
              </h2>
            </div>
          </div>

          {cell.controllers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No controllers in this cell</p>
            </div>
          ) : (
            <CellTable cell={cell} onControllerClick={onControllerClick} />
          )}
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [lines, setLines] = useState<LineHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  
  // Drawer state for controller details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedController, setSelectedController] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/home/hierarchy");

      if (!response.ok) {
        throw new Error("Failed to fetch hierarchy");
      }

      const data: LineHierarchy[] = await response.json();
      setLines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

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

  const handleLineDragStart = (event: DragStartEvent) => {
    setActiveLineId(event.active.id as string);
  };

  const handleLineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLines((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveLineId(null);
  };

  const handleControllerClick = (controller: Controller) => {
    setSelectedController({
      id: controller.id,
      name: controller.name,
    });
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Clear selected controller after animation
    setTimeout(() => setSelectedController(null), 300);
  };


  if (error) {
    return (
      <>
        <LoadingUi isLoading={isLoading} />
        <PageWrapper
          shownHeaderButton={false}
          pageTitle="Home"
          icon={<HomeIcon size={24} color="#6950e8" />}
        >
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  const activeLine = activeLineId
    ? lines.find((line) => line.id === activeLineId)
    : null;

  return (
    <>
      <LoadingUi isLoading={isLoading} />
      <PageWrapper
        shownHeaderButton={false}
        pageTitle="Home"
        icon={<HomeIcon size={24} color="#6950e8" />}
      >
        {lines.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No production lines configured</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleLineDragStart}
            onDragEnd={handleLineDragEnd}
          >
            <SortableContext
              items={lines.map((line) => line.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {lines.map((line) => (
                  <SortableLineBlock 
                    key={line.id} 
                    line={line}
                    onControllerClick={handleControllerClick}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeLine ? (
                <div className="bg-white shadow-2xl border-4 border-[#6950e8] rounded-xl p-6 opacity-95">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-6 w-6 text-[#6950e8]" />
                    <div className="w-10 h-10 rounded-lg bg-[#6950e8]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#6950e8]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Factory {activeLine.factoryName} / Line {activeLine.name}
                    </h2>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Controller Detail Drawer */}
        <ControllerDetailDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          controllerId={selectedController?.id || null}
          controllerName={selectedController?.name}
        />
      </PageWrapper>
    </>
  );
};

export default HomePage;
