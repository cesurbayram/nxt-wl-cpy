import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputOutputList from "./input-output-list";

const inputOutputMenu = [
    {
        label: 'External Input',
        value: 'extInput'
    },
    {
        label: 'External Output',
        value: 'extOutput'
    },
    {
        label: 'Universal Input',
        value: 'univInput'
    },
    {
        label: 'Universal Output',
        value: 'univOutput'
    },
    {
        label: 'Spesific Input',
        value: 'spesInput'
    },
    {
        label: 'Spesific Output',
        value: 'spesOutput'
    },
    {
        label: 'Auxiliary Relay',
        value: 'auxRel'
    },
    {
        label: 'Control Status',
        value: 'contStat'
    },
    {
        label: 'Pseudo Input',
        value: 'pseInput'
    },
    {
        label: 'Network Input',
        value: 'netInput'
    },
    {
        label: 'Network Output',
        value: 'netOutput'
    },
    {
        label: 'Registers',
        value: 'register'
    },
]

const InputOutput = () => {
    return(
        <Tabs defaultValue="detected" className="grid grid-cols-7 gap-3" orientation="vertical" >
            <TabsList className="flex flex-col h-fit border-2 gap-1">                
                {inputOutputMenu.map((item) => <TabsTrigger key={item.value} value={item.value} className="w-full">{item.label}</TabsTrigger>)}
            </TabsList>
            <TabsContent value="extInput" className="col-span-6 grid grid-cols-2">
                <div className="col-span-4">
                    <InputOutputList />
                </div>
                {/* <div className="col-span-2">
                    <div />
                </div> */}
            </TabsContent>                        
        </Tabs>
    )
}

export default InputOutput;