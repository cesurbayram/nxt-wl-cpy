"use client"
import React, { Fragment } from "react";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdFactory } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteFactory, getFactory } from "@/utils/service/factory";
import { Factory } from "@/types/factory.types";
import FactoryList from "@/components/factory/factory-list";

const Page = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: factory, isLoading } = useQuery<Factory[], string>({
        queryFn: () => getFactory(),
        queryKey: ["factory"]
    });

    const { mutateAsync: deleteMutation, isPending } = useMutation({
        mutationFn: ({ id }: Factory) => deleteFactory({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["factory"] });
        }
    });

    const handleRouteLineCreate = () => {
        router.push('/factory/0');
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
