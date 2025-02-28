"use client";
import React, { useState, useEffect } from "react";
import CellList from "@/components/cell/cell-list";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { FaTableCellsLarge } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { deleteCell, getCell } from "@/utils/service/cell";
import { Cell } from "@/types/cell.types";

const Page = () => {
  const router = useRouter();
  const [cell, setCell] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const fetchCells = async () => {
    try {
      const data = await getCell();
      setCell(data);
    } catch (error) {
      console.error("Failed to fetch cells:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCells();
  }, []);

  const deleteMutation = async ({ id }: Cell) => {
    setIsPending(true);
    try {
      await deleteCell({ id });
      await fetchCells();
    } catch (error) {
      console.error("Failed to delete cell:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRouteCellCreate = () => {
    router.push("/cell/0");
  };

  return (
    <>
      <LoadingUi isLoading={isLoading || isPending} />
      <PageWrapper
        buttonText="Add New Cell"
        pageTitle="Cells"
        icon={<FaTableCellsLarge size={24} color="#6950e8" />}
        buttonAction={handleRouteCellCreate}
      >
        <CellList cell={cell || []} deleteClick={deleteMutation} />
      </PageWrapper>
    </>
  );
};

export default Page;
