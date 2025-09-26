import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { Variable } from "@/types/variable.types";

interface VariableListProps {
  variables: Variable[];
}

const VariableList = ({ variables }: VariableListProps) => {
  const columns: ColumnDef<Variable>[] = [
    {
      accessorKey: "no",
      header: () => <div className="text-sm font-medium">No</div>,
    },
    {
      accessorKey: "value",
      header: () => <div className="text-sm font-medium">Value</div>,
    },
    /* {
      accessorKey: "name",
      header: () => <div className="text-sm font-medium">Name</div>,
    }, */
  ];

  return <DataTable columns={columns} data={variables} />;
};

export default VariableList;
