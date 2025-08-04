"use client";
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
import { HiDocumentReport } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import { usePathname } from "next/navigation";
import { FaUsersCog, FaUsers, FaUserTag } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";

const sideMenuItems = [
  {
    title: "Home",
    icon: <IoMdHome size={16} />,
    link: "/",
    childPages: [],
  },
  {
    title: "Administration",
    icon: <FaUsersCog size={16} />,
    link: "",
    childPages: [
      {
        title: "Employees",
        link: "/employees",
        icon: <FaUsers size={15} />,
      },
      {
        title: "Employee Roles",
        link: "/employee-roles",
        icon: <FaUserTag size={15} />,
      },
      {
        title: "Users",
        link: "/user",
        icon: <FaUser size={15} />,
      },
    ],
  },
  {
    title: "Location",
    link: "",
    icon: <FaLocationDot size={16} />,
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
    icon: <GiRobotGrab size={16} />,
    link: "/controller",
    childPages: [],
  },
  {
    title: "Process",
    icon: <MdCalendarViewWeek size={16} />,
    link: "",
    childPages: [
      {
        title: "Shift",
        link: "/shift",
        icon: <MdCalendarViewWeek size={15} />,
      },
      {
        title: "Reports",
        link: "/shift/reports",
        icon: <HiDocumentReport size={15} />,
      },
      {
        title: "Mail Schedule",
        link: "/mail-schedule",
        icon: <MdEmail size={15} />,
      },
    ],
  },
  // {
  //   title: "Arc Welding",
  //   icon: <GiLightningArc size={16} />,
  //   link: "#",
  //   childPages: [],
  //   isDisabled: true,
  // },
  // {
  //   title: "Spot Welding",
  //   icon: <FaHubspot size={16} />,
  //   link: "#",
  //   childPages: [],
  //   isDisabled: true,
  // },
  // {
  //   title: "Automated QSet",
  //   icon: <GiAutomaticSas size={16} />,
  //   link: "#",
  //   childPages: [],
  //   isDisabled: true,
  // },
  {
    title: "Quick Assist",
    icon: <FaQuestionCircle size={16} />,
    link: "/quick-assist",
    childPages: [],
  },
  {
    title: "Notification",
    icon: <IoIosNotifications size={16} />,
    link: "/notifications",
    childPages: [],
  },
  {
    title: "Setting",
    icon: <IoIosSettings size={16} />,
    link: "#",
    childPages: [],
  },
];

const SideNavbarBody = () => {
  const pathname = usePathname();

  const isActive = (link: string) => {
    if (link === "/") return pathname === "/";
    return pathname.startsWith(link);
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Dashboard
        </h3>
      </div>

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
          const active = isActive(item.link);
          const disabled = item.link === "#";

          return (
            <div key={item.title} className="relative">
              <Button
                asChild
                variant={"ghost"}
                className={`
                  group relative w-full h-11 px-3 mb-1
                  flex justify-start items-center gap-3
                  rounded-xl transition-all duration-200
                  text-sm font-medium
                  ${
                    active
                      ? "bg-gradient-to-r from-[#6950e8]/10 to-[#6950e8]/5 text-[#6950e8] border-r-2 border-[#6950e8]"
                      : disabled
                      ? "text-slate-400 cursor-not-allowed opacity-60"
                      : "text-slate-600 hover:text-[#6950e8] hover:bg-slate-50"
                  }
                  ${
                    !disabled && !active
                      ? "hover:translate-x-1 hover:shadow-sm"
                      : ""
                  }
                `}
              >
                <Link
                  href={disabled ? "#" : item.link || "#"}
                  className={`flex items-center gap-3 w-full ${
                    disabled ? "pointer-events-none" : ""
                  }`}
                >
                  <div
                    className={`
                    flex items-center justify-center w-5 h-5
                    transition-all duration-200
                    ${active ? "scale-110" : "group-hover:scale-105"}
                  `}
                  >
                    {item.icon}
                  </div>

                  <span className="flex-1">{item.title}</span>

                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6950e8] rounded-r-full" />
                  )}
                </Link>
              </Button>
            </div>
          );
        }
      })}
    </div>
  );
};

export default SideNavbarBody;
