import { Alarm } from "@/types/alarm.types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";

interface AlarmListProps {
  alarms: Alarm[];
  activeTab: string;
  ipAddress: string;
  name: string;
  activeType?: string;
}

const AlarmList = ({
  alarms,
  activeTab,
  ipAddress,
  name,
  activeType,
}: AlarmListProps) => {
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
          { accessorKey: "text", header: "Text" },
          { accessorKey: "originDate", header: "Origin Date" },
        ]),
  ];

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleExportExcel = () => {
    const excelData = alarms.map((alarm) => {
      const row: { [key: string]: string } = {};

      columns.forEach((col: any) => {
        const value = alarm[col.accessorKey as keyof Alarm];

        if (col.accessorKey === "originDate" && value) {
          row[col.header] = formatDate(value as string);
        } else {
          row[col.header] = value ? String(value) : "";
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    const maxWidth = 20;
    const wscols = columns.map(() => ({ wch: maxWidth }));
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Alarms");

    const timestamp = new Date().toISOString().split("T")[0];
    let fileName = "";

    if (activeTab === "almhist") {
      fileName = `${name}_${ipAddress}_${timestamp}_${activeType?.toLowerCase()}_${activeTab}.xlsx`;
    } else {
      fileName = `${name}_${ipAddress}_${timestamp}_${activeTab}.xlsx`;
    }

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-4">
      {alarms.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiDownload className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      )}
      <DataTable columns={columns} data={alarms} />
    </div>
  );
};

export default AlarmList;
