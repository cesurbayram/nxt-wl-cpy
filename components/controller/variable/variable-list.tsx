import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface VariableListProps {
    variables: Variable[]
}


const VariableList = ({ variables }: VariableListProps) => {
    
    const columns: ColumnDef<Variable>[] = [
        
        {
            accessorKey: 'no',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">No</h1>
            ),
        },
        {
            accessorKey: 'value',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Value</h1>
            ),
        },
        {
            accessorKey: 'name',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Name</h1>
            ),
        },
    ]
    
    
    return(
        <DataTable columns={columns} data={variables} />
    )
}

export default VariableList;