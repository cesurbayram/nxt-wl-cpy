import { DataTable } from "@/components/shared/data-table"
import { InputOutput } from "@/types/inputoutput.types"
import { ColumnDef } from "@tanstack/react-table"

const InputOutputList = () => {
    
    const columns: ColumnDef<InputOutput>[] = [
        {
            accessorKey: 'signalBitNumber',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Signal Bit Number</h1>
            ),                        
        },
        {
            accessorKey: 'name',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Name</h1>
            ),                        
        },
        {
            accessorKey: 'activity',
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Activity</h1>
            ),                        
        },
    ]
    
    return(
        <DataTable
            columns={columns}
            data={[]} 
        />
    )
}

export default InputOutputList;