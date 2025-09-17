import { RiAlarmWarningLine } from "react-icons/ri";
import { BsDoorOpen } from "react-icons/bs";
//import { MdErrorOutline } from "react-icons/md";
import { MdOutlinePlayCircle } from "react-icons/md";
import { GiRobotLeg } from "react-icons/gi";
//import { MdOutlineSignalCellularAlt } from "react-icons/md";
import { PiLightning } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { FaRegHandLizard } from "react-icons/fa6";
import { GrPowerCycle } from "react-icons/gr";
import { ControllerStatus } from "@/types/controllerStatus.types";
import { MdOutlineHdrAuto } from "react-icons/md";
import { DiSublime } from "react-icons/di";
import { BsTropicalStorm } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";
import { DiBootstrap } from "react-icons/di";
import { BsSignStopFill } from "react-icons/bs";
import { GrConnect } from "react-icons/gr";
import { BiError } from "react-icons/bi";
import { GiRobotGrab } from "react-icons/gi";
import { FaRegStopCircle } from "react-icons/fa";

interface ControllerStatusBarProps {
  controllerStatus: ControllerStatus;
}

const ControllerStatusBar = ({
  controllerStatus,
}: ControllerStatusBarProps) => {
  const getTeachIcon = () => {
    switch (controllerStatus.teach) {
      case "TEACH":
        return <FaRegHandLizard className="w-5 h-5 sm:w-6 sm:h-6" color="green" />;
      case "PLAY":
        return <BsTropicalStorm className="w-5 h-5 sm:w-6 sm:h-6" color="green" />;
      case "REMOTE":
        return <FaExternalLinkAlt className="w-5 h-5 sm:w-6 sm:h-6" color="green" />;
      default:
        return null;
    }
  };

  const getCycleIcon = () => {
    switch (controllerStatus.cycle) {
      case "CYCLE":
        return <GrPowerCycle className="w-5 h-5 sm:w-6 sm:h-6" color="green" />;
      case "STEP":
        return <DiSublime className="w-5 h-5 sm:w-6 sm:h-6" color="green" />;
      case "AUTO":
        return <MdOutlineHdrAuto className="w-5 h-5 sm:w-6 sm:h-6" color="green" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2 sm:gap-4 lg:gap-6 items-center px-2 sm:px-5 -mt-1 w-full overflow-x-auto">
      <div className="flex flex-col items-center min-w-0">
        <GrConnect
          color={controllerStatus?.connection ? "green" : "red"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">
          <span className="sm:hidden">Conn</span>
          <span className="hidden sm:inline">Connection</span>
        </p>
      </div>
      {getTeachIcon() && (
        <div className="flex flex-col items-center min-w-0">
          {getTeachIcon()}
          <p className="text-xs whitespace-nowrap">{controllerStatus.teach}</p>
        </div>
      )}
      <div className="flex flex-col items-center min-w-0">
        <PiLightning
          color={controllerStatus?.servo ? "green" : "gray"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">Servo</p>
      </div>
      <div className="flex flex-col items-center min-w-0">
        <GiRobotGrab
          color={controllerStatus?.operating ? "green" : "gray"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">
          <span className="sm:hidden">Op</span>
          <span className="hidden sm:inline">Operating</span>
        </p>
      </div>
      {getCycleIcon() && (
        <div className="flex flex-col items-center min-w-0">
          {getCycleIcon()}
          <p className="text-xs whitespace-nowrap">{controllerStatus.cycle}</p>
        </div>
      )}
      <div className="flex flex-col items-center min-w-0">
        <FaRegStopCircle
          color={controllerStatus?.hold ? "#F1C40F" : "gray"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">Hold</p>
      </div>
      <div className="flex flex-col items-center min-w-0">
        <RiAlarmWarningLine
          color={controllerStatus?.alarm ? "red" : "gray"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">Alarm</p>
      </div>
      <div className="flex flex-col items-center min-w-0">
        <BiError 
          color={controllerStatus?.error ? "red" : "gray"} 
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" 
        />
        <p className="text-xs whitespace-nowrap">Error</p>
      </div>
      <div className="flex flex-col items-center min-w-0">
        <BsSignStopFill
          color={controllerStatus?.stop ? "red" : "lightgray"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">Stop</p>
      </div>
      <div className="flex flex-col items-center min-w-0">
        <BsDoorOpen
          color={controllerStatus?.doorOpen ? "red" : "gray"}
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
        />
        <p className="text-xs whitespace-nowrap">
          <span className="sm:hidden">Door</span>
          <span className="hidden sm:inline">Door Opened</span>
        </p>
      </div>
      <div className="flex flex-col items-center min-w-0">
        <DiBootstrap
          color={controllerStatus?.cBackup ? "green" : "lightgray"}
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
        />
        <p className="text-xs whitespace-nowrap">Backup</p>
      </div>
    </div>
  );
};

export default ControllerStatusBar;
