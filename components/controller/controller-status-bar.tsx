import { RiAlarmWarningLine } from "react-icons/ri";
import { BsDoorOpen } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";
import { MdOutlinePlayCircle } from "react-icons/md";
import { GiRobotLeg } from "react-icons/gi";
import { MdOutlineSignalCellularAlt } from "react-icons/md";
import { PiLightning } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { FaRegHandLizard } from "react-icons/fa6";
import { GrPowerCycle } from "react-icons/gr";
import { ControllerStatus } from "@/types/controllerStatus.types";

interface ControllerStatusBarProps {
    controllerStatus: ControllerStatus
}

const ControllerStatusBar = ({ controllerStatus }: ControllerStatusBarProps) => {
  return (
    <div className="flex gap-6 items-center px-5 -mt-1">
      <div className="flex flex-col items-center">
        <RiAlarmWarningLine
          color={controllerStatus?.alarm ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Alarm</p>
      </div>
      <div className="flex flex-col items-center">
        <BsDoorOpen
          color={controllerStatus?.doorOpen ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Door Opened</p>
      </div>
      <div className="flex flex-col items-center">
        <MdErrorOutline
          color={controllerStatus?.error ? "red" : "gray"}
          size={26}
        />
        <p className="text-xs">Error</p>
      </div>
      <div className="flex flex-col items-center">
        <MdOutlinePlayCircle
          color={controllerStatus?.hold ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Hold</p>
      </div>
      <div className="flex flex-col items-center">
        <GiRobotLeg
          color={controllerStatus?.operating ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Operating</p>
      </div>
      <div className="flex flex-col items-center">
        <MdOutlineSignalCellularAlt
          color={controllerStatus?.safeSpeed ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Safe Speed</p>
      </div>
      <div className="flex flex-col items-center">
        <PiLightning
          color={controllerStatus?.servo ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Servo</p>
      </div>
      <div className="flex flex-col items-center">
        <IoWarningOutline
          color={controllerStatus?.stop ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Stop</p>
      </div>
      <div className="flex flex-col items-center">
        <FaRegHandLizard color="green" size={26} />
        <p className="text-xs">Teach</p>
      </div>

      <div className="flex flex-col items-center">
        <GrPowerCycle color="green" size={26} />
        <p className="text-xs">Cycle</p>
      </div>
    </div>
  );
};

export default ControllerStatusBar;
