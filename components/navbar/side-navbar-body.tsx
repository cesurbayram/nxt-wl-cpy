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
import { FaUsersCog } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";

interface ChildPage {
  title: string;
  link: string;
  icon: React.ReactElement;
}

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  link: string;
  childPages: ChildPage[];
  isDisabled?: boolean;
}

const sideMenuItems: MenuItem[] = [
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
    title: "System Expectations",
    icon: <MdOutlineSettingsBackupRestore size={16} />,
    link: "/system-expectations",
    childPages: [],
  },
  {
    title: "Preventive Maintenance",
    icon: <GiLightningArc size={16} />,
    link: "/predictive-maintenance",
    childPages: [],
  },
  {
    title: "Predictive Quality",
    icon: <FaHubspot size={16} />,
    link: "/predictive-quality",
    childPages: [],
  },
  {
    title: "Automated QSet",
    icon: <GiAutomaticSas size={16} />,
    link: "/automated-qset",
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
  {
    title: "Quick Assist",
    icon: <FaQuestionCircle size={16} />,
    link: "/quick-assist",
    childPages: [],
  },
  {
    title: "System Reports",
    icon: <HiDocumentReport size={16} />,
    link: "/system-reports",
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
    isDisabled: true,
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
          const disabled = item.isDisabled || item.link === "#";

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
