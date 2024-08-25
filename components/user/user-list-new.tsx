import { User } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { DataTable } from "../shared/data-table";
import { useRouter } from "next/navigation";

interface UserListNewProps {
    users: User[];
    deleteClick: any
}


const UserListNew = ({ users, deleteClick }: UserListNewProps) => {    
    const router = useRouter()
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "fullName",
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Name</h1>
            ),

            cell: ({ row }) => {
                const name = row.original.name;
                const lastName = row.original.lastName;
                return <p>{`${name} ${lastName}`}</p>;
            },
        },
        {
            accessorKey: "user_name",
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">User Name</h1>
            ),
        },
        {
            accessorKey: "email",
            id: "email",
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold">Email</h1>
            ),
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant={"ghost"}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Role
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            id: "actions",
            header: () => (
                <h1 className="text-sm text-[#111827] font-semibold text-center">
                    Actions
                </h1>
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-3">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={async () => {
                                await deleteClick({id: row.original.id})
                            }}
                        >
                            <MdDelete size={20} className="text-red-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => router.push(`/user/${row.original.id}`)}>
                            <FaArrowRight size={20} className="text-[#6950E8]" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (        
        <DataTable columns={columns} data={users} />                    
    )
}

export default UserListNew