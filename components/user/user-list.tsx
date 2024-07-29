"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MdDelete } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Input } from "../ui/input";
import DataTablePagination from "../shared/pagination";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { deleteUser, getUser } from "@/utils/service/user";
import { User } from "@/types/user.types";
import LoadingUi from "../shared/loading-ui";



const UserList = () => {
    const queryClient = useQueryClient()
  const {
    data: users,
    isLoading,
    isError,
    refetch
  } = useQuery<User[], string>({
    queryFn: async () => await getUser(),
    queryKey: ['users'],        
  });

  const { mutate, isLoading:isDeleteLoading } = useMutation({
    mutationFn: async({ id }: User) => await deleteUser({ id }),
    onSuccess: () => {
        queryClient.invalidateQueries(['users'])        
    },               
  })

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const deleteClick = (id: string) => {
    mutate({ id })
  }
    
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: () => (
        <h1 className="text-sm text-[#111827] font-semibold">Name</h1>
      ),
  
      cell: ({ row }) => {
        const name = row.original.name;
        const lastName = row.original.last_name;
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
                onClick={() => deleteClick(row.original.id || '')}
            >
              <MdDelete size={20} className="text-red-500" />
            </Button>
            <Button size="icon" variant="ghost">
              <FaArrowRight size={20} className="text-[#6950E8]" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    columns,
    data: users ?? [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <LoadingUi isLoading={isLoading || isDeleteLoading} />
      <div className="flex items-center py-4 px-3">
        <Input
          placeholder="Filter"
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((item) => (
              <TableRow key={item.id}>
                {item.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows?.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </>
  );
};

export default UserList;
