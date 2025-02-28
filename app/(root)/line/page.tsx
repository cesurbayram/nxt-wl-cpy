"use client";
import React, { Fragment, useState, useEffect } from "react";
import LineList from "@/components/line/line-list";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { FaLinesLeaning } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { deleteLine, getLine } from "@/utils/service/line";
import { Line } from "@/types/line.types";

const Page = () => {
  const router = useRouter();
  const [line, setLine] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const fetchLines = async () => {
    try {
      const data = await getLine();
      setLine(data);
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const deleteMutation = async ({ id }: Line) => {
    setIsPending(true);
    try {
      await deleteLine({ id });
      await fetchLines();
    } catch (error) {
      console.error("Failed to delete line:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRouteLineCreate = () => {
    router.push("/line/0");
  };

  return (
    <Fragment>
      <LoadingUi isLoading={isLoading || isPending} />
      <PageWrapper
        buttonText="Add New Line"
        pageTitle="Lines"
        icon={<FaLinesLeaning size={24} color="#6950e8" />}
        buttonAction={handleRouteLineCreate}
      >
        <LineList line={line || []} deleteClick={deleteMutation} />
      </PageWrapper>
    </Fragment>
  );
};

export default Page;
