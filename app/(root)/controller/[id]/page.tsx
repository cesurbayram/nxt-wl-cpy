"use client"
import PageWrapper from "@/components/shared/page-wrapper";
import ControllerStatusBar from "@/components/controller/controller-status-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlarmList from "@/components/controller/alarm/alarm-list";
import Alarm from "@/components/controller/alarm/alarm";
import { controllers } from "../page";
import { ControllerStatus } from "@/types/controllerStatus.types";
import InputOutput from "@/components/controller/input-output/input-output";

const tabItems = [
    {
        label: 'Alarms',
        value: 'alarm'
    },
    {
        label: 'Monitoring',
        value: 'monitoring'
    },
    {
        label: 'I/O',
        value: 'inputOutput'
    },
    {
        label: 'Variables',
        value: 'variable'
    },
    {
        label: 'Data',
        value: 'data'
    },
    {
        label: 'Job',
        value: 'job'
    },
    {
        label: 'Files',
        value: 'file'
    },
    {
        label: 'Utilization',
        value: 'util'
    },
    {
        label: 'Maintenance',
        value: 'maintenance'
    },
    {
        label: 'Camera',
        value: 'camera'
    },
    {
        label: 'Remote Pendant',
        value: 'remotePend'
    }
]


const Page = ({ params }: { params: { id: string } }) => {

    const controller = controllers.find((item) => item.id == params.id)
  
    return (
        <PageWrapper
            shownHeaderButton={false}
            pageTitle={params.id != "0" ? `Controller: ${controller?.name}` : "Create Controller"}
        >
            {controller && <ControllerStatusBar controllerStatus={controller?.controllerStatus as ControllerStatus} />}
            <Tabs defaultValue="alarm" className="mt-5 w-full">
                <TabsList className="w-full flex">
                    {tabItems.map((item) => (
                        <TabsTrigger
                            key={item.value}
                            className="flex-1 transition-all"
                            value={item.value}
                        >
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="alarm">
                    <Alarm />
                </TabsContent>
                <TabsContent value="inputOutput">
                    <InputOutput />
                </TabsContent>
            </Tabs>
        </PageWrapper>
  );
};

export default Page;
