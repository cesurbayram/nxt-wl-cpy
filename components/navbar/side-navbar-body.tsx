import { FaUser } from "react-icons/fa";
import { Button } from "../ui/button";
import { GiRobotGrab } from "react-icons/gi";
import Link from "next/link";
import CollapsibleButton from "./collapsible-button";
import { FaLocationDot } from "react-icons/fa6";
import { MdFactory } from "react-icons/md";
import { FaLinesLeaning } from "react-icons/fa6";
import { FaTableCellsLarge } from "react-icons/fa6";
import { IoMdHome } from "react-icons/io";
import { FaHubspot } from "react-icons/fa";
import { GiLightningArc } from "react-icons/gi";
import { GiAutomaticSas } from "react-icons/gi";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { IoIosNotifications } from "react-icons/io";
import { MdCalendarViewWeek } from "react-icons/md";

const sideMenuItems = [
  {
    title: "Home",
    icon: <IoMdHome size={15} />,
    link: "/",
    childPages: [],
  },
  {
    title: "Users",
    icon: <FaUser size={15} />,
    link: "/user",
    childPages: [],
  },
  {
    title: "Location",
    link: "",
    icon: <FaLocationDot size={15} />,
    childPages: [
      {
        title: "Factory",
        link: "/factory",
        icon: <MdFactory size={15} />,
      },
      {
        title: "Line",
        link: "/line",
        icon: <FaLinesLeaning size={15} />,
      },
      {
        title: "Cell",
        link: "/cell",
        icon: <FaTableCellsLarge size={15} />,
      },
    ],
  },
  {
    title: "Controllers",
    icon: <GiRobotGrab size={15} />,
    link: "/controller",
    childPages: [],
  },
  {
    title: "Shift Management",
    icon: <MdCalendarViewWeek size={15} />,
    link: "/shift",
    childPages: [],
  },
  {
    title: "Arc Welding",
    icon: <GiLightningArc size={15} />,
    link: "#",
    childPages: [],
  },
  {
    title: "Spot Welding",
    icon: <FaHubspot size={15} />,
    link: "#",
    childPages: [],
  },
  {
    title: "Automated QSet",
    icon: <GiAutomaticSas size={15} />,
    link: "#",
    childPages: [],
  },
  {
    title: "Product",
    icon: <MdProductionQuantityLimits size={15} />,
    link: "#",
    childPages: [],
  },
  {
    title: "Notification",
    icon: <IoIosNotifications size={15} />,
    link: "#",
    childPages: [],
  },
  {
    title: "Setting",
    icon: <IoIosSettings size={15} />,
    link: "#",
    childPages: [],
  },
];

const SideNavbarBody = () => {
  return (
    <div className="flex flex-col">
      <p className="text-sm font-semibold mb-3">DASHBOARD</p>

      {sideMenuItems.map((item) => {
        if (item.childPages?.length > 0) {
          return (
            <CollapsibleButton
              key={item.title}
              parentIcon={item.icon}
              parentTitle={item.title}
              childPages={item.childPages}
            />
          );
        } else {
          return (
            <Button
              asChild
              key={item.title}
              variant={"ghost"}
              className={`                    
                          flex
                          mb-1 
                          justify-start
                          items-center
                          gap-3
                          rounded-lg
                          hover:text-[#6950e8]
                          text-sm
                          text-[#6B7280]
                          ${
                            item.link === "#"
                              ? "pointer-events-none opacity-70"
                              : ""
                          }
                      `}
            >
              <Link href={item.link || "#"}>
                {item.icon}
                {item.title}
              </Link>
            </Button>
          );
        }
      })}
    </div>
  );
};

export default SideNavbarBody;
