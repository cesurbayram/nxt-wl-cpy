import { Controller } from "@/types/controller.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { MdDelete } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { DataTable } from "../shared/data-table";
import { RiAlarmWarningLine } from "react-icons/ri";
import { BsDoorOpen } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";
import { MdOutlinePlayCircle } from "react-icons/md";
import { GiRobotLeg } from "react-icons/gi";
import { MdOutlineSignalCellularAlt } from "react-icons/md";
import { PiLightning } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { FaRegHandLizard } from "react-icons/fa6";
import { GrPowerCycle } from "react-icons/gr";
import { MdOutlineHdrAuto } from "react-icons/md";
import { DiSublime } from "react-icons/di";
import { BsTropicalStorm } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";
import { DiBootstrap } from "react-icons/di";
import { BsSignStopFill } from "react-icons/bs";
import { GrConnect } from "react-icons/gr";
import Link from "next/link";
import { BiError } from "react-icons/bi";
import { GiRobotGrab } from "react-icons/gi";
import { FaRegStopCircle } from "react-icons/fa";
import { Card, CardContent } from "../ui/card";

interface ControllerListProps {
  controller: Controller[];
  deleteClick: any;
}

const ControllerList = ({ controller, deleteClick }: ControllerListProps) => {
  const columns: ColumnDef<Controller>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-sm font-medium">Name</div>,
      cell: ({ row }) => {
        return (
          <div className="min-w-0">
            <p className="font-medium truncate">{row.original.name}</p>
            <div className="md:hidden text-xs text-gray-500 mt-1">
              <p>{row.original.model?.toUpperCase()}</p>
              <p>{row.original.application?.toUpperCase()}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "statusBar",
      header: () => <div className="text-sm font-medium">Robot Status</div>,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1 items-center flex-wrap max-w-[200px] sm:max-w-none">
            <GrConnect
              title="connection"
              color={
                row.original.controllerStatus?.connection ? "green" : "red"
              }
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            {row.original.controllerStatus?.teach === "TEACH" && (
              <FaRegHandLizard title="teach" color="green" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
            {row.original.controllerStatus?.teach === "PLAY" && (
              <BsTropicalStorm title="play" color="green" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
            {row.original.controllerStatus?.teach === "REMOTE" && (
              <FaExternalLinkAlt title="remote" color="green" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
            <PiLightning
              title="servo"
              color={row.original.controllerStatus?.servo ? "green" : "gray"}
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            <GiRobotGrab
              title="operating"
              color={
                row.original.controllerStatus?.operating ? "green" : "gray"
              }
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            {row.original.controllerStatus?.cycle === "CYCLE" && (
              <GrPowerCycle title="cycle" color="green" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
            {row.original.controllerStatus?.cycle === "STEP" && (
              <DiSublime title="step" color="green" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
            {row.original.controllerStatus?.cycle === "AUTO" && (
              <MdOutlineHdrAuto title="auto" color="green" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
            <FaRegStopCircle
              title="hold"
              color={row.original.controllerStatus?.hold ? "#F1C40F" : "gray"}
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            <RiAlarmWarningLine
              title="alarm"
              color={row.original.controllerStatus?.alarm ? "red" : "gray"}
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            <BiError
              title="error"
              color={row.original.controllerStatus?.error ? "red" : "gray"}
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            <BsSignStopFill
              title="stop"
              color={row.original.controllerStatus?.stop ? "red" : "lightgray"}
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            <BsDoorOpen
              title="door open"
              color={row.original.controllerStatus?.doorOpen ? "red" : "gray"}
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
            <DiBootstrap
              title="backup"
              color={
                row.original.controllerStatus?.cBackup ? "green" : "lightgray"
              }
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: () => <div className="text-sm font-medium hidden lg:block">Controller Type</div>,
      cell: ({ row }) => {
        const model =
          row.original.model === "yrc1000"
            ? "YRC1000"
            : row.original.model === "yrc1000m"
            ? "YRC1000m"
            : row.original.model === "dx200"
            ? "DX200"
            : row.original.model === "dx100"
            ? "DX100"
            : row.original.model === "fs100"
            ? "FS100"
            : "Unknown Model";
        return <p className="hidden lg:block">{model}</p>;
      },
    },
    {
      accessorKey: "application",
      header: () => <div className="text-sm font-medium hidden md:block">Application</div>,
      cell: ({ row }) => {
        const application =
          row.original.application === "arc"
            ? "ARC"
            : row.original.application === "handling"
            ? "HANDLING"
            : row.original.application === "spot"
            ? "SPOT"
            : row.original.application === "general"
            ? "GENERAL"
            : row.original.application === "paint"
            ? "PAINT"
            : "Unknown Application";
        return <p className="hidden md:block">{application}</p>;
      },
    },

    {
      accessorKey: "ipAddress",
      header: () => <div className="text-sm font-medium hidden xl:block">IP Address</div>,
      cell: ({ row }) => {
        return <p className="hidden xl:block font-mono text-sm">{row.original.ipAddress}</p>;
      },
    },
    {
      accessorKey: "location",
      header: () => <div className="text-sm font-medium hidden lg:block">Location</div>,
      cell: ({ row }) => {
        return <p className="hidden lg:block">{row.original.location}</p>;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-sm font-medium">Status</div>,
      cell: ({ row }) => {
        const status = row.original.status === "active" ? "Active" : "Passive";
        return <p>{status}</p>;
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-sm font-medium text-center">Actions</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center gap-2 sm:gap-4 h-full">
            <Button
              size="icon"
              variant="ghost"
              className="p-1 sm:p-2 h-8 w-8 sm:h-10 sm:w-10"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await deleteClick({ id: row.original.id });
              }}
            >
              <MdDelete size={16} className="text-red-500 sm:w-5 sm:h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="p-1 sm:p-2 h-8 w-8 sm:h-10 sm:w-10" asChild>
              <Link href={`/controller/${row.original.id}/details`}>
                <FaArrowRight size={16} className="text-[#6950E8] sm:w-5 sm:h-5" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <DataTable columns={columns} data={controller} />
        </div>
      </div>
    </div>
  );
};

export default ControllerList;
