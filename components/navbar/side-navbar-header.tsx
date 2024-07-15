import Image from "next/image"
import { IoMdArrowRoundBack } from "react-icons/io";

const SideNavbarHeader = () => {
    return(
        <div className="flex items-center justify-between">
            <Image
                src={'/yaskawa-logo.png'}
                alt="logo"
                width={100}
                height={100}
            />
            <IoMdArrowRoundBack size={24} />
        </div>
    )
}

export default SideNavbarHeader