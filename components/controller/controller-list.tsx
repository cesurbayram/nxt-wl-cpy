import { Robot } from "@/types/robot.types"
import { ColumnDef } from "@tanstack/react-table"
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
import Link from "next/link";


interface ControllerListProps {
    controllers: Robot[]
}

const ControllerList = ({ controllers }: ControllerListProps) => {
    
    const columns: ColumnDef<Robot>[] = [
        {
            accessorKey: 'name',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Name</h1>
            ),            
        },
        {
            accessorKey: 'statusBar',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Status</h1>
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-1 items-center">
                        <RiAlarmWarningLine 
                            color={row.original.controllerStatus?.alarm ? 'green' : '#eee'} 
                            size={30}
                        />
                        <BsDoorOpen
                            color={row.original.controllerStatus?.doorOpen ? 'green' : 'gray'}
                            size={30}
                        />
                        <MdErrorOutline
                            color={row.original.controllerStatus?.error ? 'red' : 'gray'}
                            size={30}
                        />
                        <MdOutlinePlayCircle
                            color={row.original.controllerStatus?.hold ? 'green' : 'gray'}
                            size={30}
                        />
                        <GiRobotLeg
                            color={row.original.controllerStatus?.operating ? 'green' : 'gray'}
                            size={30} 
                        />
                        <MdOutlineSignalCellularAlt 
                            color={row.original.controllerStatus?.safeSpeed ? 'green' : 'gray'}
                            size={30} 
                        />
                        <PiLightning
                            color={row.original.controllerStatus?.servo ? 'green' : 'gray'}
                            size={30}
                        />
                        <IoWarningOutline
                            color={row.original.controllerStatus?.stop ? 'green' : 'gray'}
                            size={30}
                        />
                        <FaRegHandLizard
                            color="green"
                            size={30}
                        />
                        <GrPowerCycle
                            color="green"
                            size={30} 
                        />

                    </div>
                )
            }
        },
        {
            accessorKey: 'ipAddress',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">IP Address</h1>
            )
        },
        {
            accessorKey: 'location',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Location</h1>
            )
        },
        {
            accessorKey: 'model',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Model</h1>
            )
        },
        {
            accessorKey: 'maintenance',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Maintenance</h1>
            )
        },
        {
            id: 'actions',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Actions</h1>
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-3">
                        <Button
                            size="icon"
                            variant="ghost"
                            
                        >
                            <MdDelete size={20} className="text-red-500" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost"
                            asChild 
                        >
                            <Link href={`/controller/${row.original.id}`}>
                                <FaArrowRight size={20} className="text-[#6950E8]" />
                            </Link>
                        </Button>
                    </div>
                );
            },

        }
    ]
    
    return(
        <DataTable columns={columns} data={controllers} />

    )
}

export default ControllerList;