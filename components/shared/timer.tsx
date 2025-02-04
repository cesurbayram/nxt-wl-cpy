import { useEffect, useState } from "react";
import { RxCountdownTimer } from "react-icons/rx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const Timer = ({ callback }: { callback: any }) => {
  const [selectedVal, setSelectedVal] = useState<string>("false");

  const handleChange = (value: string) => {
    setSelectedVal(value);
  };

  const handleManualRefresh = () => {
    callback();
  };

  console.log("selectedVal", selectedVal);

  useEffect(() => {
    if (selectedVal !== "false") {
      const interval = setInterval(() => callback(), Number(selectedVal));
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedVal]);

  return (
    <div className="flex items-center gap-2">
      <label>Timer</label>
      <div className="flex items-center gap-2">
        <Select value={selectedVal} onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Activate Timer" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Times</SelectLabel>
              <SelectItem value="false">Disable</SelectItem>
              <SelectItem value={"100"}>100ms</SelectItem>
              <SelectItem value={"200"}>200ms</SelectItem>
              <SelectItem value={"300"}>1000ms</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <RxCountdownTimer
          size={24}
          className="text-primary cursor-pointer hover:opacity-70 transition-opacity"
          onClick={handleManualRefresh}
        />
      </div>
    </div>
  );
};

export default Timer;
