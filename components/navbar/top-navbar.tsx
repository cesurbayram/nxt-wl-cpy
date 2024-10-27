import { FaSearch } from "react-icons/fa";
import { Button } from "../ui/button";
import { MdLightMode } from "react-icons/md";
import { MdLanguage } from "react-icons/md";
import UserProfileButton from "./user-profile-button";

const TopNavbar = () => {
    return (
        <div className="py-4 flex justify-between">
            
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
                
                <UserProfileButton />
            </div>            
        </div>
    )
}

export default TopNavbar