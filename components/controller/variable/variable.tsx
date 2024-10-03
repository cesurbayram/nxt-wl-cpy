import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VariableList from "./variable-list"

const tabItems = [
    {
        label: 'BYTE',
        value: 'byte'
    },
    {
        label: 'INTEGER',
        value: 'int'
    },
    {
        label: 'DOUBLE',
        value: 'double'
    },
    {
        label: 'REAL',
        value: 'real'
    },
    {
        label: 'STRING',
        value: 'string'
    },
    {
        label: 'POSITION',
        value: 'position'
    },
    {
        label: 'VAR.DAT',
        value: 'vardat'
    },
]

const byteList: Variable[] = [
    {
        no: '1',
        name: 'ABC',
        value: '0'
    },
    {
        no: '2',
        name: 'ABC',
        value: '1'
    },
    {
        no: '3',
        name: 'ABC',
        value: '1'
    },
]

const Variable = () => {
    return(
        <Tabs defaultValue="byte" className="grid grid-cols-5 gap-3" orientation="vertical" >
            <TabsList className="flex flex-col h-fit border-2 gap-1">
                {tabItems?.map((item) => (<TabsTrigger key={item.value} value={item.value} className="w-full">{item.label}</TabsTrigger>))}                
            </TabsList>
            {tabItems.map((item) => (
                <TabsContent value={item.value} key={item.value} className="col-span-4">
                    <VariableList variables={byteList} />
                </TabsContent>
            ))}                        
        </Tabs>
    )
}

export default Variable