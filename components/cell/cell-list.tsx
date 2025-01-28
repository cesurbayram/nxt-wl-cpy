import { Cell } from "@/types/cell.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { FaArrowRight } from "react-icons/fa6";
import { DataTable } from "../shared/data-table";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";

interface CellListProps {
  cell: Cell[];
  deleteClick: any;
}

const CellList = ({ cell, deleteClick }: CellListProps) => {
  const router = useRouter();

  const columns: ColumnDef<Cell>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-sm font-medium">Name</div>,
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
          <div className="flex justify-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={async () => {
                await deleteClick({ id: row.original.id });
              }}
            >
              <MdDelete size={20} className="text-red-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push(`/cell/${row.original.id}`)}
            >
              <FaArrowRight size={20} className="text-[#6950E8]" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={cell} />;
};

export default CellList;
