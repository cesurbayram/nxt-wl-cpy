import { User } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { DataTable } from "../shared/data-table";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

interface UserListNewProps {
  users: User[];
  deleteClick: any;
}

const UserListNew = ({ users, deleteClick }: UserListNewProps) => {
  const router = useRouter();
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: () => <div className="text-sm font-medium">Name</div>,
      cell: ({ row }) => {
        const name = row.original.name;
        const lastName = row.original.lastName;
        return <p>{`${name} ${lastName}`}</p>;
      },
    },
    {
      accessorKey: "userName",
      header: () => <div className="text-sm font-medium">User Name</div>,
    },
    {
      accessorKey: "email",
      id: "email",
      header: () => <div className="text-sm font-medium">Email</div>,
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
      accessorKey: "employee",
      header: () => <div className="text-sm font-medium">Employee</div>,
      cell: ({ row }) => {
        const employee = row.original.employee;
        if (employee) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {employee.name} {employee.last_name}
              </span>
              <span className="text-xs text-gray-500">
                #{employee.employee_code}
              </span>
              <span className="text-xs text-gray-500">
                {employee.department}
              </span>
            </div>
          );
        }
        return (
          <Badge variant="outline" className="text-xs">
            No Employee
          </Badge>
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
              onClick={() => router.push(`/user/${row.original.id}`)}
            >
              <FaArrowRight size={20} className="text-[#6950E8]" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={users} />;
};

export default UserListNew;
