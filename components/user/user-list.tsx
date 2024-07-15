"use client"

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";


interface User {
    id: string;
    name: string;
    lastName: string;
    userName: string;
    email: string;
    role: string;
}

const users: User[] = [
    {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'johndoe@gmail.com',
        role: 'admin'
    },
    {
        id: '2',
        name: 'Test 1',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'test1@gmail.com',
        role: 'support'
    },
    {
        id: '3',
        name: 'Test 2',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'test2@gmail.com',
        role: 'founder'
    },

]

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
    },
    {
        accessorKey: "userName",
        header: "Username",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role"
    }

]


const UserList = () => {

    const table = useReactTable({
        columns,
        data: users,
        getCoreRowModel: getCoreRowModel()
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((item) => (
                        <TableRow key={item.id}>
                            {item.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default UserList