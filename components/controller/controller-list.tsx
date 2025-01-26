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
import Link from "next/link";

interface ControllerListProps {
  controller: Controller[];
  deleteClick: any;
}

const ControllerList = ({ controller, deleteClick }: ControllerListProps) => {
  const columns: ColumnDef<Controller>[] = [
    {
      accessorKey: "name",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Name</h1>
      ),
    },
    {
      accessorKey: "statusBar",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Robot Status</h1>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-1 items-center">
            <RiAlarmWarningLine
              title="alarm"
              color={row.original.controllerStatus?.alarm ? "green" : "gray"}
              size={30}
            />
            <BsDoorOpen
              title="door open"
              color={row.original.controllerStatus?.doorOpen ? "green" : "gray"}
              size={30}
            />
            <MdErrorOutline
              title="error"
              color={row.original.controllerStatus?.error ? "red" : "gray"}
              size={30}
            />
            <MdOutlinePlayCircle
              title="hold"
              color={row.original.controllerStatus?.hold ? "green" : "gray"}
              size={30}
            />
            <GiRobotLeg
              title="operating"
              color={
                row.original.controllerStatus?.operating ? "green" : "gray"
              }
              size={30}
            />
            {/* <MdOutlineSignalCellularAlt
              color={
                row.original.controllerStatus?.safeSpeed ? "green" : "gray"
              }
              size={30}
            /> */}
            <PiLightning
              title="servo"
              color={row.original.controllerStatus?.servo ? "green" : "gray"}
              size={30}
            />
            <IoWarningOutline
              title="stop"
              color={row.original.controllerStatus?.stop ? "green" : "gray"}
              size={30}
            />
            {row.original.controllerStatus?.teach === "TEACH" && (
              <FaRegHandLizard title="teach" color="green" size={30} />
            )}
            {row.original.controllerStatus?.teach === "PLAY" && (
              <BsTropicalStorm title="play" color="green" size={30} />
            )}
            {row.original.controllerStatus?.teach === "REMOTE" && (
              <FaExternalLinkAlt title="remote" color="purple" size={30} />
            )}
            {row.original.controllerStatus?.cycle === "CYCLE" && (
              <GrPowerCycle title="cycle" color="green" size={30} />
            )}
            {row.original.controllerStatus?.cycle === "STEP" && (
              <DiSublime title="step" color="green" size={30} />
            )}
            {row.original.controllerStatus?.cycle === "AUTO" && (
              <MdOutlineHdrAuto title="auto" color="green" size={30} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">
          Controller Type
        </h1>
      ),
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
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Application</h1>
      ),
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
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">IP Address</h1>
      ),
    },
    // {
    //     accessorKey: 'location',
    //     header: () => (
    //         <h1 className="text-sm text-[#111827] font-semibold">Location</h1>
    //     )
    // },
    // {
    //     accessorKey: 'maintenance',
    //     header: () => (
    //         <h1 className="text-sm text-[#111827] font-semibold">Maintenance</h1>
    //     )
    // },
    {
      accessorKey: "status",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Status</h1>
      ),
      cell: ({ row }) => {
        const status = row.original.status === "active" ? "Active" : "Passive";
        return <p>{status}</p>;
      },
    },
    {
      id: "actions",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold text-center">
          Actions
        </h1>
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
