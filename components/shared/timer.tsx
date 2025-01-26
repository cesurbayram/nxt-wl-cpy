import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"

const Timer = ({ callback }: { callback: any }) => {
    const [selectedVal, setSelectedVal] = useState<string>("false");

    const handleChange = (value: string) => {
        setSelectedVal(value)
    }

    console.log('selectedVal', selectedVal);

    useEffect(() => {
        if(selectedVal !== "false"){
            const interval = setInterval(() => callback(), Number(selectedVal))
            return () => {
                clearInterval(interval)
            }
        }
    }, [selectedVal])
    
    return(
        <div className="flex items-center gap-2">
            <label>Timer</label>
            <Select
                value={selectedVal}
                onValueChange={handleChange}            
            >
                <SelectTrigger>
                    <SelectValue placeholder="Activate Timer" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Times</SelectLabel>
                        <SelectItem value="false">Disable</SelectItem>
                        <SelectItem value={"1000"}>1000ms</SelectItem>
                        <SelectItem value={"2000"}>2000ms</SelectItem>
                        <SelectItem value={"3000"}>3000ms</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>   
    )
}


export default Timer;