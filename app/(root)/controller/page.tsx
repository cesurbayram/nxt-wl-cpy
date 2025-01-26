"use client"
import React, { useEffect, useState } from "react";
import ControllerList from "@/components/controller/controller-list";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper"
// import { Robot } from "@/types/robot.types";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GiRobotGrab } from "react-icons/gi";
import { deleteController, getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import Timer from "@/components/shared/timer";

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
    const [controller, setController] = useState<Controller[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const listController = async () => {
        try {
            controller.length === 0 && setLoading(true)
            const controllerRes = await getController();
            setController(controllerRes);            
        } catch (error) {
            console.error('/api/controller: ', error)            
        } finally {
            controller.length === 0 && setLoading(false)
        }
    }

    useEffect(() => {
        listController()
    }, [])
    

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
        <LoadingUi isLoading={loading || isPending} />
        <PageWrapper
            buttonText="Add New Controller"
            pageTitle="Controllers"
            icon={<GiRobotGrab size={24} color="#6950e8" />}
            buttonAction={handleRouteControllerCreate}
        >
            <div className="w-1/3 px-6 mb-2">
                <Timer callback={listController} />
            </div>
            <ControllerList controller={controller || []} deleteClick={deleteMutation}/>
        </PageWrapper>
        </>
    )
}

export default Page;