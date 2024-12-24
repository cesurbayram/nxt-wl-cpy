import { Alarm } from "@/types/alarm.types";
import { ColumnDef } from "@tanstack/react-table";
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
          { accessorKey: "alarm", header: "Alarm" },
          { accessorKey: "detected", header: "Detected" },
          { accessorKey: "removed", header: "Removed" },
          { accessorKey: "text", header: "Text" },
          { accessorKey: "originDate", header: "Origin Date" },
        ]),
  ];

  return <DataTable columns={columns} data={alarms} />;
};

export default AlarmList;
