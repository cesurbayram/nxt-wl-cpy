import { FaSearch } from "react-icons/fa";
import { Button } from "../ui/button";
import { MdLightMode } from "react-icons/md";
import { MdLanguage } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

const TopNavbar = () => {
    return (
        <div className="border-2 py-4 flex justify-between">
            
            <Button variant={'ghost'} size={'icon'} className="p-2 rounded-full">
                <FaSearch size={18} color="#6B7280" />
            </Button>

            <div>
                <Button variant={'ghost'} size={'icon'} className="p-2 rounded-full">
                    <MdLightMode size={24} color="orange" />
                </Button>
                <Button variant={'ghost'} size={'icon'} className="p-2 rounded-full">
                    <MdLanguage size={24} />
                </Button>
                <Button variant={'ghost'} size={'icon'} className="p-2 rounded-full">
                    <CgProfile size={24} />
                </Button>

            </div>
            
        </div>
    )
}

export default TopNavbar