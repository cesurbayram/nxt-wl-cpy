import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import AlarmList from "./alarm-list"

const alarms = [
    {
        code: '1325',
        alarm: 'Level 1 to 3 (Major Alarm)',
        detected: 'Dec 18, 2023, 11:47:25 AM',
        removed: 'Dec 18, 2023, 11:50:00 AM',
        text: 'COMMUNICATION ERROR(ENCODER)',
        originDate: '2023/12/18 11:47',
        priority: 1
    },
    {
        code: '4511',
        alarm: 'Level 4 to 7 (Minor Alarm)',
        detected: 'Nov 22, 2023, 1:23:57 PM',
        removed: 'Nov 22, 2023, 1:23:59 PM',
        text: 'OUT OF RANGE(DROP - VALUE)',
        originDate: '2023/11/22 11:24',
        priority: 2
    },
]

const almistAlarm = [    
    {
        code: '4511',
        alarm: 'Level 4 to 7 (Minor Alarm)',
        detected: 'Nov 22, 2023, 1:23:57 PM',
        removed: 'Nov 22, 2023, 1:23:59 PM',
        text: 'OUT OF RANGE(DROP - VALUE)',
        originDate: '2023/11/22 11:24',
        priority: 3
    },
]


const Alarm = () => {

    return(
        
        <Tabs defaultValue="detected" className="grid grid-cols-5 gap-3" orientation="vertical" >
            <TabsList className="flex flex-col h-fit border-2 gap-1">
                <TabsTrigger value="detected" className="w-full">Detected</TabsTrigger>
                <TabsTrigger value="almhist" className="w-full">ALMHIST.DAT</TabsTrigger>
            </TabsList>
            <TabsContent value="detected" className="col-span-4">
                <AlarmList alarms={alarms} />
            </TabsContent>
            <TabsContent value="almhist" className="col-span-4">
                <AlarmList alarms={almistAlarm} />
            </TabsContent>
        </Tabs>
        
    )
}

export default Alarm;