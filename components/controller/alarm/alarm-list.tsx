import { Alarm } from "@/types/alarm.types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";

interface AlarmListProps {
  alarms: Alarm[];
  activeTab: string;
}

const AlarmList = ({ alarms, activeTab }: AlarmListProps) => {
  const columns: ColumnDef<Alarm>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    ...(activeTab === "almhist"
      ? [
          { accessorKey: "type", header: "Type" },
          { accessorKey: "name", header: "Name" },
          { accessorKey: "originDate", header: "Origin Date" },
          { accessorKey: "mode", header: "Mode" },
        ]
      : [
          // { accessorKey: "alarm", header: "Alarm" },
          // {
          //   accessorKey: "detected",
          //   header: "Detected",
          //   cell: ({ row }: { row: Row<Alarm> }) => {
          //     const detected = row.getValue("detected");
          //     if (!detected) return "-";

          //     const date = new Date(detected as string);
          //     return date.toLocaleString("en-GB", {
          //       year: "numeric",
          //       month: "2-digit",
          //       day: "2-digit",
          //       hour: "2-digit",
          //       minute: "2-digit",
          //       second: "2-digit",
          //       hour12: false,
          //     });
          //   },
          // },
          // { accessorKey: "removed", header: "Removed" },
          { accessorKey: "text", header: "Text" },
          { accessorKey: "originDate", header: "Origin Date" },
        ]),
  ];

  return <DataTable columns={columns} data={alarms} />;
};

export default AlarmList;
