"use client"
import React from "react";
import CellList from "@/components/cell/cell-list"
import LoadingUi from "@/components/shared/loading-ui"
import PageWrapper from "@/components/shared/page-wrapper"
import { FaTableCellsLarge } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCell, getCell } from "@/utils/service/cell";
import { Cell } from "@/types/cell.types";

const Page = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: cell, isLoading } = useQuery<Cell[], string>({
        queryFn: () => getCell(),
        queryKey: ["cell"]
    });

    const { mutateAsync: deleteMutation, isPending } = useMutation({
        mutationFn: ({id}: Cell) => deleteCell({id}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["cell"]})
        }
    })

    const handleRouteCellCreate = () => {
        router.push('/cell/0')
    }

    return (
        <>
            <LoadingUi isLoading={isLoading || isPending} />
            <PageWrapper
                buttonText="Add New Cell"
                pageTitle="Cells"
                icon={<FaTableCellsLarge size={24} color="#6950e8" />}
                buttonAction={handleRouteCellCreate}
            >
                <CellList cell={cell || []} deleteClick={deleteMutation}/>    
            </PageWrapper>
        </>
    )
}

export default Page;
