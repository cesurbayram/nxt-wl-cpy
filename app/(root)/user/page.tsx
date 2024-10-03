"use client"
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper"
import UserListNew from "@/components/user/user-list-new";
import { User } from "@/types/user.types";
import { deleteUser, getUser } from "@/utils/service/user";
import { useRouter } from "next/navigation";
import { HiUsers } from "react-icons/hi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";


const Page = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    
    const {data: users, isLoading} = useQuery<User[], string>({
        queryFn: () => getUser(),
        queryKey: ["users"]
    })

    const { mutateAsync: deleteMutation, isPending } = useMutation({
        mutationFn: ({id}: User) => deleteUser({id}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users"]})
        }
    })

    const handleRouteUserCreate = () => {
        router.push('/user/0')
    }
    
    return (
        <Fragment>
            <LoadingUi isLoading={isLoading || isPending} />
            <PageWrapper
                buttonText="Add New User"
                pageTitle="Users"
                icon={<HiUsers size={24} color="#6950e8" />}
                buttonAction={handleRouteUserCreate}
            >
                <UserListNew users={users || []} deleteClick={deleteMutation} />
            </PageWrapper>
        </Fragment>
    )
}

export default Page