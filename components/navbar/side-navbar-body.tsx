import { FaUser } from "react-icons/fa";
import { Button } from "../ui/button";
import { GiRobotGrab } from "react-icons/gi";
import Link from "next/link";

const sideMenuItems = [
    {
        title: "Users",
        icon: <FaUser size={15} />,
        link: '/user'
    },
    {
        title: "Controllers",
        icon: <GiRobotGrab size={15} />,
        link: '/controller'
    },

]

const SideNavbarBody = () => {
    return (
        <div className="flex flex-col">
            <p className="text-sm font-semibold mb-3">DASHBOARD</p>

            {sideMenuItems.map((item) => (
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
            ))}
        </div>
    )
}

export default SideNavbarBody