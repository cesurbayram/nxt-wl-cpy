"use client"
import ControllerList from "@/components/controller/controller-list";
import PageWrapper from "@/components/shared/page-wrapper"
import { Robot } from "@/types/robot.types";
import { useRouter } from "next/navigation";
import { GiRobotGrab } from "react-icons/gi";

export const controllers: Robot[] = [
    {
        id: '1',
        intervalMs: 10,
        ipAddress: '127.0.25.2',
        location: 'TOYOTETSU/X550/CELL 1',
        name: 'Controller 1',
        maxConnection: 10,
        model: 'YRC1000',
        serialNumber: '287',
        status: 'Active',
        controllerStatus: {
            alarm: true,
            cycle: 'AUTO',
            doorOpen: false,
            error: true,
            hold: true,
            maintenance: 20000,
            operating: false,
            safeSpeed: true,
            servo: false,
            stop: true,
            teach: 'PLAY'           
        }
    }
]


const Page = () => {
    const router = useRouter();
    
    const handleRouteControllerCreate = () => {
        router.push('/controller/0')
    }
    
    return(
        <PageWrapper
            buttonText="Add New Controller"
            pageTitle="Controllers"
            icon={<GiRobotGrab size={24} color="#6950e8" />}
            buttonAction={handleRouteControllerCreate}
        >
            <ControllerList controllers={controllers || []} />
        </PageWrapper>
    )
}

export default Page;