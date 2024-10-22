"use client"
import React from "react";
import ControllerList from "@/components/controller/controller-list";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper"
// import { Robot } from "@/types/robot.types";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GiRobotGrab } from "react-icons/gi";
import { deleteController, getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";

// export const controllers: Robot[] = [
//     {
//         id: '1',
//         intervalMs: 10,
//         ipAddress: '127.0.25.2',
//         location: 'TOYOTETSU/X550/CELL 1',
//         name: 'Controller 1',
//         maxConnection: 10,
//         model: 'YRC1000',
//         serialNumber: '287',
//         status: 'Active',
//         controllerStatus: {
//             alarm: true,
//             cycle: 'AUTO',
//             doorOpen: false,
//             error: true,
//             hold: true,
//             maintenance: 20000,
//             operating: false,
//             safeSpeed: true,
//             servo: false,
//             stop: true,
//             teach: 'PLAY'           
//         }
//     }
// ]


const Page = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: controller, isLoading } = useQuery<Controller[], string>({
        queryFn: () => getController(),
        queryKey: ["controller"]
    });

    const { mutateAsync: deleteMutation, isPending } = useMutation({
        mutationFn: ({id}: Controller) => deleteController({id}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["controller"]})
        }
    })

    const handleRouteControllerCreate = () => {
        router.push('/controller/0')
    }
    
    return(
        <>
        <LoadingUi isLoading={isLoading || isPending} />
        <PageWrapper
            buttonText="Add New Controller"
            pageTitle="Controllers"
            icon={<GiRobotGrab size={24} color="#6950e8" />}
            buttonAction={handleRouteControllerCreate}
        >
            <ControllerList controller={controller || []} deleteClick={deleteMutation}/>
        </PageWrapper>
        </>
    )
}

export default Page;