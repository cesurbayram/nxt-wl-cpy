import PageWrapper from "@/components/shared/page-wrapper"
import UserList from "@/components/user/user-list";
import { HiUsers } from "react-icons/hi";


const Page = () => {
    return(
        <PageWrapper
            buttonText="Add New User"
            pageTitle="Users"
            icon={<HiUsers size={24} color="#6950e8" />}            
        >
            <UserList />
        </PageWrapper>
    )
}

export default Page