import { Shift } from "@/types/shift.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { DataTable } from "../shared/data-table";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { useRouter } from "next/navigation";

interface ShiftListProps {
  shifts: Shift[];
  deleteClick: (shift: Shift) => void;
  onShiftSelect?: (shift: Shift) => void;
  selectedShiftId?: string;
  onEditClick?: (shift: Shift) => void;
}

const ShiftList = ({
  shifts,
  deleteClick,
  onShiftSelect,
  selectedShiftId,
  onEditClick,
}: ShiftListProps) => {
  const router = useRouter();

  const columns: ColumnDef<Shift>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-sm font-medium">Name</div>,
    },
    {
      accessorKey: "shiftTime",
      header: () => <div className="text-sm font-medium">Shift Hours</div>,
      cell: ({ row }) => {
        return (
          <p>
            {row.original.shiftStart} - {row.original.shiftEnd}
          </p>
        );
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
              onClick={(e) => {
                e.stopPropagation();
                deleteClick(row.original);
              }}
            >
              <MdDelete size={20} className="text-red-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="p-2"
              onClick={(e) => {
                e.stopPropagation();
                if (onEditClick) {
                  onEditClick(row.original);
                } else if (onShiftSelect) {
                  // Otherwise just select the shift in the current view
                  onShiftSelect(row.original);
                }
              }}
            >
              <FaArrowRight
                size={20}
                className={`${
                  selectedShiftId === row.original.id
                    ? "text-blue-600"
                    : "text-[#6950E8]"
                }`}
              />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={shifts}
      onRowClick={(row) => onShiftSelect && onShiftSelect(row)}
      selectedRowId={selectedShiftId}
    />
  );
};

export default ShiftList;
