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

interface ControllerStatusBarProps {
  controllerStatus: ControllerStatus;
}

const ControllerStatusBar = ({
  controllerStatus,
}: ControllerStatusBarProps) => {
  const getTeachIcon = () => {
    switch (controllerStatus.teach) {
      case "TEACH":
        return <FaRegHandLizard size={26} color="green" />;
      case "PLAY":
        return <BsTropicalStorm size={26} color="green" />;
      case "REMOTE":
        return <FaExternalLinkAlt size={26} color="green" />;
      default:
        return null;
    }
  };

  const getCycleIcon = () => {
    switch (controllerStatus.cycle) {
      case "CYCLE":
        return <GrPowerCycle size={26} color="green" />;
      case "STEP":
        return <DiSublime size={26} color="green" />;
      case "AUTO":
        return <MdOutlineHdrAuto size={26} color="green" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6 items-center px-5 -mt-1">
      <div className="flex flex-col items-center">
        <GrConnect
          color={controllerStatus?.connection ? "green" : "red"}
          size={26}
        />
        <p className="text-xs">Connection</p>
      </div>
      {getTeachIcon() && (
        <div className="flex flex-col items-center">
          {getTeachIcon()}
          <p className="text-xs">{controllerStatus.teach}</p>
        </div>
      )}
      <div className="flex flex-col items-center">
        <PiLightning
          color={controllerStatus?.servo ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Servo</p>
      </div>
      <div className="flex flex-col items-center">
        <GiRobotGrab
          color={controllerStatus?.operating ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Operating</p>
      </div>
      {getCycleIcon() && (
        <div className="flex flex-col items-center">
          {getCycleIcon()}
          <p className="text-xs">{controllerStatus.cycle}</p>
        </div>
      )}
      <div className="flex flex-col items-center">
        <MdOutlinePlayCircle
          color={controllerStatus?.hold ? "#F1C40F" : "gray"}
          size={26}
        />
        <p className="text-xs">Hold</p>
      </div>
      <div className="flex flex-col items-center">
        <RiAlarmWarningLine
          color={controllerStatus?.alarm ? "red" : "gray"}
          size={26}
        />
        <p className="text-xs">Alarm</p>
      </div>
      <div className="flex flex-col items-center">
        <BiError color={controllerStatus?.error ? "red" : "gray"} size={26} />
        <p className="text-xs">Error</p>
      </div>
      <div className="flex flex-col items-center">
        <BsSignStopFill
          color={controllerStatus?.stop ? "red" : "lightgray"}
          size={26}
        />
        <p className="text-xs">Stop</p>
      </div>
      <div className="flex flex-col items-center">
        <BsDoorOpen
          color={controllerStatus?.doorOpen ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Door Opened</p>
      </div>
      {/* <div className="flex flex-col items-center">
        <MdOutlineSignalCellularAlt
          color={controllerStatus?.safeSpeed ? "green" : "gray"}
          size={26}
        />
        <p className="text-xs">Safe Speed</p>
      </div> */}
      <div className="flex flex-col items-center">
        <DiBootstrap
          color={controllerStatus?.cBackup ? "green" : "lightgray"}
          size={32}
        />
        <p className="text-xs">Backup</p>
      </div>
    </div>
  );
};

export default ControllerStatusBar;
