import { Alarm } from "@/types/alarm.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { GoDeviceCameraVideo } from "react-icons/go";
import { DataTable } from "../../shared/data-table";
import { GoDotFill } from "react-icons/go";

interface AlarmListProps {
  alarms: Alarm[];
  activeTab: string;
}

const AlarmList = ({ alarms, activeTab }: AlarmListProps) => {
  const columns: ColumnDef<Alarm>[] = [
    {
      accessorKey: "code",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Code</h1>
      ),
    },
    {
      accessorKey: "alarm",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Alarm</h1>
      ),
    },
    ...(activeTab === "detected"
      ? [
          {
            accessorKey: "detected",
            header: () => (
              <h1 className="text-sm text-[#111827] font-semibold">Detected</h1>
            ),
          },
          {
            accessorKey: "removed",
            header: () => (
              <h1 className="text-sm text-[#111827] font-semibold">Removed</h1>
            ),
          },
        ]
      : []),
    {
      accessorKey: "text",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Text</h1>
      ),
    },
    {
      accessorKey: "originDate",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Origin Date</h1>
      ),
    },
    // {
    //   accessorKey: "priority",
    //   header: () => (
    //     <h1 className="text-sm text-[#111827] font-semibold">Priority</h1>
    //   ),
    //   cell: ({ row }) => {
    //     if (row.original.priority === 1) {
    //       return <GoDotFill color="red" size={20} />;
    //     } else if (row.original.priority === 2) {
    //       return <GoDotFill color="#f7b50f" size={20} />;
    //     } else if (row.original.priority === 3) {
    //       return <GoDotFill color="green" size={20} />;
    //     }
    //   },
    // },
    // {
    //     id: 'actions',
    //     header: () => (
    //         <h1 className="text-sm text-[#111827] font-semibold">Actions</h1>
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="flex justify-center gap-3">
    //                 <Button
    //                     size="icon"
    //                     variant="ghost"

    //                 >
    //                     <GoDeviceCameraVideo size={20} />
    //                 </Button>
    //             </div>
    //         );
    //     },
    // }
  ];

  return <DataTable columns={columns} data={alarms} />;
};

export default AlarmList;
