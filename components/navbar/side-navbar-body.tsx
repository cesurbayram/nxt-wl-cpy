import { FaUser } from "react-icons/fa";
import { Button } from "../ui/button";
import { GiRobotGrab } from "react-icons/gi";
import Link from "next/link";
import CollapsibleButton from "./collapsible-button";
import { FaLocationDot } from "react-icons/fa6";
import { MdFactory } from "react-icons/md";
import { FaLinesLeaning } from "react-icons/fa6";
import { FaTableCellsLarge } from "react-icons/fa6";

const sideMenuItems = [
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
        icon: <MdFactory size={15} />
      },
      {
        title: "Line",
        link: "/line",
        icon: <FaLinesLeaning size={15} />
      },
      {
        title: "Cell",
        link: "/cell",
        icon: <FaTableCellsLarge size={15} />
      },
    ],
  },
  {
    title: "Controllers",
    icon: <GiRobotGrab size={15} />,
    link: "/controller",
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
          )
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
      
                      `}
            >
              <Link href={item.link}>
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
