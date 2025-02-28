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

interface ControllerListProps {
  controller: Controller[];
  deleteClick: any;
}

const ControllerList = ({ controller, deleteClick }: ControllerListProps) => {
  const columns: ColumnDef<Controller>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-sm font-medium">Name</div>,
    },
    {
      accessorKey: "statusBar",
      header: () => <div className="text-sm font-medium">Robot Status</div>,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1 items-center">
            <GrConnect
              title="connection"
              color={
                row.original.controllerStatus?.connection ? "green" : "red"
              }
              size={30}
            />
            {row.original.controllerStatus?.teach === "TEACH" && (
              <FaRegHandLizard title="teach" color="green" size={30} />
            )}
            {row.original.controllerStatus?.teach === "PLAY" && (
              <BsTropicalStorm title="play" color="green" size={30} />
            )}
            {row.original.controllerStatus?.teach === "REMOTE" && (
              <FaExternalLinkAlt title="remote" color="green" size={30} />
            )}
            <PiLightning
              title="servo"
              color={row.original.controllerStatus?.servo ? "green" : "gray"}
              size={30}
            />
            <GiRobotGrab
              title="operating"
              color={
                row.original.controllerStatus?.operating ? "green" : "gray"
              }
              size={30}
            />
            {row.original.controllerStatus?.cycle === "CYCLE" && (
              <GrPowerCycle title="cycle" color="green" size={30} />
            )}
            {row.original.controllerStatus?.cycle === "STEP" && (
              <DiSublime title="step" color="green" size={30} />
            )}
            {row.original.controllerStatus?.cycle === "AUTO" && (
              <MdOutlineHdrAuto title="auto" color="green" size={30} />
            )}
            <FaRegStopCircle
              title="hold"
              color={row.original.controllerStatus?.hold ? "#F1C40F" : "gray"}
              size={30}
            />
            <RiAlarmWarningLine
              title="alarm"
              color={row.original.controllerStatus?.alarm ? "red" : "gray"}
              size={35}
            />
            <BiError
              title="error"
              color={row.original.controllerStatus?.error ? "red" : "gray"}
              size={30}
            />
            <BsSignStopFill
              title="stop"
              color={row.original.controllerStatus?.stop ? "red" : "lightgray"}
              size={30}
            />
            <BsDoorOpen
              title="door open"
              color={row.original.controllerStatus?.doorOpen ? "red" : "gray"}
              size={30}
            />
            {/* <MdOutlineSignalCellularAlt
              color={
                row.original.controllerStatus?.safeSpeed ? "green" : "gray"
              }
              size={30}
            /> */}
            <DiBootstrap
              title="backup"
              color={
                row.original.controllerStatus?.cBackup ? "green" : "lightgray"
              }
              size={40}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: () => <div className="text-sm font-medium">Controller Type</div>,
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
        return <p>{model}</p>;
      },
    },
    {
      accessorKey: "application",
      header: () => <div className="text-sm font-medium">Application</div>,
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
        return <p>{application}</p>;
      },
    },

    {
      accessorKey: "ipAddress",
      header: () => <div className="text-sm font-medium">IP Address</div>,
    },
    {
      accessorKey: "location",
      header: () => <div className="text-sm font-medium">Location</div>,
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
          <div className="flex justify-center items-center gap-4 h-full">
            <Button
              size="icon"
              variant="ghost"
              className="p-2"
              onClick={async () => {
                await deleteClick({ id: row.original.id });
              }}
            >
              <MdDelete size={20} className="text-red-500" />
            </Button>
            <Button size="icon" variant="ghost" className="p-2" asChild>
              <Link href={`/controller/${row.original.id}`}>
                <FaArrowRight size={20} className="text-[#6950E8]" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={controller} />;
};

export default ControllerList;
