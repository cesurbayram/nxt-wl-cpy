"use client"
import React, { Fragment } from "react";
import LineList from "@/components/line/line-list";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { FaLinesLeaning } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLine, getLine } from "@/utils/service/line";
import { Line } from "@/types/line.types";

const Page = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: line, isLoading } = useQuery<Line[], string>({
        queryFn: () => getLine(),
        queryKey: ["line"]
    });

    const { mutateAsync: deleteMutation, isPending } = useMutation({
        mutationFn: ({ id }: Line) => deleteLine({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["line"] });
        }
    });

    const handleRouteLineCreate = () => {
        router.push('/line/0');
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

export default Page
