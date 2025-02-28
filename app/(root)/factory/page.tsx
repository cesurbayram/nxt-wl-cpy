"use client";
import React, { Fragment, useState, useEffect } from "react";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdFactory } from "react-icons/md";
import { useRouter } from "next/navigation";
import { deleteFactory, getFactory } from "@/utils/service/factory";
import { Factory } from "@/types/factory.types";
import FactoryList from "@/components/factory/factory-list";

const Page = () => {
  const router = useRouter();
  const [factory, setFactory] = useState<Factory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const fetchFactories = async () => {
    try {
      const data = await getFactory();
      setFactory(data);
    } catch (error) {
      console.error("Failed to fetch factories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  const deleteMutation = async ({ id }: Factory) => {
    setIsPending(true);
    try {
      await deleteFactory({ id });
      await fetchFactories();
    } catch (error) {
      console.error("Failed to delete factory:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRouteLineCreate = () => {
    router.push("/factory/0");
  };

  return (
    <Fragment>
      <LoadingUi isLoading={isLoading || isPending} />
      <PageWrapper
        buttonText="Add New Factory"
        pageTitle="Factories"
        icon={<MdFactory size={24} color="#6950e8" />}
        buttonAction={handleRouteLineCreate}
      >
        <FactoryList factory={factory || []} deleteClick={deleteMutation} />
      </PageWrapper>
    </Fragment>
  );
};

export default Page;
